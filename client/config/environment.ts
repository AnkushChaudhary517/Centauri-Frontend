export type ApiEnvironment = "localhost" | "production";

type EnvironmentUrls = {
  apiBaseUrl: string;
  seoAnalyzeUrl: string;
  recommendationsUrl: string;
};

//const API_ENVIRONMENT: ApiEnvironment = "localhost";
const API_ENVIRONMENT: ApiEnvironment = "production";
const USE_MOCK_API = false;

const ENVIRONMENT_URLS: Record<ApiEnvironment, EnvironmentUrls> = {
  localhost: {
    apiBaseUrl: "https://localhost:7206/api/v1",
    seoAnalyzeUrl: "https://localhost:7206/api/Seo/analyze",
    recommendationsUrl: "https://localhost:7206/api/Seo/recommendations",
  },
  production: {
    apiBaseUrl: "https://api.getcentauri.com/api/v1",
    seoAnalyzeUrl: "https://api.getcentauri.com/api/Seo/analyze",
    recommendationsUrl: "https://api.getcentauri.com/api/Seo/recommendations",
  },
};

export const environment = {
  apiEnvironment: API_ENVIRONMENT,
  useMockApi: USE_MOCK_API,
  urls: ENVIRONMENT_URLS[API_ENVIRONMENT],
};
