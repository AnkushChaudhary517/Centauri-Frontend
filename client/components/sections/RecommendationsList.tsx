import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";
import type { Recommendation } from "@/services/seoAnalysis";

interface RecommendationsListProps {
  recommendations: Recommendation[];
  selectedIndex: number | null;
  onSelectRecommendation: (index: number) => void;
}

export function RecommendationsList({
  recommendations,
  selectedIndex,
  onSelectRecommendation,
}: RecommendationsListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case "Medium":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      case "Low":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="recommendations-list h-full flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {recommendations.length} Recommendations
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Select an issue to view and apply suggestions
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {recommendations.map((rec, index) => (
          <button
            key={index}
            onClick={() => onSelectRecommendation(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedIndex === index
                ? "border-orange-500 bg-orange-50 shadow-md"
                : `border-gray-200 ${getPriorityColor(rec.priority)}`
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5 ${getPriorityIconColor(rec.priority)}`}>
                {rec.priority === "High" && <AlertCircle className="w-5 h-5" />}
                {rec.priority === "Medium" && <InfoIcon className="w-5 h-5" />}
                {rec.priority === "Low" && <CheckCircle className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityBadgeColor(
                      rec.priority
                    )}`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {rec.issue}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {rec.improves.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {rec.improves.length > 2 && (
                    <span className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      +{rec.improves.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
