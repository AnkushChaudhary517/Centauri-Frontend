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

/* ================= POLLING CONFIG ================= */

const MAX_ATTEMPTS = 10;
const POLL_INTERVAL = 10_000; // 10 seconds

/* ================= API ================= */

async function GetRecommendations(
  request: AnalysisRequest
): Promise<RecommendationResponse> {
  const url = getRecommendationsUrl();
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    RequestId: localStorage.getItem("RequestId") ?? "",
  };

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

  return response.json();
}

/* ================= TYPES ================= */

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
}

/* ---------------- Gauge Component ---------------- */

interface ScoreGaugeProps {
  label: string;
  value: number;
  max?: number;
  color: string;
  showPercentage: boolean;
}

const ScoreGauge = ({
  label,
  value,
  max = 100,
  color,
  showPercentage,
}: ScoreGaugeProps) => {
  const radius = 45;
  const circumference = Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const offset = circumference * (1 - percentage);

  return (
    <div className="gauge-card">
      <div className="gauge-label">{label}</div>

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

/* ---------------- Main Component ---------------- */

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

  /* ================= START POLLING WHEN ANALYSIS RESULT COMES ================= */
  const { data, loading, error } = useRecommendations(
    analysisRequest && analysisResult && (!analysisResult.error || analysisResult.error.trim() === "")
      ? analysisRequest
      : null
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

      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
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
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
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
      },
      {
        label: "AI Indexing",
        value: userVisible.aiIndexingScore ?? 0,
        max: 100,
        color: "#10b981",
        showPercentage: false,
      },
      {
        label: "Expertise",
        value: userVisible.expertiseScore ?? 0,
        max: 100,
        color: "#3b82f6",
        showPercentage: true,
      },
      {
        label: "Authority",
        value: userVisible.authorityScore ?? 0,
        max: 100,
        color: "#8b5cf6",
        showPercentage: false,
      },
      {
        label: "Readability",
        value: userVisible.readabilityScore ?? 0,
        max: 100,
        color: "#f97316",
        showPercentage: false,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {analysisResult && (
          <div className="score-buttons flex justify-end mb-6 gap-x-4">
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              onClick={handleMetricLoading}
            >
              Analyze More Content
            </button>

            <button
              onClick={() => setIsEditorOpen(true)}
              disabled={!recommendationsReady}
              className={`px-4 py-2 rounded-md font-medium transition ${
                recommendationsReady
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              ✏️Recommendations
            </button>
          </div>
        )}
        {isEditorOpen && data?.recommendations && (
          <DocumentEditor
            isOpen={isEditorOpen}
            onSave={handleSaveFromEditor}
            onClose={() => setIsEditorOpen(false)}
            content={content}
            recommendations={data.recommendations}
            onExportReport={() =>
              exportSeoReport(
                analysisResult!,
                primaryKeyword ?? "",
                originalContent,
                content
              )
            }
          />
        )}

        {!isEditorOpen && (
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
        )}
      </div>
    </div>
  );
}
