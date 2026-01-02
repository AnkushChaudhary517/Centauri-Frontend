import type { AnalysisResponse } from "@/services/seoAnalysis";

interface ImprovementProps {
  analysisResult?: AnalysisResponse | null;
}

export function Improvement({ analysisResult }: ImprovementProps) {
  const metrics = [
    { label: "Better rankings", color: "bg-orange-100 text-orange-600" },
    { label: "AI indexing", color: "bg-blue-100 text-blue-600" },
    { label: "Content originality", color: "bg-purple-100 text-purple-600" },
    { label: "Authority boost", color: "bg-pink-100 text-pink-600" },
    { label: "Readability score", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="improvement-section bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
          <span className="text-orange-500">Improve</span> how your content is
          <br />
          read, ranked, and understood
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {metrics.map((metric, index) => (
            <button
              key={index}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all hover:shadow-md ${metric.color}`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Left side - SEO Score */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">SEO Score</h3>
            <p className="text-gray-600 mb-6">
              Understand how well your content is positioned in the SERPs and
              helps your SEO authority.
            </p>
            <div className="flex items-center gap-8">
              {analysisResult ? (
                <>
                  <svg
                    viewBox="0 0 120 120"
                    className="w-24 h-24"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#ff7a00"
                      strokeWidth="8"
                      strokeDasharray={`${(analysisResult.seoScore / 100) * 314} 314`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                    <text
                      x="60"
                      y="65"
                      textAnchor="middle"
                      className="text-xl font-bold"
                      fill="#1f2937"
                    >
                      {analysisResult.seoScore.toFixed(1)}
                    </text>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">
                      {analysisResult.inputIntegrity.status === "partial"
                        ? "Some inputs missing or invalid"
                        : "All inputs validated"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 120 120"
                    className="w-24 h-24"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#ff7a00"
                      strokeWidth="8"
                      strokeDasharray="70 314"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                    <text
                      x="60"
                      y="65"
                      textAnchor="middle"
                      className="text-xl font-bold"
                      fill="#1f2937"
                    >
                      70%
                    </text>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">
                      Researches AI meta-appears to be AI-generated
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side - Metrics */}
          <div className="space-y-4">
            {analysisResult ? (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Keyword Score:</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {analysisResult.level2Scores.keywordScore?.toFixed(1) || "N/A"}
                    </span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-full rounded-full"
                        style={{
                          width: `${Math.min((analysisResult.level2Scores.keywordScore / 10) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Readability Score:</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {analysisResult.level3Scores.readabilityScore?.toFixed(1) || "N/A"}
                    </span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${Math.min((analysisResult.level3Scores.readabilityScore / 10) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Grammar Score:</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {analysisResult.level2Scores.grammarScore?.toFixed(1) || "N/A"}
                    </span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-green-600 h-full rounded-full"
                        style={{
                          width: `${Math.min((analysisResult.level2Scores.grammarScore / 10) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Keyword Importance:</span> High
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">70%</span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-full rounded-full"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Readability AI-Smart</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">75%</span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Compliance Report</span>
                  </p>
                  <button className="text-secondary font-semibold hover:underline">
                    Download Report ↓
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
