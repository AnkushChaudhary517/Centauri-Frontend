import { exportSeoReport } from "@/utils/exportSeoReport";
import "./ScoreGauges.css";
import type {
  AnalysisResponse,
  AnalysisRequest,
  RecommendationResponse,
} from "@/services/seoAnalysis";
import { useEffect, useState } from "react";
import { DocumentEditor } from "./DocumentEditor";
import { useRecommendations } from "@/hooks/fetch-recommendations";
import { getRecommendationsUrl } from "@/utils/ApiConfig";
import { getToken } from "@/utils/AuthApi";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const MAX_ATTEMPTS = 10;
const POLL_INTERVAL = 10_000;

async function GetRecommendations(
  request: AnalysisRequest,
): Promise<RecommendationResponse> {
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

interface ScoreGaugesProps {
  analysisResult?: AnalysisResponse | null;
  isLoading?: boolean;
  primaryKeyword?: string;
  content?: string;
  originalContent?: string;
  analysisRequest?: AnalysisRequest | null;
  handleMetricLoading(): void;
  onEditorSave?: (data: { updatedContent: string; keyword: string }) => void;
}

interface MetricItem {
  label: string;
  value: number;
  max: number;
  color: string;
  showPercentage: boolean;
  description: string;
}

interface ScoreGaugeProps extends MetricItem {}

const ScoreGauge = ({
  label,
  value,
  max = 100,
  color,
  showPercentage,
  description,
}: ScoreGaugeProps) => {
  const radius = 45;
  const circumference = Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const offset = circumference * (1 - percentage);

  return (
    <div className="gauge-card">
      <div className="gauge-label">
        <span>{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="gauge-info"
              aria-label={`More information about ${label}`}
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm leading-6">
            {description}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="gauge-wrapper">
        <svg viewBox="0 0 120 70" className="gauge">
          <path
            d="M15,60 A45,45 0 0,1 105,60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <path
            d="M15,60 A45,45 0 0,1 105,60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>

        <div className="gauge-center">
          <div className="gauge-value" style={{ color }}>
            {Math.round(value)}
            {showPercentage ? "%" : ""}
          </div>
          {!showPercentage && <div className="gauge-max">of {max}</div>}
        </div>
      </div>
    </div>
  );
};

export default function ScoreGauges({
  analysisResult,
  isLoading,
  primaryKeyword,
  content,
  originalContent,
  analysisRequest,
  handleMetricLoading,
  onEditorSave,
}: ScoreGaugesProps) {
  if (!analysisResult && !isLoading) return null;

  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [recommendationsReady, setRecommendationsReady] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data } = useRecommendations(
    analysisRequest &&
      analysisResult &&
      (!analysisResult.error || analysisResult.error.trim() === "")
      ? analysisRequest
      : null,
  );

  useEffect(() => {
    if (!analysisResult || !primaryKeyword || analysisResult.error) return;

    let cancelled = false;

    const request: AnalysisRequest = {
      Article: { Raw: content ?? "", Format: "text" },
      PrimaryKeyword: primaryKeyword,
      SecondaryKeywords: [],
      MetaTitle: "",
      MetaDescription: "",
      Url: "",
      Context: { Locale: "", CitationRules: "" },
    };

    const poll = async () => {
      setIsPolling(true);
      setAttempts(0);
      setRecommendationsReady(false);

      for (let i = 1; i <= MAX_ATTEMPTS; i += 1) {
        if (cancelled) return;

        try {
          const res = await GetRecommendations(request);

          if (res?.status?.toLowerCase() === "completed") {
            setRecommendationsReady(true);
            setIsPolling(false);
            return;
          }
        } catch {
          setIsPolling(false);
          return;
        }

        setAttempts(i);
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }

      setIsPolling(false);
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [analysisResult, primaryKeyword, content]);

  const getMetrics = (): MetricItem[] => {
    if (!analysisResult) return [];

    const userVisible = analysisResult.finalScores.userVisible;

    return [
      {
        label: "SEO Score",
        value: userVisible.seoScore ?? 0,
        max: 100,
        color: "#4f46e5",
        showPercentage: false,
        description:
          "A blended measure of on-page optimization, structure, and keyword alignment.",
      },
      {
        label: "AI Indexing",
        value: userVisible.aiIndexingScore ?? 0,
        max: 100,
        color: "#10b981",
        showPercentage: false,
        description:
          "How well the content is structured for AI systems and machine-assisted discovery.",
      },
      {
        label: "Expertise",
        value: userVisible.expertiseScore ?? 0,
        max: 100,
        color: "#3b82f6",
        showPercentage: true,
        description:
          "Signals that the content demonstrates first-hand knowledge and subject depth.",
      },
      {
        label: "Authority",
        value: userVisible.authorityScore ?? 0,
        max: 100,
        color: "#8b5cf6",
        showPercentage: false,
        description:
          "Indicates how trustworthy and credible the content feels to readers and search systems.",
      },
      {
        label: "Readability",
        value: userVisible.readabilityScore ?? 0,
        max: 100,
        color: "#f97316",
        showPercentage: false,
        description:
          "Estimates how easily readers can scan, understand, and retain the content.",
      },
    ];
  };

  const metrics = getMetrics();

  const handleSaveFromEditor = (updatedHtml: string) => {
    if (onEditorSave) {
      onEditorSave({
        updatedContent: updatedHtml,
        keyword: primaryKeyword ?? "",
      });
    }
  };

  return (
    <div className="metrics-display-section bg-white py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {analysisResult ? (
          <div className="score-shell">
            <div className="score-buttons">
              <div className="score-summary">
                <p className="score-kicker">Performance Overview</p>
                <h3>Your content quality snapshot</h3>
                <p>
                  Review the latest analysis scores and open recommendations once processing is complete.
                </p>
                {isPolling ? (
                  <span className="score-status">Preparing recommendations • attempt {attempts} of {MAX_ATTEMPTS}</span>
                ) : recommendationsReady ? (
                  <span className="score-status score-status-ready">Recommendations ready</span>
                ) : null}
              </div>

              <div className="score-actions">
                <button className="score-button-secondary" onClick={handleMetricLoading}>
                  Analyze More Content
                </button>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  disabled={!recommendationsReady}
                  className={recommendationsReady ? "score-button-primary" : "score-button-disabled"}
                >
                  Recommendations
                </button>
              </div>
            </div>

            {isEditorOpen && data?.recommendations ? (
              <DocumentEditor
                isOpen={isEditorOpen}
                onSave={handleSaveFromEditor}
                onClose={() => setIsEditorOpen(false)}
                content={content}
                recommendations={data.recommendations}
                onExportReport={() =>
                  exportSeoReport(
                    analysisResult,
                    primaryKeyword ?? "",
                    originalContent,
                    content,
                  )
                }
              />
            ) : null}

            {!isEditorOpen ? (
              <div className="score-container">
                <div className="score-top">
                  {metrics.slice(0, 2).map((metric, index) => (
                    <ScoreGauge key={index} {...metric} />
                  ))}
                </div>

                <div className="score-bottom">
                  {metrics.slice(2).map((metric, index) => (
                    <ScoreGauge key={index} {...metric} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
