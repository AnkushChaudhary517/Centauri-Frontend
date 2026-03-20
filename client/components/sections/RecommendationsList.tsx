import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Recommendation } from "@/services/seoAnalysis";
import { RecommendationOptions } from "./RecommendationOptions";

interface RecommendationsListProps {
  recommendations: Recommendation[];
  selectedIndex: number | null;
  onSelectRecommendation: (index: number) => void;
  onApplySuggestion: (suggestion: string) => void;
}

export function RecommendationsList({
  recommendations,
  selectedIndex,
  onSelectRecommendation,
  onApplySuggestion,
}: RecommendationsListProps) {
  // Accordion behavior: only one open at a time, default first open
  const [openIndex, setOpenIndex] = useState<number | null>(
    recommendations.length > 0 ? 0 : null
  );

  // refs for scrolling into view
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // keep openIndex in sync when parent selection changes
    if (selectedIndex !== null && selectedIndex !== undefined) {
      setOpenIndex(selectedIndex);
    }
  }, [selectedIndex]);

  const handleToggle = (index: number) => {
    const next = openIndex === index ? null : index;
    setOpenIndex(next);
    if (next !== null) {
      onSelectRecommendation(index);
      // scroll into view
      const el = itemRefs.current[index];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="recommendations-list h-full flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {recommendations.length} Recommendations
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Tap an item to expand its details; only one is open at a time
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            className="w-full"
          >
            <button
              onClick={() => handleToggle(index)}
              className={`w-full text-left py-3 px-4 flex items-center justify-between transition-colors ${
                openIndex === index ? "bg-orange-50 text-gray-900" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rec.issue}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{rec.whatToChange}</p>
                </div>
                <div className="ml-3 text-xs text-gray-400 flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded text-xs bg-gray-100">{rec.priority}</div>
                  <div>
                    {openIndex === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded panel */}
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-in-out px-4 ${
                openIndex === index ? "max-h-[1200px] py-4" : "max-h-0"
              }`}
            >
              {openIndex === index && (
                <RecommendationOptions
                  recommendation={rec}
                  onApplySuggestion={onApplySuggestion}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
