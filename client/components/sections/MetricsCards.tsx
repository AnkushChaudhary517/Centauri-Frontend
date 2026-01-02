import type { AnalysisResponse } from "@/services/seoAnalysis";

interface MetricsCardsProps {
  analysisResult?: AnalysisResponse | null;
  isLoading?: boolean;
}

export function MetricsCards({ analysisResult, isLoading }: MetricsCardsProps) {
  // Only show metrics section if we have backend data or are loading
  if (!analysisResult && !isLoading) {
    return null;
  }

  // Build metrics from analysis result
  const getMetrics = () => {
    if (!analysisResult) {
      return [];
    }

    const userVisible = analysisResult.finalScores.userVisible;
    const level2 = analysisResult.level2Scores || {};
    const level3 = analysisResult.level3Scores || {};
    const level4 = analysisResult.level4Scores || {};

    return [
      {
        label: "SEO Score",
        value: userVisible.seoScore ? `${userVisible.seoScore.toFixed(1)}` : "N/A",
        color: "text-purple-500",
      },
      {
        label: "AI Indexing",
        value: userVisible.aiIndexingScore ? `${userVisible.aiIndexingScore.toFixed(1)}` : "N/A",
        color: "text-blue-500",
      },
      {
        label: "Relevance",
        value: userVisible.relevanceScore ? `${userVisible.relevanceScore.toFixed(1)}` : "N/A",
        color: "text-blue-500",
      },
      {
        label: "EEAT Score",
        value: userVisible.eeatScore ? `${userVisible.eeatScore.toFixed(1)}` : "N/A",
        color: "text-purple-500",
      },
      {
        label: "Readability",
        value: userVisible.readabilityScore ? `${userVisible.readabilityScore.toFixed(1)}` : "N/A",
        color: "text-orange-500",
      }
    ];
  };

  const metrics = getMetrics();

  return (
    <div className="metrics-section bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-center mb-8">
            <p className="text-gray-600 animate-pulse">Analyzing your content...</p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center hover:shadow-md transition-shadow ${
                isLoading ? "opacity-50" : ""
              }`}
            >
              <div className="mb-2 sm:mb-3">
                <svg
                  viewBox="0 0 100 100"
                  className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto ${metric.color}`}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    opacity="0.2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${index * 15 + 20} 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className={`text-lg sm:text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
