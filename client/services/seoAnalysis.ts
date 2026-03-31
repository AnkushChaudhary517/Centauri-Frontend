export interface AnalysisRequest {
    Article: {
      Raw: string;
      Format: string;
    };
    PrimaryKeyword: string;
    SecondaryKeywords: string[];
    MetaTitle: string;
    MetaDescription: string;
    Url: string;
    Context: {
      Locale: string;
      CitationRules: string;
    };
  }
  export interface Recommendation {
    id?: string;
    issue: string;
    whatToChange: string;
    examples: Example;
    improves: string[];
    priority:string;
  }
export interface RecommendationItem{
  overall: Recommendation[];
  sectionLevel: Recommendation[];
  sentenceLevel: Recommendation[];
}

  export interface RecommendationResponse{
    recommendations:RecommendationItem
    status:string;
  }
  export interface RecommendationFeedbackPayload {
    recommendationId: string;
    requestId?: string;
    feedback: "up" | "down";
    issue: string;
    whatToChange: string;
    priority: string;
    improves: string[];
    originalArticle: string;
    updatedArticle: string;
    primaryKeyword?: string;
    metaTitle?: string;
    metaDescription?: string;
    url?: string;
  }
  export interface AnalysisResponse {
    requestId: string;
    status: string;
    seoScore: number;
    isCompleted: boolean;
    error: string | null;
    finalScores: {
      userVisible: {
        expertiseScore: number | null;
        seoScore: number | null;
        relevanceScore: number | null;
        eeatScore: number | null;
        readabilityScore: number | null;
        aiIndexingScore: number | null;
        authorityScore: number | null;
      };
    };
    level2Scores: {
      [key: string]: number;
    };
    level3Scores: {
      [key: string]: number;
    };
    level4Scores: {
      [key: string]: number;
    };
    inputIntegrity: {
      status: string;
      received: {
        [key: string]: string;
      };
    };
  }
  export interface Example{
    good:string;
    bad:string;
  }
  
// API Configuration
import { getMockAnalysisResponse, getMockRecommendationsResponse, isMockApiEnabled } from '@/services/mockApi';
import { getApiBaseUrl, getSeoAnalyzeUrl, getRecommendationsUrl } from '@/utils/ApiConfig';
import { getToken } from '@/utils/AuthApi';

const GENERIC_FEEDBACK_ERROR_MESSAGE = "We couldn't save your feedback right now. Please try again.";

function getFeedbackErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return GENERIC_FEEDBACK_ERROR_MESSAGE;
  }

  const payload = data as {
    error?: {
      message?: string | null;
    } | null;
  };

  if (typeof payload.error?.message === "string" && payload.error.message.trim()) {
    return payload.error.message.trim();
  }

  return GENERIC_FEEDBACK_ERROR_MESSAGE;
}
  // Parse file content to extract metadata
  export function parseFileContent(content: string): Partial<AnalysisRequest> {
    const parsed: Partial<AnalysisRequest> = {};
  
    if (!content || typeof content !== "string") {
      return parsed;
    }
  
    // Simple HTML detection (safe & fast)
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  
    if (!looksLikeHtml) {
      // ❌ HTML nahi hai → kuch bhi parse mat karo
      return parsed;
    }
  
    try {
      const container = document.createElement("div");
      container.innerHTML = content;
  
      const paragraphs = container.querySelectorAll("p");
  
      paragraphs.forEach((p) => {
        const text = p.innerText?.trim();
        if (!text) return;
  
        if (/^meta\s*title\s*:/i.test(text)) {
          parsed.MetaTitle = text.split(":").slice(1).join(":").trim();
        }
  
        if (/^meta\s*description\s*:/i.test(text)) {
          parsed.MetaDescription = text.split(":").slice(1).join(":").trim();
        }
  
        if (/^(url\s*slug|url|slug)\s*:/i.test(text)) {
          parsed.Url = text.split(":").slice(1).join(":").trim();
        }
      });
    } catch {
      // ❌ Silently fail — no exception
      return parsed;
    }
  
    return parsed;
  }
  
  
  export async function analyzeSEO(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      if (isMockApiEnabled()) {
        return getMockAnalysisResponse(request);
      }

      const url = getSeoAnalyzeUrl();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Include Bearer token if available
      const token = getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return data as AnalysisResponse;
    } catch (error) {
      console.error("SEO analysis error:", error);
      throw error;
    }
  }

  export async function analyzeSEOWithPolling(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      if (isMockApiEnabled()) {
        return getMockAnalysisResponse(request);
      }

      const url = getSeoAnalyzeUrl();

      // Poll for completion
      const maxAttempts = 30; // 5 minutes / 10 seconds = 30 attempts
      let attempts = 0;

      while (attempts < maxAttempts) {
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        
        // Include Bearer token if available
        const token = getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        // Call the same analyze endpoint
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.isCompleted) {
          return data as AnalysisResponse;
        }

        // Wait 10 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      }

      throw new Error("Analysis timed out after 5 minutes");
    } catch (error) {
      console.error("SEO analysis with polling error:", error);
      throw error;
    }
  }

  export async function getRecommendations(request: AnalysisRequest): Promise<RecommendationResponse> {
    if (isMockApiEnabled()) {
      return getMockRecommendationsResponse();
    }

    const url = getRecommendationsUrl();
    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      RequestId: localStorage.getItem("RequestId") ?? "",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  export async function submitRecommendationFeedback(
    payload: RecommendationFeedbackPayload,
  ): Promise<{ success?: boolean; message?: string }> {
    if (isMockApiEnabled()) {
      return (await import("@/services/mockApi")).handleMockApiRequest(
        "/Seo/recommendations/feedback",
        {
          method: "POST",
          body: payload,
        },
      );
    }

    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const baseUrl = getRecommendationsUrl();
    const response = await fetch(`${baseUrl}/feedback`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(getFeedbackErrorMessage(data));
    }

    return response.json().catch(() => ({ success: true }));
  }
  
  export function buildAnalysisRequest(
    fileContent: string,
    overrides?: Partial<AnalysisRequest>
  ): AnalysisRequest {
    const parsed = parseFileContent(fileContent);
  
    return {
      Article: {
        Raw: fileContent,
        Format: "text",
      },
      PrimaryKeyword: overrides?.PrimaryKeyword || parsed.PrimaryKeyword,
      SecondaryKeywords: overrides?.SecondaryKeywords,
      MetaTitle: overrides?.MetaTitle || parsed.MetaTitle,
      MetaDescription: overrides?.MetaDescription || parsed.MetaDescription,
      Url: overrides?.Url || parsed.Url,
      Context: {
        Locale: "en-US",
        CitationRules: "default",
      }
    };
  }
  
