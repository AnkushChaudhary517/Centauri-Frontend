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
  
  export interface AnalysisResponse {
    requestId: string;
    status: string;
    seoScore: number;
    finalScores: {
      userVisible: {
        seoScore: number | null;
        relevanceScore: number | null;
        eeatScore: number | null;
        readabilityScore: number | null;
        aiIndexingScore: number | null;
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
    recommendations: Array<{
      issue: string;
      whatToChange: string;
      examples:Example
      Improves:string[]
    }>;
    inputIntegrity: {
      status: string;
      received: {
        [key: string]: boolean;
      };
    };
  }
  export interface Example{
    good:string;
    bad:string;
  }
  
  // Parse file content to extract metadata
  export function parseFileContent(content: string): Partial<AnalysisRequest> {
    const parsed: Partial<AnalysisRequest> = {};
  
    // Look for common metadata patterns
    const titleMatch = content.match(/(?:title|meta title|h1):\s*([^\n]+)/i);
    if (titleMatch) {
      parsed.MetaTitle = titleMatch[1].trim();
    }
  
    const descriptionMatch = content.match(/(?:description|meta description):\s*([^\n]+)/i);
    if (descriptionMatch) {
      parsed.MetaDescription = descriptionMatch[1].trim();
    }
  
    const keywordMatch = content.match(/(?:keyword|primary keyword):\s*([^\n]+)/i);
    if (keywordMatch) {
      parsed.PrimaryKeyword = keywordMatch[1].trim();
    }
  
    const urlMatch = content.match(/(?:url|slug):\s*([^\n]+)/i);
    if (urlMatch) {
      parsed.Url = urlMatch[1].trim();
    }
  
    return parsed;
  }
  
  export async function analyzeSEO(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      //let url = "https://localhost:7206/api/Seo/analyze";
      let url ="http://ec2-13-126-103-12.ap-south-1.compute.amazonaws.com:3000/api/Seo/analyze"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      PrimaryKeyword: overrides?.PrimaryKeyword || parsed.PrimaryKeyword || "fractional cfo cost",
      SecondaryKeywords: overrides?.SecondaryKeywords || [
        "fractional cfo pricing",
        "fractional cfo cost in 2025",
        "fractional cfo rates",
        "fractional cfo services",
        "hire a fractional cfo",
      ],
      MetaTitle: overrides?.MetaTitle || parsed.MetaTitle || "How Much Does a Fractional CFO Cost in 2025?",
      MetaDescription: overrides?.MetaDescription || parsed.MetaDescription || "Explore fractional CFO pricing in 2025, including hourly rates, monthly retainers, and how to choose the right CFO for your startup.",
      Url: overrides?.Url || parsed.Url || "/fractional-cfo-cost",
      Context: {
        Locale: "en-US",
        CitationRules: "default",
      },
    };
  }
  