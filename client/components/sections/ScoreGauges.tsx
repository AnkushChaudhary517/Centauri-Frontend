import { exportSeoReport } from "@/utils/exportSeoReport";
import "./ScoreGauges.css";
import type { AnalysisResponse } from "@/services/seoAnalysis";


interface ScoreGaugesProps {
  analysisResult?: AnalysisResponse | null;
  isLoading?: boolean;
  primaryKeyword?: string;
  content?: string;
  handleMetricLoading():void;
}

interface MetricItem {
  label: string;
  value: number;
  max: number;
  color: string;
}

/* ---------------- Gauge Component ---------------- */

interface ScoreGaugeProps {
  label: string;
  value: number;
  max?: number;
  color: string;
}

const ScoreGauge = ({
  label,
  value,
  max = 100,
  color,
}: ScoreGaugeProps) => {
  const radius = 45;
  const circumference = Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const offset = circumference * (1 - percentage);

  return (
    <div className="gauge-card">
      {/* Label on top */}
      <div className="gauge-label">{label}</div>

      <div className="gauge-wrapper">
        <svg viewBox="0 0 120 70" className="gauge">
          {/* Background */}
          <path
            d="M15,60 A45,45 0 0,1 105,60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />

          {/* Progress */}
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

        {/* Center text */}
        <div className="gauge-center">
          <div className="gauge-value" style={{ color }}>
            {Math.round(value)
            }
          </div>
          <div className="gauge-max">of {max}</div>
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
  handleMetricLoading
}: ScoreGaugesProps) {
  // Same guard as old component
  if (!analysisResult && !isLoading) {
    return null;
  }

  const getMetrics = (): MetricItem[] => {
    if (!analysisResult) return [];

    const userVisible = analysisResult.finalScores.userVisible;
    const level2 = analysisResult.level2Scores || {};

    return [
      {
        label: "SEO Score",
        value: userVisible.seoScore ?? 0,
        max: 100,
        color: "#4f46e5",
      },
      {
        label: "AI Indexing",
        value: userVisible.aiIndexingScore ?? 0,
        max: 100,
        color: "#10b981",
      },
      {
        label: "Plagiarism",
        value: level2.plagiarismScore ?? 0,
        max: 100,
        color: "#3b82f6",
      },
      {
        label: "Authority",
        value: level2.authorityScore ?? 0,
        max: 100,
        color: "#8b5cf6",
      },
      {
        label: "Readability",
        value: userVisible.readabilityScore ?? 0,
        max: 100,
        color: "#f97316",
      },
    ];
  };

  const metrics = getMetrics();

  return (
    <div className="metrics-display-section bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading state */}
        {isLoading && (
          <div className="text-center mb-8">
            <p className="text-gray-600 animate-pulse">
              Analyzing your content...
            </p>
          </div>
        )}
{analysisResult && (
  <div className="score-buttons flex justify-end mb-6 gap-x-4" >
<button
    className="px-4 py-2 rounded-md bg-secondary text-white font-medium hover:opacity-90"
  onClick={() =>
    handleMetricLoading()
  }
>
  Analyze More Content
</button>
    <button
    className="px-4 py-2 rounded-md bg-secondary text-white font-medium hover:opacity-90"
  onClick={() =>
    exportSeoReport(
      analysisResult,
      primaryKeyword,
      content
    )
  }
>
  Export Report (.docx)
</button>
  </div>
)}
        {/* Responsive Grid */}
        <div className="score-container">
  {/* Top big gauges */}
  <div className="score-top">
    {metrics.slice(0, 2).map((metric, index) => (
      <ScoreGauge
        key={index}
        label={metric.label}
        value={metric.value}
        max={metric.max}
        color={metric.color}
      />
    ))}
  </div>

  {/* Bottom small gauges */}
  <div className="score-bottom">
    {metrics.slice(2).map((metric, index) => (
      <ScoreGauge
        key={index}
        label={metric.label}
        value={metric.value}
        max={metric.max}
        color={metric.color}
      />
    ))}
  </div>
</div>

      </div>
    </div>
  );
}
