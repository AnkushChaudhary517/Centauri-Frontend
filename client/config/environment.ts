export type ApiEnvironment = "localhost" | "production";

type EnvironmentUrls = {
  apiBaseUrl: string;
  seoAnalyzeUrl: string;
  seoReanalyzeUrl: string;
  recommendationsUrl: string;
  razorpayKeyId: string;
};
//const API_ENVIRONMENT: ApiEnvironment = "localhost";
const API_ENVIRONMENT: ApiEnvironment = "production";
const USE_MOCK_API = false;
const ENABLE_RECOMMENDATION_FEEDBACK = true;
const ENABLE_CENTAURI_ASSISTANT = true;

const ENVIRONMENT_URLS: Record<ApiEnvironment, EnvironmentUrls> = {
  localhost: {
    apiBaseUrl: "https://localhost:7206/api/v1",
    seoAnalyzeUrl: "https://localhost:7206/api/Seo/analyze",
    seoReanalyzeUrl: "https://localhost:7206/api/Seo/reanalyze",
    recommendationsUrl: "https://localhost:7206/api/Seo/recommendations",
    razorpayKeyId: "rzp_test_mock_centauri",
  },
  production: {
    apiBaseUrl: "https://api.getcentauri.com/api/v1",
    seoAnalyzeUrl: "https://api.getcentauri.com/api/Seo/analyze",
    seoReanalyzeUrl: "https://api.getcentauri.com/api/Seo/reanalyze",
    recommendationsUrl: "https://api.getcentauri.com/api/Seo/recommendations",
    razorpayKeyId: "rzp_live_replace_with_real_key",
  },
};

export const environment = {
  apiEnvironment: API_ENVIRONMENT,
  useMockApi: USE_MOCK_API,
  enableRecommendationFeedback: ENABLE_RECOMMENDATION_FEEDBACK,
  enableCentauriAssistant: ENABLE_CENTAURI_ASSISTANT,
  urls: ENVIRONMENT_URLS[API_ENVIRONMENT],
};
