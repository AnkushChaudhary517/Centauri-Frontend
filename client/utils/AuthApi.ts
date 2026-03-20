import { getApiBaseUrl } from './ApiConfig';
const API_BASE_URL = getApiBaseUrl();

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface UpdateProfilePayload {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  contactNumber?: string;
  password: string;
}

type AuthApiResponse =
  | AuthTokens
  | {
      success?: boolean;
      message?: string;
      data?: {
        token?: string;
        refreshToken?: string;
        access_token?: string;
        refresh_token?: string;
      };
      token?: string;
      refreshToken?: string;
      access_token?: string;
      refresh_token?: string;
    };

function normalizeAuthTokens(response: AuthApiResponse): AuthTokens {
  const responseWithAliases = response as {
    token?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
    data?: {
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

  return { token, refreshToken };
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

export const getToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
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
    const tokens = normalizeAuthTokens(response);
    setTokens(tokens.token, tokens.refreshToken);
    return tokens;
  },
  register: async (email: string, password: string) => {
    const response = await apiCall<AuthApiResponse>('/auth/register', {
      method: 'POST',
      body: { email, password },
    });
    const tokens = normalizeAuthTokens(response);
    setTokens(tokens.token, tokens.refreshToken);
    return tokens;
  },
  socialLogin: async (provider: 'google' | 'facebook' | 'apple', idToken: string, accessToken?: string) => {
    const response = await apiCall<AuthApiResponse>(`/auth/social/${provider}`, {
      method: 'POST',
      body: { idToken, accessToken },
    });
    const tokens = normalizeAuthTokens(response);
    setTokens(tokens.token, tokens.refreshToken);
    return tokens;
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
    const tokens = normalizeAuthTokens(response);
    setTokens(tokens.token, tokens.refreshToken);
    return tokens;
  },
  exchangeFacebookToken: async (accessToken: string) => {
    const response = await apiCall<AuthApiResponse>('/auth/facebook/exchange', {
      method: 'POST',
      body: { accessToken },
    });
    const tokens = normalizeAuthTokens(response);
    setTokens(tokens.token, tokens.refreshToken);
    return tokens;
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
    try {
      return await postJson('/auth/updateprofile', payload);
    } catch (error) {
      if (error instanceof Error && /404|not found/i.test(error.message)) {
        return postJson('/auth/update-profile', payload);
      }
      throw error;
    }
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
  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const response = await apiCall<AuthApiResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
    const tokens = normalizeAuthTokens(response);
    setTokens(tokens.token, tokens.refreshToken);
    return tokens;
  },
  logout: async () => {
    await apiCall('/auth/logout', { method: 'POST' });
    clearTokens();
  },
};

export async function login(
  email: string,
  password: string
) : Promise<AuthTokens> {
  return authAPI.login(email, password);
}
