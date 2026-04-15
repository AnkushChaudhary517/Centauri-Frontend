import { environment } from "@/config/environment";

export const getApiBaseUrl = (): string => {
  return environment.urls.apiBaseUrl;
};

export const getSeoAnalyzeUrl = (): string => {
  return environment.urls.seoAnalyzeUrl;
};

export const getSeoReanalyzeUrl = (): string => {
  return environment.urls.seoReanalyzeUrl;
};

export const getRecommendationsUrl = (): string => {
  return environment.urls.recommendationsUrl;
};
