import { environment } from "@/config/environment";
import type {
  AnalysisRequest,
  AnalysisResponse,
  RecommendationResponse,
} from "@/services/seoAnalysis";

const MOCK_USER_STORAGE_KEY = "mockAuthUser";
const MOCK_SUBSCRIPTION_STORAGE_KEY = "currentSubscription";
const MOCK_CREDITS_STORAGE_KEY = "remainingCredits";

const MOCK_TOKEN = "mock-jwt-token";
const MOCK_REFRESH_TOKEN = "mock-refresh-token";

const DEFAULT_MOCK_USER = {
  userId: "mock-user-1",
  email: "demo@getcentauri.com",
  firstName: "Centauri",
  lastName: "Demo",
  profileImage: "",
};

const DEFAULT_MOCK_SUBSCRIPTION = {
  planId: "trial-14-day",
  name: "Free Trial",
  priceLabel: "5 credits for 14 days mock",
  monthlyPrice: 0,
  articleAnalysesPerMonth: 5,
  billingCycle: "monthly" as const,
  status: "trial",
  renewalDate: null,
};

const DEFAULT_MOCK_CREDITS = {
  available: 5,
  used: 0,
  total: 5,
  expiresAt: null,
};

export function isMockApiEnabled() {
  return environment.useMockApi;
}

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredMockUser() {
  const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
  if (!raw) return DEFAULT_MOCK_USER;

  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_USER;
  }
}

function setStoredMockUser(user = DEFAULT_MOCK_USER) {
  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
}

function getStoredMockSubscription() {
  const raw = localStorage.getItem(MOCK_SUBSCRIPTION_STORAGE_KEY);
  if (!raw) return DEFAULT_MOCK_SUBSCRIPTION;

  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_SUBSCRIPTION;
  }
}

function setStoredMockSubscription(subscription = DEFAULT_MOCK_SUBSCRIPTION) {
  localStorage.setItem(MOCK_SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
  window.dispatchEvent(new CustomEvent("centauri:subscription-updated", { detail: subscription }));
}

function getStoredMockCredits() {
  const raw = localStorage.getItem(MOCK_CREDITS_STORAGE_KEY);
  if (!raw) return DEFAULT_MOCK_CREDITS;

  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_CREDITS;
  }
}

function setStoredMockCredits(credits = DEFAULT_MOCK_CREDITS) {
  localStorage.setItem(MOCK_CREDITS_STORAGE_KEY, JSON.stringify(credits));
  window.dispatchEvent(new CustomEvent("centauri:credits-updated", { detail: credits }));
}

function buildMockAuthSession(overrides?: Partial<typeof DEFAULT_MOCK_USER>) {
  const user = {
    ...DEFAULT_MOCK_USER,
    ...overrides,
  };

  setStoredMockUser(user);

  return {
    token: MOCK_TOKEN,
    refreshToken: MOCK_REFRESH_TOKEN,
    user,
  };
}

export async function handleMockApiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
  } = {},
): Promise<T> {
  await delay();

  const body = options.body;

  switch (endpoint) {
    case "/auth/login":
    case "/auth/register":
    case "/auth/social/google":
    case "/auth/social/facebook":
    case "/auth/google/exchange":
    case "/auth/facebook/exchange":
      return buildMockAuthSession({
        email: body?.email || DEFAULT_MOCK_USER.email,
      }) as T;

    case "/auth/send-verification":
      return { success: true, message: "Verification email sent." } as T;

    case "/auth/verify-email":
      return { success: true, message: "Email verified successfully." } as T;

    case "/auth/updateprofile": {
      const user = {
        userId: "mock-user-1",
        email: body?.email || DEFAULT_MOCK_USER.email,
        firstName: body?.firstName || DEFAULT_MOCK_USER.firstName,
        lastName: body?.lastName || DEFAULT_MOCK_USER.lastName,
        profileImage: "",
      };
      setStoredMockUser(user);
      setStoredMockSubscription(DEFAULT_MOCK_SUBSCRIPTION);
      setStoredMockCredits(DEFAULT_MOCK_CREDITS);
      return { success: true, message: "Profile updated successfully.", data: user } as T;
    }

    case "/auth/update-profile":
      return handleMockApiRequest<T>("/auth/updateprofile", options);

    case "/auth/change-password":
      return { success: true, message: "Password changed successfully." } as T;

    case "/auth/forgot-password":
      return { success: true, message: "Reset instructions sent successfully." } as T;

    case "/auth/reset-password":
      return { success: true, message: "Password reset successfully." } as T;

    case "/auth/subscription/current":
    case "/subscription/current":
    case "/billing/current-subscription":
    case "/auth/current-subscription":
      return {
        success: true,
        currentSubscription: getStoredMockSubscription(),
      } as T;

    case "/payments/razorpay/create-order":
    case "/auth/payments/razorpay/create-order":
    case "/subscription/payment/order":
      return {
        success: true,
        orderId: `order_${Date.now()}`,
        amount: (body?.monthlyPrice || 15) * 100,
        currency: "INR",
        keyId: "rzp_test_mock_centauri",
      } as T;

    case "/payments/razorpay/verify":
    case "/auth/payments/razorpay/verify":
    case "/subscription/payment/verify": {
      const subscription = {
        planId: body?.plan?.planId || "starter-monthly",
        name: body?.plan?.name || "Starter Plan",
        priceLabel: `$${body?.plan?.monthlyPrice || 15} / month`,
        monthlyPrice: body?.plan?.monthlyPrice || 15,
        articleAnalysesPerMonth: body?.plan?.articleAnalysesPerMonth || 10,
        billingCycle: "monthly" as const,
        status: "active",
        renewalDate: null,
      };
      setStoredMockSubscription(subscription);
      setStoredMockCredits({
        available: subscription.articleAnalysesPerMonth,
        used: 0,
        total: subscription.articleAnalysesPerMonth,
        expiresAt: null,
      });
      return {
        success: true,
        message: "Mock Razorpay payment verified successfully.",
        subscription,
      } as T;
    }

    case "/payments/razorpay/failure":
    case "/auth/payments/razorpay/failure":
    case "/subscription/payment/failure":
      return {
        success: true,
        message: "Mock payment failure recorded.",
      } as T;

    case "/auth/credits/remaining":
    case "/credits/remaining":
    case "/auth/remaining-credits":
    case "/subscription/credits/remaining":
      return {
        success: true,
        remainingCredits: getStoredMockCredits(),
      } as T;

    case "/auth/subscription/select":
    case "/subscription/select":
    case "/billing/subscribe":
    case "/auth/add-credits":
    case "/credits/add-credits":
    case "/credits/add":
    case "/auth/credits/add": {
      const subscription = {
        planId: body?.planId || body?.plan || "starter-monthly",
        name: body?.planName || "Starter Plan",
        priceLabel: `$${body?.monthlyPrice || 15} / month`,
        monthlyPrice: body?.monthlyPrice || 15,
        articleAnalysesPerMonth: body?.articleAnalysesPerMonth || 10,
        billingCycle: "monthly" as const,
        status: "active",
        renewalDate: null,
      };
      setStoredMockSubscription(subscription);
      setStoredMockCredits({
        available: subscription.articleAnalysesPerMonth,
        used: 0,
        total: subscription.articleAnalysesPerMonth,
        expiresAt: null,
      });
      return {
        success: true,
        message: "Starter Plan subscription activated successfully.",
        subscription,
      } as T;
    }

    case "/auth/refresh":
      return buildMockAuthSession() as T;

    case "/auth/logout":
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      localStorage.removeItem(MOCK_CREDITS_STORAGE_KEY);
      return { success: true } as T;

    case "/auth/delete-account":
    case "/auth/deleteaccount":
    case "/account/delete":
    case "/users/me":
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      localStorage.removeItem(MOCK_CREDITS_STORAGE_KEY);
      localStorage.removeItem(MOCK_SUBSCRIPTION_STORAGE_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
      window.dispatchEvent(new CustomEvent("centauri:subscription-updated"));
      window.dispatchEvent(new CustomEvent("centauri:credits-updated"));
      return {
        success: true,
        message: "Account removed successfully.",
      } as T;

    case "/Seo/recommendations/feedback":
      return {
        success: true,
        message: "Recommendation feedback recorded.",
      } as T;

    default:
      throw new Error(`Mock API route not implemented for ${endpoint}`);
  }
}

export async function getMockAnalysisResponse(request: AnalysisRequest): Promise<AnalysisResponse> {
  await delay(900);

  const keywordSeed = request.PrimaryKeyword?.length || 8;
  const baseScore = Math.max(62, Math.min(88, 60 + keywordSeed));

  return {
    requestId: "mock-request-id",
    status: "Completed",
    seoScore: baseScore,
    isCompleted: true,
    error: null,
    finalScores: {
      userVisible: {
        expertiseScore: 84,
        seoScore: baseScore,
        relevanceScore: 79,
        eeatScore: 82,
        readabilityScore: 76,
        aiIndexingScore: 81,
        authorityScore: 74,
      },
    },
    level2Scores: {
      structure: 82,
      clarity: 78,
    },
    level3Scores: {
      headings: 80,
      keywordCoverage: 77,
    },
    level4Scores: {
      paragraphs: 75,
      internalLogic: 84,
    },
    inputIntegrity: {
      status: "validated",
      received: {
        metaTitle: request.MetaTitle || "",
        metaDescription: request.MetaDescription || "",
        url: request.Url || "",
      },
    },
  };
}

export async function getMockRecommendationsResponse(): Promise<RecommendationResponse> {
  await delay(2500);

  return {
    status: "completed",
    recommendations: {
      overall: [
        {
          issue: "Opening lacks a stronger keyword signal",
          whatToChange: "Bring the primary keyword into the first paragraph more naturally.",
          priority: "High",
          improves: ["SEO", "Relevance"],
          examples: {
            bad: "This article explores several ideas around publishing.",
            good: "This article explores how content teams can improve SEO publishing workflows.",
          },
        },
      ],
      sectionLevel: [
        {
          issue: "Subheadings are too generic",
          whatToChange: "Rewrite subheadings so they communicate a clear value or takeaway.",
          priority: "Medium",
          improves: ["Readability", "Structure"],
          examples: {
            bad: "Important Points",
            good: "Key ranking factors to review before publishing",
          },
        },
      ],
      sentenceLevel: [
        {
          issue: "Sentence is too broad",
          whatToChange: "Replace vague phrasing with a concrete outcome or action.",
          priority: "Medium",
          improves: ["Clarity"],
          examples: {
            bad: "This helps in many ways.",
            good: "This helps editors spot weak sections before an article goes live.",
          },
        },
      ],
    },
  };
}
