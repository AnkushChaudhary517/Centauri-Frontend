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
  const [openIndices, setOpenIndices] = useState<number[]>(
    recommendations.map((_, index) => index),
  );

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    setOpenIndices(recommendations.map((_, index) => index));
  }, [recommendations]);

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex !== undefined) {
      setOpenIndices((current) =>
        current.includes(selectedIndex) ? current : [...current, selectedIndex],
      );
    }
  }, [selectedIndex]);

  const handleToggle = (index: number) => {
    const isOpen = openIndices.includes(index);
    const next = isOpen
      ? openIndices.filter((item) => item !== index)
      : [...openIndices, index];

    setOpenIndices(next);
    onSelectRecommendation(index);

    const el = itemRefs.current[index];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="recommendations-list flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-3">
        <h3 className="text-base font-semibold text-slate-900">
          {recommendations.length} Recommendations
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5">
        {recommendations.map((rec, index) => {
          const isOpen = openIndices.includes(index);

          return (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="w-full overflow-hidden rounded-[18px] bg-white shadow-sm"
            >
              <button
                onClick={() => handleToggle(index)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors ${
                  isOpen ? "bg-[#eff6ff] text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex w-full items-center gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{rec.issue}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{rec.whatToChange}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600">
                      {rec.priority}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </button>

              <div
                className={`overflow-hidden px-3 transition-[max-height] duration-300 ease-in-out ${
                  isOpen ? "max-h-[1400px] py-3" : "max-h-0"
                }`}
              >
                {isOpen ? (
                  <RecommendationOptions
                    recommendation={rec}
                    onApplySuggestion={onApplySuggestion}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
