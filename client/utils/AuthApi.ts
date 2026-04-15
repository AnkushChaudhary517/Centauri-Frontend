import { getApiBaseUrl } from './ApiConfig';
import { handleMockApiRequest, isMockApiEnabled } from '@/services/mockApi';
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

export interface SubscriptionPlanInput {
  planId: string;
  name: string;
  monthlyPrice: number;
  articleAnalysesPerMonth: number;
  billingCycle: "monthly";
}

export interface SubscriptionOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  planId: string;
  planName: string;
  monthlyPrice: number;
}

export interface VerifySubscriptionPaymentPayload {
  plan: SubscriptionPlanInput;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface CurrentSubscription {
  planId: string;
  name: string;
  priceLabel: string;
  monthlyPrice?: number;
  articleAnalysesPerMonth: number;
  billingCycle: "monthly";
  status?: string;
  renewalDate?: string | null;
}

export interface RemainingCredits {
  available: number;
  used?: number;
  total?: number;
  expiresAt?: string | null;
}

export const DEFAULT_TRIAL_SUBSCRIPTION: CurrentSubscription = {
  planId: "trial-14-day",
  name: "Free Trial",
  priceLabel: "5 credits for 14 days",
  monthlyPrice: 0,
  articleAnalysesPerMonth: 5,
  billingCycle: "monthly",
  status: "trial",
  renewalDate: null,
};

export const DEFAULT_TRIAL_CREDITS: RemainingCredits = {
  available: 5,
  used: 0,
  total: 5,
  expiresAt: null,
};

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

type ApiErrorPayload = {
  success?: boolean;
  data?: unknown;
  message?: string | null;
  error?: {
    code?: string | null;
    message?: string | null;
    statusCode?: number | null;
    details?: unknown;
  } | null;
};

const GENERIC_API_ERROR_MESSAGE = "Something went wrong. Please check logs.";

function parseApiError(data: unknown): { code?: string; message: string } {
  if (!data || typeof data !== "object") {
    return { message: GENERIC_API_ERROR_MESSAGE };
  }

  const payload = data as ApiErrorPayload;
  const code = payload.error?.code ?? undefined;
  const message = payload.error?.message;

  if (typeof message === "string" && message.trim()) {
    return {
      code: typeof code === "string" && code.trim() ? code : undefined,
      message: message.trim(),
    };
  }

  return { message: GENERIC_API_ERROR_MESSAGE };
}

function buildApiError(data: unknown): Error {
  const parsed = parseApiError(data);
  const error = new Error(parsed.message) as Error & { code?: string };
  if (parsed.code) {
    error.code = parsed.code;
  }
  return error;
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

async function requestJsonWithFallback<T>(
  endpoints: string[],
  options: {
    method?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      return await apiCall<T>(endpoint, {
        method: options.method ?? 'GET',
        body: options.body,
      });
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

type SubscriptionApiResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, any> | null;
  subscription?: Record<string, any> | null;
  currentSubscription?: Record<string, any> | null;
  plan?: Record<string, any> | null;
  [key: string]: unknown;
};

type CreditsApiResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, any> | null;
  credits?: Record<string, any> | null;
  remainingCredits?: Record<string, any> | null;
  [key: string]: unknown;
};

type RazorpayOrderApiResponse = {
  success?: boolean;
  message?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  data?: {
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
  };
  [key: string]: unknown;
};

const CURRENT_SUBSCRIPTION_STORAGE_KEY = 'currentSubscription';
const REMAINING_CREDITS_STORAGE_KEY = 'remainingCredits';
const SUBSCRIPTION_UPDATED_EVENT = 'centauri:subscription-updated';
const CREDITS_UPDATED_EVENT = 'centauri:credits-updated';
export const SESSION_EXPIRED_EVENT = 'centauri:session-expired';
export const SESSION_EXPIRED_MESSAGE_STORAGE_KEY = 'centauri:session-expired-message';
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

let isHandlingExpiredSession = false;

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

  const token = ensureSessionIsValid();
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: finalHeaders,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && token) {
    handleExpiredSession();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  if (!response.ok) {
    throw buildApiError(data);
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

export function setStoredSubscription(subscription?: CurrentSubscription | null): void {
  if (!subscription) {
    localStorage.removeItem(CURRENT_SUBSCRIPTION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SUBSCRIPTION_UPDATED_EVENT));
    return;
  }

  localStorage.setItem(CURRENT_SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  window.dispatchEvent(new CustomEvent(SUBSCRIPTION_UPDATED_EVENT, { detail: subscription }));
}

export function getStoredSubscription(): CurrentSubscription | null {
  const raw = localStorage.getItem(CURRENT_SUBSCRIPTION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentSubscription;
  } catch {
    localStorage.removeItem(CURRENT_SUBSCRIPTION_STORAGE_KEY);
    return null;
  }
}

export function setStoredRemainingCredits(credits?: RemainingCredits | null): void {
  if (!credits) {
    localStorage.removeItem(REMAINING_CREDITS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CREDITS_UPDATED_EVENT));
    return;
  }

  localStorage.setItem(REMAINING_CREDITS_STORAGE_KEY, JSON.stringify(credits));
  window.dispatchEvent(new CustomEvent(CREDITS_UPDATED_EVENT, { detail: credits }));
}

export function getStoredRemainingCredits(): RemainingCredits | null {
  const raw = localStorage.getItem(REMAINING_CREDITS_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RemainingCredits;
  } catch {
    localStorage.removeItem(REMAINING_CREDITS_STORAGE_KEY);
    return null;
  }
}

export const getToken = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token && !isTokenValid(token)) {
    handleExpiredSession();
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
  localStorage.removeItem(CURRENT_SUBSCRIPTION_STORAGE_KEY);
  localStorage.removeItem(REMAINING_CREDITS_STORAGE_KEY);
};

export function handleExpiredSession(message: string = SESSION_EXPIRED_MESSAGE): void {
  clearTokens();
  setStoredUser(null);
  sessionStorage.setItem(SESSION_EXPIRED_MESSAGE_STORAGE_KEY, message);

  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));

  if (isHandlingExpiredSession) {
    return;
  }

  isHandlingExpiredSession = true;

  const routeToLogin = () => {
    window.location.assign('/');
    isHandlingExpiredSession = false;
  };

  if (window.location.pathname !== '/') {
    routeToLogin();
    return;
  }

  window.setTimeout(() => {
    isHandlingExpiredSession = false;
  }, 0);
}

export function ensureSessionIsValid(): string | null {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  if (!token) {
    return null;
  }

  if (!isTokenValid(token)) {
    handleExpiredSession();
    return null;
  }

  return token;
}

function normalizeCurrentSubscription(
  payload: SubscriptionApiResponse | Record<string, any> | null | undefined,
  fallbackPlan?: SubscriptionPlanInput,
): CurrentSubscription | null {
  const source =
    (payload as SubscriptionApiResponse | undefined)?.currentSubscription ||
    (payload as SubscriptionApiResponse | undefined)?.subscription ||
    (payload as SubscriptionApiResponse | undefined)?.plan ||
    (payload as SubscriptionApiResponse | undefined)?.data ||
    payload;

  if (!source && !fallbackPlan) {
    return null;
  }

  const name = source?.name || source?.planName || source?.title || fallbackPlan?.name;
  const planId = source?.planId || source?.id || source?.code || fallbackPlan?.planId;
  const billingCycle = source?.billingCycle || source?.interval || fallbackPlan?.billingCycle || 'monthly';
  const articleAnalysesPerMonth = Number(
    source?.articleAnalysesPerMonth ||
      source?.articlesPerMonth ||
      source?.analysisLimit ||
      source?.credits ||
      fallbackPlan?.articleAnalysesPerMonth ||
      0,
  );
  const monthlyPrice = Number(
    source?.monthlyPrice || source?.amount || source?.price || fallbackPlan?.monthlyPrice || 0,
  );

  if (!name || !planId || !articleAnalysesPerMonth) {
    return null;
  }

  return {
    planId: String(planId),
    name: String(name),
    monthlyPrice,
    priceLabel: monthlyPrice ? `$${monthlyPrice} / month` : source?.priceLabel || '$0 / month',
    articleAnalysesPerMonth,
    billingCycle: billingCycle === 'yearly' ? 'monthly' : 'monthly',
    status: source?.status || source?.subscriptionStatus || 'active',
    renewalDate: source?.renewalDate || source?.nextBillingDate || null,
  };
}

function normalizeRemainingCredits(
  payload: CreditsApiResponse | Record<string, any> | null | undefined,
  fallbackCredits?: RemainingCredits,
): RemainingCredits | null {
  const source =
    (payload as CreditsApiResponse | undefined)?.remainingCredits ||
    (payload as CreditsApiResponse | undefined)?.credits ||
    (payload as CreditsApiResponse | undefined)?.data ||
    payload;

  if (!source && !fallbackCredits) {
    return null;
  }

  const available = Number(
    source?.available ||
      source?.remaining ||
      source?.balance ||
      source?.remainingCredits ||
      fallbackCredits?.available ||
      0,
  );

  return {
    available,
    used: Number(source?.used || fallbackCredits?.used || 0),
    total: Number(source?.total || source?.allocated || fallbackCredits?.total || available),
    expiresAt: source?.expiresAt || source?.expiryDate || fallbackCredits?.expiresAt || null,
  };
}

function normalizeSubscriptionOrder(
  response: RazorpayOrderApiResponse | null | undefined,
  plan: SubscriptionPlanInput,
): SubscriptionOrder {
  return {
    orderId: String(response?.orderId || response?.data?.orderId || `order_${plan.planId}`),
    amount: Number(response?.amount || response?.data?.amount || plan.monthlyPrice * 100),
    currency: String(response?.currency || response?.data?.currency || 'INR'),
    keyId: String(response?.keyId || response?.data?.keyId || ''),
    planId: plan.planId,
    planName: plan.name,
    monthlyPrice: plan.monthlyPrice,
  };
}

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
  const token = ensureSessionIsValid();
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  if (isMockApiEnabled()) {
    return handleMockApiRequest<T>(endpoint, { method, body });
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && token) {
    handleExpiredSession();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  if (!response.ok) {
    throw buildApiError(data);
  }

  return data as T;
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
    if (isMockApiEnabled()) {
      const session = buildMockSessionFromCurrentUser();
      setTokens(session.token, session.refreshToken);
      setStoredUser(session.user);
      window.location.assign("/");
      return;
    }
    const authUrl = new URL(`${API_BASE_URL}/auth/google`);
    authUrl.searchParams.set('redirect_uri', buildFrontendAuthRedirectUri());
    window.location.href = authUrl.toString();
  },
  initiateFacebookSignIn: () => {
    const authUrl = new URL(`${API_BASE_URL}/auth/facebook`);
    authUrl.searchParams.set('redirect_uri', buildFrontendAuthRedirectUri());
    window.location.href = authUrl.toString();
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
  getCurrentSubscription: async () => {
    const stored = getStoredSubscription();
    if (stored) {
      return stored;
    }
    return authAPI.refreshCurrentSubscription();
  },
  refreshCurrentSubscription: async () => {
    try {
      const response = await requestJsonWithFallback<SubscriptionApiResponse>(
        [
          '/auth/subscription/current',
          '/subscription/current',
          '/billing/current-subscription',
          '/auth/current-subscription',
        ],
        { method: 'GET' },
      );

      const normalized = normalizeCurrentSubscription(response);
      if (normalized) {
        setStoredSubscription(normalized);
      }

      return normalized ?? getStoredSubscription();
    } catch (error) {
      const stored = getStoredSubscription();
      if (stored) {
        return stored;
      }

      throw error;
    }
  },
  getRemainingCredits: async () => {
    const stored = getStoredRemainingCredits();
    if (stored) {
      return stored;
    }
    return authAPI.refreshRemainingCredits();
  },
  refreshRemainingCredits: async () => {
    try {
      const response = await requestJsonWithFallback<CreditsApiResponse>(
        [
          '/auth/credits/remaining',
          '/credits/remaining',
          '/auth/remaining-credits',
          '/subscription/credits/remaining',
        ],
        { method: 'GET' },
      );

      const normalized = normalizeRemainingCredits(response);
      if (normalized) {
        setStoredRemainingCredits(normalized);
      }

      return normalized ?? getStoredRemainingCredits();
    } catch (error) {
      const stored = getStoredRemainingCredits();
      if (stored) {
        return stored;
      }

      throw error;
    }
  },
  subscribeToPlan: async (plan: SubscriptionPlanInput) => {
    const response = await postJsonWithFallback<SubscriptionApiResponse>(
      [
        '/auth/subscription/select',
        '/subscription/select',
        '/billing/subscribe',
        '/auth/add-credits',
        '/credits/add-credits',
      ],
      {
        planId: plan.planId,
        planName: plan.name,
        plan: plan.planId,
        billingCycle: plan.billingCycle,
        monthlyPrice: plan.monthlyPrice,
        articleAnalysesPerMonth: plan.articleAnalysesPerMonth,
      },
    );

    const normalized = normalizeCurrentSubscription(response, plan) ?? {
      planId: plan.planId,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      priceLabel: `$${plan.monthlyPrice} / month`,
      articleAnalysesPerMonth: plan.articleAnalysesPerMonth,
      billingCycle: plan.billingCycle,
      status: 'active',
      renewalDate: null,
    };

    setStoredSubscription(normalized);
    setStoredRemainingCredits({
      available: plan.articleAnalysesPerMonth,
      used: 0,
      total: plan.articleAnalysesPerMonth,
      expiresAt: null,
    });
    return {
      message: response?.message || `${plan.name} activated successfully.`,
      subscription: normalized,
    };
  },
  createSubscriptionOrder: async (plan: SubscriptionPlanInput) => {
    const response = await postJsonWithFallback<RazorpayOrderApiResponse>(
      [
        '/payments/razorpay/create-order',
        '/auth/payments/razorpay/create-order',
        '/subscription/payment/order',
      ],
      {
        planId: plan.planId,
        planName: plan.name,
        plan: plan.name,
        monthlyPrice: plan.monthlyPrice,
        articleAnalysesPerMonth: plan.articleAnalysesPerMonth,
        billingCycle: plan.billingCycle,
      },
    );

    return normalizeSubscriptionOrder(response, plan);
  },
  verifySubscriptionPayment: async (payload: VerifySubscriptionPaymentPayload) => {
    const response = await postJsonWithFallback<SubscriptionApiResponse>(
      [
        '/payments/razorpay/verify',
        '/auth/payments/razorpay/verify',
        '/subscription/payment/verify',
      ],
      payload,
    );

    const normalized = normalizeCurrentSubscription(response, payload.plan) ?? {
      planId: payload.plan.planId,
      name: payload.plan.name,
      monthlyPrice: payload.plan.monthlyPrice,
      priceLabel: `$${payload.plan.monthlyPrice} / month`,
      articleAnalysesPerMonth: payload.plan.articleAnalysesPerMonth,
      billingCycle: payload.plan.billingCycle,
      status: 'active',
      renewalDate: null,
    };

    setStoredSubscription(normalized);
    setStoredRemainingCredits({
      available: payload.plan.articleAnalysesPerMonth,
      used: 0,
      total: payload.plan.articleAnalysesPerMonth,
      expiresAt: null,
    });

    return {
      message: response?.message || 'Payment verified and subscription activated successfully.',
      subscription: normalized,
    };
  },
  reportSubscriptionPaymentFailure: async (payload: {
    plan: SubscriptionPlanInput;
    orderId?: string;
    reason: string;
  }) => {
    return postJsonWithFallback(
      [
        '/payments/razorpay/failure',
        '/auth/payments/razorpay/failure',
        '/subscription/payment/failure',
      ],
      payload,
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
  deleteAccount: async () => {
    const response = await requestJsonWithFallback<{ success?: boolean; message?: string }>(
      [
        '/auth/delete-account',
        '/auth/deleteaccount',
        '/account/delete',
        '/users/me',
      ],
      { method: 'DELETE' },
    );

    clearTokens();
    return response;
  },
};

function buildMockSessionFromCurrentUser(): AuthSession {
  return {
    token: "mock-jwt-token",
    refreshToken: "mock-refresh-token",
    user: getStoredUser() ?? {
      userId: "mock-user-1",
      email: "demo@getcentauri.com",
      firstName: "Centauri",
      lastName: "Demo",
      profileImage: "",
    },
  };
}

function buildFrontendAuthRedirectUri(): string {
  return `${API_BASE_URL}/auth/callback`;
}

export async function login(
  email: string,
  password: string
) : Promise<AuthSession> {
  return authAPI.login(email, password);
}
