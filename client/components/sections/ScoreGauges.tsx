import { exportSeoReport } from "@/utils/exportSeoReport";
import "./ScoreGauges.css";
import type {
  AnalysisResponse,
  AnalysisRequest,
} from "@/services/seoAnalysis";
import { useEffect, useState } from "react";
import { DocumentEditor } from "./DocumentEditor";
import { useRecommendations } from "@/hooks/fetch-recommendations";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Sparkles } from "lucide-react";
import { getAnalysisMetrics, type MetricItem } from "./scoreMetrics";

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

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data, loading: recommendationsLoading, error: recommendationsError } = useRecommendations(
    analysisRequest &&
      analysisResult &&
      (!analysisResult.error || analysisResult.error.trim() === "")
      ? analysisRequest
      : null,
  );

  useEffect(() => {
    if (data?.status?.toLowerCase() === "completed") {
      setIsEditorOpen(true);
    }
  }, [data]);

  const metrics = getAnalysisMetrics(analysisResult);
  const shouldWaitForRecommendations =
    !!analysisResult &&
    !analysisResult.error &&
    !!analysisRequest &&
    !data &&
    !recommendationsError;

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
        {shouldWaitForRecommendations || (analysisResult && recommendationsLoading) ? (
          <div className="score-shell">
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#dbeafe_0%,#eff6ff_42%,#ffffff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_40px_rgba(37,99,235,0.18)]">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#bfdbfe] border-t-[#2563eb] border-r-[#1d4ed8]" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
                Centauri Editor
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Preparing recommendations and editor view
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Your analysis is complete. We&apos;re assembling recommendations and the interactive
                editor so you can review fixes and scores together on one screen.
              </p>
            </div>
          </div>
        ) : null}

        {analysisResult && !recommendationsLoading && recommendationsError ? (
          <div className="score-shell">
            <div className="flex flex-col gap-5 px-6 py-10 sm:px-10 sm:py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="score-kicker">Editor Unavailable</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Recommendations are not ready yet
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  We couldn&apos;t load the recommendation set right now. You can analyze more
                  content or try again shortly.
                </p>
              </div>
              <div className="score-actions">
                <button className="score-button-secondary" onClick={handleMetricLoading}>
                  Analyze More Content
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {analysisResult && !shouldWaitForRecommendations && !recommendationsLoading && !recommendationsError ? (
          <div className="score-shell">
            <div className="score-buttons">
              <div className="score-summary">
                <p className="score-kicker">Performance Overview</p>
                <h3>Your content quality snapshot</h3>
                <p>
                  Your interactive editor is ready. Review the score snapshot here or reopen the
                  full editing workspace any time.
                </p>
                {data?.status?.toLowerCase() === "completed" ? (
                  <span className="score-status score-status-ready">Recommendations ready</span>
                ) : null}
              </div>

              <div className="score-actions">
                <button className="score-button-secondary" onClick={handleMetricLoading}>
                  Analyze More Content
                </button>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  disabled={!data?.recommendations}
                  className={data?.recommendations ? "score-button-primary" : "score-button-disabled"}
                >
                  Open Interactive Editor
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
                analysisResult={analysisResult}
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
