import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Recommendation } from "@/services/seoAnalysis";

interface RecommendationOptionsProps {
  recommendation: Recommendation;
  onApplySuggestion: (suggestion: string) => void;
}

export function RecommendationOptions({
  recommendation,
  onApplySuggestion,
}: RecommendationOptionsProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 border-red-200";
      case "Medium":
        return "bg-yellow-50 border-yellow-200";
      case "Low":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="recommendation-options bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Issue Title */}
        {/* <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{recommendation.issue}</p>
        </div> */}

        {/* What to Change */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What to Change</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{recommendation.whatToChange}</p>
        </div>

        {/* Examples */}
        <div>
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3> */}

          {/* Bad Example */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-red-700">❌ Before (Needs Change)</label>
              <button
                onClick={() => handleCopy(recommendation.examples.bad)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                {copiedText === recommendation.examples.bad ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-gray-900 font-mono break-words">
              {recommendation.examples.bad}
            </div>
          </div>

          {/* Good Example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-green-700">✅ After (Recommended)</label>
              <button
                onClick={() => handleCopy(recommendation.examples.good)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                {copiedText === recommendation.examples.good ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-900 font-mono break-words">
              {recommendation.examples.good}
            </div>
          </div>
        </div>
        {/* Action Button */}
        <button
          onClick={() => onApplySuggestion(recommendation.examples.good)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Apply This Suggestion
        </button>
        {/* Improves */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            This will improve:
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {recommendation.improves.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg"
              >
                <span className="text-lg">⭐</span>
                <span className="text-sm font-medium text-gray-900">{tag}</span>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
}
