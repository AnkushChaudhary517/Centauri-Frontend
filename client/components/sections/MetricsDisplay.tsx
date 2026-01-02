import { ASSETS } from "@/lib/assets";
import type { AnalysisResponse } from "@/services/seoAnalysis";

interface MetricsDisplayProps {
  analysisResult?: AnalysisResponse | null;
  isLoading?: boolean;
}

interface MetricItem {
  label: string;
  value: number;
  max: number;
  color: string;
  backgroundAsset: string;
}

export function MetricsDisplay({ analysisResult, isLoading }: MetricsDisplayProps) {
  // Only show metrics section if we have backend data or are loading
  if (!analysisResult && !isLoading) {
    return null;
  }

  const getMetrics = (): MetricItem[] => {
    if (!analysisResult) {
      return [];
    }

    const userVisible = analysisResult.finalScores.userVisible;
    const level2 = analysisResult.level2Scores || {};

    return [
      {
        label: "SEO Score",
        value: userVisible.seoScore || 0,
        max: 100,
        color: "#5b21b6",
        backgroundAsset: ASSETS.backgrounds.base,
      },
      {
        label: "AI Indexing",
        value: userVisible.aiIndexingScore || 0,
        max: 100,
        color: "#059669",
        backgroundAsset: ASSETS.backgrounds.base,
      },
      {
        label: "Plagiarism",
        value: level2.plagiarismScore || 0,
        max: 100,
        color: "#2563eb",
        backgroundAsset: ASSETS.backgrounds.base2,
      },
      {
        label: "Authority",
        value: level2.authorityScore || 0,
        max: 100,
        color: "#9333ea",
        backgroundAsset: ASSETS.backgrounds.roundedRectangleAutoSh2,
      },
      {
        label: "Readability",
        value: userVisible.readabilityScore || 0,
        max: 100,
        color: "#f97316",
        backgroundAsset: ASSETS.backgrounds.base2,
      },
    ];
  };

  const metrics = getMetrics();

  return (
    <div className="metrics-display-section bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-center mb-8">
            <p className="text-gray-600 animate-pulse">Analyzing your content...</p>
          </div>
        )}

        {/* Responsive Grid - Full Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden border border-gray-200 p-6 sm:p-8 text-center hover:shadow-md transition-shadow bg-white"
              style={{
                backgroundImage: `url(${metric.backgroundAsset})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Background overlay for readability */}
              <div className="absolute inset-0 bg-white/85" />

              {/* Content */}
              <div className="relative z-10">
                <CircularMetric metric={metric} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CircularMetricProps {
  metric: MetricItem;
}

function CircularMetric({ metric }: CircularMetricProps) {
  const percentage = Math.min((metric.value / metric.max) * 100, 100);

  // Semi-circle arc calculation (180 degrees) - radius 40
  const radius = 40;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Label */}
      <p className="text-sm sm:text-base font-semibold text-gray-800 mb-4 text-center">
        {metric.label}
      </p>

      {/* Semi-Circular Progress */}
      <div className="relative w-24 h-14 sm:w-28 sm:h-16 md:w-32 md:h-20 mb-3">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 60"
          preserveAspectRatio="xMidYMin meet"
        >
          {/* Background semi-circle */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Progress semi-circle */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={metric.color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none"
            style={{ color: metric.color }}
          >
            {metric.value.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* "of 100" label */}
      <p className="text-xs sm:text-sm text-gray-500 text-center">of 100</p>
    </div>
  );
}
