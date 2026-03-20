import { useState, useEffect, useRef } from "react";
import { X, Download } from "lucide-react";
import { InteractiveEditor } from "./InteractiveEditor";
import { RecommendationsList } from "./RecommendationsList";
import type { Recommendation, RecommendationItem } from "@/services/seoAnalysis";

interface DocumentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  recommendations: RecommendationItem;
  onSave: (updatedContent: string) => void;
  onExportReport?: () => void;
}

export function DocumentEditor({
  isOpen,
  onClose,
  onSave,
  content: initialContent,
  recommendations,
  onExportReport,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [leftWidth, setLeftWidth] = useState<number>(460);
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
      const next = Math.max(320, Math.min(880, dragStartWidth.current + delta));
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
            className="flex h-full min-w-[320px] flex-none flex-col overflow-hidden border-r border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)]"
          >
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Recommendations
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Review {totalRecommendations} suggestions and apply fixes directly.
                </p>
              </div>
              <div className="flex items-center gap-2">
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

            <div className="min-h-0 flex-1 overflow-hidden p-4">
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
            <div className="h-full overflow-auto p-4 sm:p-5 lg:p-6">
              <div className="h-full min-w-0 overflow-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
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
