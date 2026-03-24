import { getApiBaseUrl } from './ApiConfig';
const API_BASE_URL = getApiBaseUrl();

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface AuthUser {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface AuthSession extends AuthTokens {
  user?: AuthUser | null;
}

export interface UpdateProfilePayload {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  contactNumber?: string;
  password: string;
}

async function postJsonWithFallback<T>(endpoints: string[], body: unknown): Promise<T> {
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      return await postJson<T>(endpoint, body);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      lastError = error;
      if (!/404|not found/i.test(error.message)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error('API request failed');
}

type AuthApiResponse =
  | AuthSession
  | {
      success?: boolean;
      message?: string;
      data?: {
        userId?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        profileImage?: string;
        token?: string;
        refreshToken?: string;
        access_token?: string;
        refresh_token?: string;
      };
      userId?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      profileImage?: string;
      token?: string;
      refreshToken?: string;
      access_token?: string;
      refresh_token?: string;
    };

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenValid(token?: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds;
}

export function getUserFromToken(token?: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return {
    userId:
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload.sub,
    email:
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      payload.email,
    firstName:
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] ||
      payload.given_name,
    lastName:
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] ||
      payload.family_name,
    profileImage: "",
  };
}

function normalizeAuthSession(response: AuthApiResponse): AuthSession {
  const responseWithAliases = response as {
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    token?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
    data?: {
      userId?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      profileImage?: string;
      token?: string;
      refreshToken?: string;
      access_token?: string;
      refresh_token?: string;
    };
    message?: string;
  };

  const token =
    responseWithAliases.token ??
    responseWithAliases.access_token ??
    responseWithAliases.data?.token ??
    responseWithAliases.data?.access_token;
  const refreshToken =
    responseWithAliases.refreshToken ??
    responseWithAliases.refresh_token ??
    responseWithAliases.data?.refreshToken ??
    responseWithAliases.data?.refresh_token;

  if (!token) {
    throw new Error(responseWithAliases.message || 'Authentication token missing from response');
  }

  const explicitUser: AuthUser = {
    userId: responseWithAliases.userId ?? responseWithAliases.data?.userId,
    email: responseWithAliases.email ?? responseWithAliases.data?.email,
    firstName: responseWithAliases.firstName ?? responseWithAliases.data?.firstName,
    lastName: responseWithAliases.lastName ?? responseWithAliases.data?.lastName,
    profileImage: responseWithAliases.profileImage ?? responseWithAliases.data?.profileImage ?? "",
  };

  const hasExplicitUser = Object.values(explicitUser).some(Boolean);
  const user = hasExplicitUser ? explicitUser : getUserFromToken(token);

  return { token, refreshToken, user };
}

async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: finalHeaders,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error?.message || data?.error || response.statusText || 'API request failed';
    throw new Error(errorMessage);
  }

  return data as T;
}

// Helper functions for localStorage
export function setTokens(token: string, refreshToken?: string): void {
  localStorage.setItem('token', token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

export function setStoredUser(user?: AuthUser | null): void {
  if (!user) {
    localStorage.removeItem('authUser');
    return;
  }
  localStorage.setItem('authUser', JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem('authUser');
    return null;
  }
}

export const getToken = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token && !isTokenValid(token)) {
    clearTokens();
    setStoredUser(null);
    return null;
  }
  return token;
};
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authUser');
};

export async function apiCall<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
  } = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = false,
  } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Always include Bearer token if available (after login)
  const token = getToken();
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiCall<AuthApiResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    const session = normalizeAuthSession(response);
    setTokens(session.token, session.refreshToken);
    setStoredUser(session.user);
    return session;
  },
  register: async (email: string, password: string) => {
    const response = await apiCall<AuthApiResponse>('/auth/register', {
      method: 'POST',
      body: { email, password },
    });
    const session = normalizeAuthSession(response);
    setTokens(session.token, session.refreshToken);
    setStoredUser(session.user);
    return session;
  },
  socialLogin: async (provider: 'google' | 'facebook' | 'apple', idToken: string, accessToken?: string) => {
    const response = await apiCall<AuthApiResponse>(`/auth/social/${provider}`, {
      method: 'POST',
      body: { idToken, accessToken },
    });
    const session = normalizeAuthSession(response);
    setTokens(session.token, session.refreshToken);
    setStoredUser(session.user);
    return session;
  },
  initiateGoogleSignIn: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  initiateFacebookSignIn: () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  },
  exchangeGoogleToken: async (idToken: string) => {
    const response = await apiCall<AuthApiResponse>('/auth/google/exchange', {
      method: 'POST',
      body: { idToken },
    });
    const session = normalizeAuthSession(response);
    setTokens(session.token, session.refreshToken);
    setStoredUser(session.user);
    return session;
  },
  exchangeFacebookToken: async (accessToken: string) => {
    const response = await apiCall<AuthApiResponse>('/auth/facebook/exchange', {
      method: 'POST',
      body: { accessToken },
    });
    const session = normalizeAuthSession(response);
    setTokens(session.token, session.refreshToken);
    setStoredUser(session.user);
    return session;
  },
  sendVerificationEmail: async (email: string) => {
    return apiCall('/auth/send-verification', {
      method: 'POST',
      body:  email ,
    });
  },
  verifyEmail: async (email: string, verificationCode: string) => {
    return apiCall('/auth/verify-email', {
      method: 'POST',
      body: { 
        email:email, code:verificationCode },
    });
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    return postJsonWithFallback(['/auth/updateprofile', '/auth/update-profile'], payload);
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/auth/change-password', {
      method: 'POST',
      body: { currentPassword:currentPassword, newPassword:newPassword },
    });
  },
  forgotPassword: async (email: string) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: email ,
    });
  },
  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: { email:email, resetToken:resetToken, newPassword:newPassword },
    });
  },
  addCredits: async () => {
    return postJsonWithFallback(
      ['/auth/add-credits', '/credits/add-credits', '/credits/add', '/auth/credits/add'],
      { plan: 'regular' }
    );
  },
  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const response = await apiCall<AuthApiResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
    const session = normalizeAuthSession(response);
    setTokens(session.token, session.refreshToken);
    setStoredUser(session.user);
    return session;
  },
  logout: async () => {
    await apiCall('/auth/logout', { method: 'POST' });
    clearTokens();
  },
};

export async function login(
  email: string,
  password: string
) : Promise<AuthSession> {
  return authAPI.login(email, password);
}
