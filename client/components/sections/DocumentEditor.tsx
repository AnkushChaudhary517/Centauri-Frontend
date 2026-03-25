import { useState, useEffect, useRef } from "react";
import { X, Download, Info } from "lucide-react";
import { InteractiveEditor } from "./InteractiveEditor";
import { RecommendationsList } from "./RecommendationsList";
import type { AnalysisResponse, Recommendation, RecommendationItem } from "@/services/seoAnalysis";
import { getAnalysisMetrics, type MetricItem } from "./scoreMetrics";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  recommendations: RecommendationItem;
  analysisResult?: AnalysisResponse | null;
  onSave: (updatedContent: string) => void;
  onExportReport?: () => void;
}

export function DocumentEditor({
  isOpen,
  onClose,
  onSave,
  content: initialContent,
  recommendations,
  analysisResult,
  onExportReport,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [leftWidth, setLeftWidth] = useState<number>(360);
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = useState<number | null>(
    recommendations?.sentenceLevel?.length ? 0 : null,
  );
  const [activeTab, setActiveTab] = useState<"overall" | "sectionLevel" | "sentenceLevel">(
    "sentenceLevel",
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const next = Math.max(280, Math.min(560, dragStartWidth.current + delta));
      setLeftWidth(next);
    };

    const onUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    const activeListLength =
      activeTab === "overall"
        ? recommendations.overall?.length || 0
        : activeTab === "sectionLevel"
          ? recommendations.sectionLevel?.length || 0
          : recommendations.sentenceLevel?.length || 0;

    if (activeListLength > 0) setSelectedRecommendationIndex(0);
    else setSelectedRecommendationIndex(null);
  }, [activeTab, recommendations]);

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent]);

  if (!isOpen) return null;

  const activeList: Recommendation[] =
    activeTab === "overall"
      ? recommendations.overall || []
      : activeTab === "sectionLevel"
        ? recommendations.sectionLevel || []
        : recommendations.sentenceLevel || [];

  const selectedRecommendation =
    selectedRecommendationIndex !== null ? activeList[selectedRecommendationIndex] : null;

  const totalRecommendations =
    (recommendations?.overall?.length || 0) +
    (recommendations?.sectionLevel?.length || 0) +
    (recommendations?.sentenceLevel?.length || 0);
  const metrics = getAnalysisMetrics(analysisResult);

  const handleApplySuggestion = () => {
    if (!selectedRecommendation) return;

    const newContent = content.replace(
      selectedRecommendation.examples.bad,
      selectedRecommendation.examples.good,
    );
    setContent(newContent);

    if (
      selectedRecommendationIndex !== null &&
      selectedRecommendationIndex < activeList.length - 1
    ) {
      setSelectedRecommendationIndex(selectedRecommendationIndex + 1);
    }
  };

  const handleDownload = () => {
    if (typeof onExportReport === "function") {
      onExportReport();
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "edited-content.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDone = () => {
    onSave(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
      <div className="relative mx-auto flex h-[94vh] w-[min(96vw,1800px)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            title="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 overflow-hidden pb-[84px]">
          <div
            style={{ width: leftWidth }}
            className="flex h-full min-w-[280px] flex-none flex-col overflow-hidden border-r border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)]"
          >
            <div className="border-b border-slate-200 px-3 py-2.5">
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Recommendations
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Review {totalRecommendations} suggestions and apply fixes directly.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setActiveTab("overall");
                    setSelectedRecommendationIndex(recommendations.overall?.length ? 0 : null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === "overall"
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Overall
                </button>
                <button
                  onClick={() => {
                    setActiveTab("sectionLevel");
                    setSelectedRecommendationIndex(recommendations.sectionLevel?.length ? 0 : null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === "sectionLevel"
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Section
                </button>
                <button
                  onClick={() => {
                    setActiveTab("sentenceLevel");
                    setSelectedRecommendationIndex(recommendations.sentenceLevel?.length ? 0 : null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === "sentenceLevel"
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Sentence
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-2">
              <RecommendationsList
                recommendations={activeList}
                selectedIndex={selectedRecommendationIndex}
                onSelectRecommendation={setSelectedRecommendationIndex}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          </div>

          <div
            onMouseDown={(e) => {
              isDragging.current = true;
              dragStartX.current = e.clientX;
              dragStartWidth.current = leftWidth;
              document.body.style.userSelect = "none";
            }}
            className="w-1 cursor-col-resize bg-slate-100 transition hover:bg-slate-300"
            style={{ touchAction: "none" }}
          />

          <div className="min-w-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,#f7faff_0%,#f2f6fc_100%)]">
            <div className="h-full overflow-auto p-2 sm:p-3">
              <div className="flex h-full min-w-0 flex-col gap-2 xl:flex-row">
                <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  <InteractiveEditor
                    content={content}
                    onContentChange={setContent}
                    highlightText={selectedRecommendation ? selectedRecommendation.examples.bad : ""}
                    highlightTrigger={selectedRecommendationIndex ?? -1}
                    highlightMode={
                      activeTab === "sentenceLevel"
                        ? "sentence"
                        : activeTab === "sectionLevel"
                          ? "section"
                          : "overall"
                    }
                  />
                </div>

                <aside className="w-full flex-none rounded-[18px] border border-[#dbe5f2] bg-[linear-gradient(180deg,#fbfdff_0%,#f3f7fd_100%)] shadow-[0_10px_24px_rgba(15,23,42,0.05)] xl:w-[154px]">
                  <div className="border-b border-[#e5edf7] px-2.5 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
                      Scores
                    </p>
                  </div>

                  <div className="px-2 py-2">
                    <div className="space-y-2">
                      {metrics.map((metric) => (
                        <CompactScoreCard key={metric.label} metric={metric} />
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-slate-600">
              {selectedRecommendationIndex !== null && activeList.length > 0
                ? `Showing recommendation ${selectedRecommendationIndex + 1} of ${activeList.length}`
                : "No recommendations"}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-800 transition hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Download Recommendations
              </button>
              <button
                onClick={handleDone}
                className="rounded-xl bg-[#1d4ed8] px-6 py-2.5 font-medium text-white transition hover:bg-[#1e40af]"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactScoreCard({ metric }: { metric: MetricItem }) {
  const radius = 28;
  const circumference = Math.PI * radius;
  const percentage = Math.min(metric.value / metric.max, 1);
  const offset = circumference * (1 - percentage);

  return (
    <div className="rounded-[14px] border border-[#dce6f3] bg-white px-2.5 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-1.5">
        <p className="min-w-0 text-[12px] font-semibold leading-4 text-slate-900">{metric.label}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#d7e3f4] bg-[#f8fbff] text-slate-500 transition hover:text-slate-800"
              aria-label={`More information about ${metric.label}`}
            >
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm leading-6">{metric.description}</TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-1.5 flex items-center justify-center">
        <div className="relative h-[46px] w-[74px] flex-shrink-0">
          <svg viewBox="0 0 72 44" className="h-[46px] w-[74px]">
            <path
              d="M8,36 A28,28 0 0,1 64,36"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="7"
            />
            <path
              d="M8,36 A28,28 0 0,1 64,36"
              fill="none"
              stroke={metric.color}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-[4px] text-center">
            <p className="text-[15px] font-bold leading-none" style={{ color: metric.color }}>
              {Math.round(metric.value)}
              {metric.showPercentage ? "%" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
