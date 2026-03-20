import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Recommendation } from "@/services/seoAnalysis";

interface RecommendationOptionsProps {
  recommendation: Recommendation;
  onApplySuggestion: (suggestion: string) => void;
}

const IMPROVEMENT_COPY: Record<
  string,
  { userAttribute: string; meaning: string }
> = {
  sectionscore: {
    userAttribute: "Topical Coverage",
    meaning: "whether the article covers all the important sections readers expect",
  },
  intentscore: {
    userAttribute: "Search Intent Alignment",
    meaning: "whether the article answers the reader's question clearly and completely",
  },
  authorityscore: {
    userAttribute: "Authority",
    meaning: "whether the article shows real expertise and confidence on the topic",
  },
  credibilityscore: {
    userAttribute: "Credibility",
    meaning: "whether important claims are supported by trustworthy information",
  },
  readabilityscore: {
    userAttribute: "Readability",
    meaning: "how easy the article is to read and understand",
  },
  simplicityscore: {
    userAttribute: "Clarity",
    meaning: "how simple and easy the sentence structure feels",
  },
  variationscore: {
    userAttribute: "Writing Flow",
    meaning: "how natural and varied the writing feels from sentence to sentence",
  },
  grammarscore: {
    userAttribute: "Grammar",
    meaning: "how correct and polished the language feels",
  },
  originalinfoscore: {
    userAttribute: "Original Insight",
    meaning: "whether the article adds useful original ideas instead of repeating generic points",
  },
  relevancescore: {
    userAttribute: "Topic Relevance",
    meaning: "how closely the article stays focused on the intended topic",
  },
  retrievalfactualityscore: {
    userAttribute: "Answer Accuracy",
    meaning: "whether the article gives clear, factual, and dependable answers",
  },
  synthesiscoherencescore: {
    userAttribute: "Content Cohesion",
    meaning: "how logically the ideas connect and flow across the article",
  },
  aiindexingscore: {
    userAttribute: "AI Discoverability",
    meaning: "how easily AI systems can understand and retrieve this content",
  },
  seoscore: {
    userAttribute: "Search Visibility",
    meaning: "how likely the article is to perform well in search results",
  },
};

function normalizeImproveKey(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function buildImprovementSummary(improves: string[] = []) {
  if (improves.length === 0) {
    return "This change improves the overall quality and usefulness of the content.";
  }

  const mappedItems = improves.map((item) => {
    const match = IMPROVEMENT_COPY[normalizeImproveKey(item)];
    if (match) {
      return `${match.userAttribute} by improving ${match.meaning}`;
    }

    return item;
  });

  if (mappedItems.length === 1) {
    return `This change improves ${mappedItems[0]}.`;
  }

  if (mappedItems.length === 2) {
    return `This change improves ${mappedItems[0]} and ${mappedItems[1]}.`;
  }

  return `This change improves ${mappedItems
    .slice(0, -1)
    .join(", ")}, and ${mappedItems[mappedItems.length - 1]}.`;
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
        {/* Action Button (commented per request) */}
        {/**
        <button
          onClick={() => onApplySuggestion(recommendation.examples.good)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Apply This Suggestion
        </button>
        */}

        {/* Improves - show single friendly summary sentence instead of tag list */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">This will improve</h3>
          <p className="text-sm text-gray-700">
            {buildImprovementSummary(recommendation.improves)}
          </p>
        </div>

        
      </div>
    </div>
  );
}
