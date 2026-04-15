import { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Bot,
  Download,
  Info,
  Sparkles,
  WandSparkles,
  ArrowLeft,
  CheckCheck,
  ListFilter,
} from "lucide-react";
import { InteractiveEditor } from "./InteractiveEditor";
import { RecommendationsList } from "./RecommendationsList";
import type {
  AnalysisRequest,
  AnalysisResponse,
  Recommendation,
  RecommendationItem,
} from "@/services/seoAnalysis";
import { getAnalysisMetrics, type MetricItem } from "./scoreMetrics";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { submitRecommendationFeedback } from "@/services/seoAnalysis";
import { useToast } from "@/components/ui/use-toast";
import { environment } from "@/config/environment";

interface DocumentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewAnalysis?: () => void;
  content: string;
  originalContent?: string;
  analysisRequest?: AnalysisRequest | null;
  recommendations?: RecommendationItem | null;
  recommendationsLoading?: boolean;
  recommendationsError?: string | null;
  analysisResult?: AnalysisResponse | null;
  onSave: (data: {
    updatedContent: string;
    isEdited: boolean;
    previousRequestId?: string | null;
  }) => void;
  onExportReport?: () => void;
}

type AssistantView = "actions" | "selective";
type RecommendationGroup = "overall" | "sectionLevel" | "sentenceLevel";

type FlattenedRecommendation = {
  id: string;
  group: RecommendationGroup;
  title: string;
  description: string;
  priority: string;
  before: string;
  after: string;
};

export function DocumentEditor({
  isOpen,
  onClose,
  onStartNewAnalysis,
  onSave,
  content: initialContent,
  originalContent = "",
  analysisRequest,
  recommendations,
  recommendationsLoading = false,
  recommendationsError = null,
  analysisResult,
  onExportReport,
}: DocumentEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [assistantView, setAssistantView] = useState<AssistantView>("actions");
  const [selectedAssistantRecommendationIds, setSelectedAssistantRecommendationIds] = useState<
    string[]
  >([]);
  const [leftWidth, setLeftWidth] = useState<number>(360);
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = useState<number | null>(
    recommendations?.sentenceLevel?.length ? 0 : null,
  );
  const [activeTab, setActiveTab] = useState<"overall" | "sectionLevel" | "sentenceLevel">(
    "sentenceLevel",
  );
  const [feedbackByRecommendationId, setFeedbackByRecommendationId] = useState<
    Record<string, { selected?: "up" | "down" | null; loading?: boolean }>
  >({});

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
  const fallbackRecommendationIds = useRef<Record<string, string>>({});

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
        ? recommendations?.overall?.length || 0
        : activeTab === "sectionLevel"
          ? recommendations?.sectionLevel?.length || 0
          : recommendations?.sentenceLevel?.length || 0;

    if (activeListLength > 0) setSelectedRecommendationIndex(0);
    else setSelectedRecommendationIndex(null);
  }, [activeTab, recommendations]);

  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent]);

  useEffect(() => {
    setIsChatbotOpen(false);
    setAssistantView("actions");
    setSelectedAssistantRecommendationIds([]);
  }, [recommendations, recommendationsLoading, isOpen]);

  const applyRecommendationSet = (
    items: Array<{ before: string; after: string }>,
    successLabel: string,
  ) => {
    const allRecommendations = items
      .map((recommendation) => ({
        before: recommendation.before ?? "",
        after: recommendation.after ?? "",
      }))
      .filter((recommendation) => recommendation.before && recommendation.after)
      .sort((left, right) => right.before.length - left.before.length);

    if (!allRecommendations.length) return;

    let totalApplications = 0;

    setContent((currentContent) =>
      allRecommendations.reduce((updatedContent, recommendation) => {
        const { before, after } = recommendation;
        if (!before || !after || before === after || !updatedContent.includes(before)) {
          return updatedContent;
        }

        const occurrences = updatedContent.split(before).length - 1;
        if (occurrences < 1) {
          return updatedContent;
        }

        totalApplications += occurrences;
        return updatedContent.split(before).join(after);
      }, currentContent),
    );

    toast({
      title: totalApplications > 0 ? "Recommendations applied" : "No matching text found",
      description:
        totalApplications > 0
          ? `${successLabel} Applied ${totalApplications} recommendation change${totalApplications === 1 ? "" : "s"} to the article text.`
          : "The recommendation examples did not match the current editor content.",
    });

    setIsChatbotOpen(false);
  };

  const applyAllRecommendations = () => {
    applyRecommendationSet(
      assistantRecommendations.map((recommendation) => ({
        before: recommendation.before,
        after: recommendation.after,
      })),
      "",
    );
  };

  const toggleAssistantRecommendation = (recommendationId: string) => {
    setSelectedAssistantRecommendationIds((current) =>
      current.includes(recommendationId)
        ? current.filter((id) => id !== recommendationId)
        : [...current, recommendationId],
    );
  };

  const toggleAssistantGroup = (group: RecommendationGroup) => {
    const groupIds = assistantRecommendations
      .filter((recommendation) => recommendation.group === group)
      .map((recommendation) => recommendation.id);

    setSelectedAssistantRecommendationIds((current) => {
      const allSelected = groupIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !groupIds.includes(id));
      }

      return Array.from(new Set([...current, ...groupIds]));
    });
  };

  const openSelectiveRecommendations = () => {
    setAssistantView("selective");
    setSelectedAssistantRecommendationIds(
      assistantRecommendations.slice(0, Math.min(3, assistantRecommendations.length)).map((item) => item.id),
    );
  };

  const applySelectedRecommendations = () => {
    applyRecommendationSet(
      selectedAssistantRecommendations.map((recommendation) => ({
        before: recommendation.before,
        after: recommendation.after,
      })),
      "Selected recommendations applied.",
    );
  };

  if (!isOpen) return null;

  const getFallbackRecommendationId = (recommendation: Recommendation) => {
    const key = `${recommendation.issue}::${recommendation.whatToChange}`;
    if (!fallbackRecommendationIds.current[key]) {
      fallbackRecommendationIds.current[key] = crypto.randomUUID();
    }
    return fallbackRecommendationIds.current[key];
  };

  const addRecommendationIds = (items: Recommendation[] = []) =>
    items.map((recommendation) => ({
      ...recommendation,
      id: recommendation.id || getFallbackRecommendationId(recommendation),
    }));

  const recommendationsWithIds = useMemo(
    () => ({
      overall: addRecommendationIds(recommendations?.overall || []),
      sectionLevel: addRecommendationIds(recommendations?.sectionLevel || []),
      sentenceLevel: addRecommendationIds(recommendations?.sentenceLevel || []),
    }),
    [recommendations],
  );

  const assistantRecommendations = useMemo<FlattenedRecommendation[]>(
    () =>
      ([
        ["overall", recommendationsWithIds.overall],
        ["sectionLevel", recommendationsWithIds.sectionLevel],
        ["sentenceLevel", recommendationsWithIds.sentenceLevel],
      ] as Array<[RecommendationGroup, Recommendation[]]>).flatMap(([group, items]) =>
        items.map((recommendation) => ({
          id: recommendation.id || getFallbackRecommendationId(recommendation),
          group,
          title: recommendation.issue,
          description: recommendation.whatToChange,
          priority: recommendation.priority,
          before: recommendation.examples?.bad ?? "",
          after: recommendation.examples?.good ?? "",
        })),
      ),
    [recommendationsWithIds],
  );

  const selectedAssistantRecommendations = assistantRecommendations.filter((recommendation) =>
    selectedAssistantRecommendationIds.includes(recommendation.id),
  );

  const activeList: Recommendation[] =
    activeTab === "overall"
      ? recommendationsWithIds.overall
      : activeTab === "sectionLevel"
        ? recommendationsWithIds.sectionLevel
        : recommendationsWithIds.sentenceLevel;

  const selectedRecommendation =
    selectedRecommendationIndex !== null ? activeList[selectedRecommendationIndex] : null;

  const totalRecommendations =
    (recommendations?.overall?.length || 0) +
    (recommendations?.sectionLevel?.length || 0) +
    (recommendations?.sentenceLevel?.length || 0);
  const metrics = getAnalysisMetrics(analysisResult);
  const hasRecommendations = totalRecommendations > 0;
  const recommendationsReady = !recommendationsLoading && hasRecommendations;
  const assistantGroups: Array<{
    key: RecommendationGroup;
    label: string;
    helper: string;
  }> = [
    { key: "overall", label: "High impact", helper: "Broad improvements for the article" },
    { key: "sectionLevel", label: "Section polish", helper: "Updates for headings and blocks" },
    { key: "sentenceLevel", label: "Sentence fixes", helper: "Smaller wording improvements" },
  ];

  const handleRecommendationFeedback = async (
    recommendation: Recommendation,
    feedback: "up" | "down",
  ) => {
    if (!environment.enableRecommendationFeedback) {
      return;
    }

    const recommendationId = recommendation.id || getFallbackRecommendationId(recommendation);
    if (feedbackByRecommendationId[recommendationId]?.loading) {
      return;
    }

    setFeedbackByRecommendationId((current) => ({
      ...current,
      [recommendationId]: {
        ...current[recommendationId],
        loading: true,
      },
    }));

    try {
      await submitRecommendationFeedback({
        recommendationId,
        requestId: analysisResult?.requestId,
        feedback,
        issue: recommendation.issue,
        whatToChange: recommendation.whatToChange,
        priority: recommendation.priority,
        improves: recommendation.improves,
        originalArticle: originalContent || initialContent || "",
        updatedArticle: content,
        primaryKeyword: analysisRequest?.PrimaryKeyword,
        metaTitle: analysisRequest?.MetaTitle,
        metaDescription: analysisRequest?.MetaDescription,
        url: analysisRequest?.Url,
      });

      setFeedbackByRecommendationId((current) => ({
        ...current,
        [recommendationId]: {
          selected: feedback,
          loading: false,
        },
      }));
      toast({
        title: "Feedback received",
        description: "Thanks for helping us improve recommendation quality.",
      });
    } catch (error) {
      setFeedbackByRecommendationId((current) => ({
        ...current,
        [recommendationId]: {
          ...current[recommendationId],
          loading: false,
        },
      }));
      toast({
        title: "Feedback not submitted",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't save your feedback right now. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    onSave({
      updatedContent: content,
      isEdited: content !== initialContent,
      previousRequestId: analysisResult?.requestId ?? null,
    });
    onClose();
  };

  const handleStartNewAnalysis = () => {
    onClose();
    onStartNewAnalysis?.();
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
                    setSelectedRecommendationIndex(recommendations?.overall?.length ? 0 : null);
                  }}
                  disabled={!hasRecommendations}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === "overall"
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-white text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                >
                  Overall
                </button>
                <button
                  onClick={() => {
                    setActiveTab("sectionLevel");
                    setSelectedRecommendationIndex(recommendations?.sectionLevel?.length ? 0 : null);
                  }}
                  disabled={!hasRecommendations}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === "sectionLevel"
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-white text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                >
                  Section
                </button>
                <button
                  onClick={() => {
                    setActiveTab("sentenceLevel");
                    setSelectedRecommendationIndex(recommendations?.sentenceLevel?.length ? 0 : null);
                  }}
                  disabled={!hasRecommendations}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === "sentenceLevel"
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-white text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                >
                  Sentence
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-2">
              {recommendationsLoading ? (
                <RecommendationLoader />
              ) : recommendationsError ? (
                <div className="flex h-full flex-col items-center justify-center rounded-[18px] border border-[#d9e4f4] bg-white px-6 text-center shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2563eb]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    Recommendations unavailable
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    We couldn&apos;t load recommendations right now. You can still edit the content
                    and try again later.
                  </p>
                </div>
              ) : (
                <RecommendationsList
                  recommendations={activeList}
                  selectedIndex={selectedRecommendationIndex}
                  onSelectRecommendation={setSelectedRecommendationIndex}
                  onApplySuggestion={handleApplySuggestion}
                  onFeedback={handleRecommendationFeedback}
                  feedbackByRecommendationId={feedbackByRecommendationId}
                />
              )}
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
                : recommendationsLoading
                  ? "Preparing recommendations..."
                  : "No recommendations"}
            </div>
            <div className="relative flex gap-3">
              {environment.enableCentauriAssistant && isChatbotOpen ? (
                <div className="absolute bottom-[calc(100%+14px)] right-0 z-30 w-[360px] overflow-hidden rounded-[24px] border border-[#d7e3f4] bg-[linear-gradient(180deg,#ffffff_0%,#f6faff_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                  <div className="border-b border-[#e2e8f0] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_42%),linear-gradient(135deg,#eff6ff_0%,#ffffff_72%)] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d4ed8] text-white shadow-[0_12px_24px_rgba(29,78,216,0.28)]">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Centauri Assistant</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Apply article updates using the recommendation set already loaded in the editor.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsChatbotOpen(false)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
                        aria-label="Close chatbot"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    {assistantView === "actions" ? (
                      <>
                        <div className="rounded-[18px] border border-[#dbeafe] bg-white px-4 py-3 shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                            Recommended
                          </p>
                          <button
                            type="button"
                            onClick={applyAllRecommendations}
                            disabled={!recommendationsReady}
                            className="mt-3 flex w-full items-start gap-3 rounded-[18px] border border-[#dbeafe] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-3 text-left transition hover:border-[#93c5fd] hover:bg-[linear-gradient(180deg,#eff6ff_0%,#e0eeff_100%)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#dbeafe] text-[#1d4ed8]">
                              <WandSparkles className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Apply all the recommendations
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Best when you want the quickest cleanup using the full recommendation set.
                              </p>
                            </div>
                          </button>
                        </div>

                        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            More Control
                          </p>
                          <button
                            type="button"
                            onClick={openSelectiveRecommendations}
                            disabled={!recommendationsReady}
                            className="mt-3 flex w-full items-start gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-700">
                              <ListFilter className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Apply selective recommendations
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Pick only the updates you want. We’ll start with a few suggested items so it feels manageable.
                              </p>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setAssistantView("actions")}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                          </button>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-900">
                              {selectedAssistantRecommendationIds.length} selected
                            </p>
                            <p className="text-[11px] text-slate-500">You can mix and match safely</p>
                          </div>
                        </div>

                        <div className="rounded-[18px] border border-[#dbeafe] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">
                            Choose the updates you want to apply
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            We grouped the recommendations by impact so you can scan them quickly without feeling overloaded.
                          </p>
                        </div>

                        <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                          {assistantGroups.map((group) => {
                            const items = assistantRecommendations.filter(
                              (recommendation) => recommendation.group === group.key,
                            );

                            if (!items.length) {
                              return null;
                            }

                            const selectedCount = items.filter((recommendation) =>
                              selectedAssistantRecommendationIds.includes(recommendation.id),
                            ).length;

                            return (
                              <div
                                key={group.key}
                                className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{group.helper}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleAssistantGroup(group.key)}
                                    className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold text-[#1d4ed8] transition hover:bg-[#dbeafe]"
                                  >
                                    {selectedCount === items.length ? "Clear group" : "Select group"}
                                  </button>
                                </div>

                                <div className="mt-3 space-y-2">
                                  {items.map((recommendation) => {
                                    const checked = selectedAssistantRecommendationIds.includes(
                                      recommendation.id,
                                    );

                                    return (
                                      <label
                                        key={recommendation.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-[16px] border px-3 py-3 transition ${
                                          checked
                                            ? "border-[#93c5fd] bg-[#f8fbff]"
                                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            toggleAssistantRecommendation(recommendation.id)
                                          }
                                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1d4ed8] focus:ring-[#1d4ed8]"
                                        />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900">
                                              {recommendation.title}
                                            </p>
                                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                              {recommendation.priority}
                                            </span>
                                          </div>
                                          <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {recommendation.description}
                                          </p>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={applySelectedRecommendations}
                          disabled={!selectedAssistantRecommendationIds.length || !recommendationsReady}
                          className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#1d4ed8] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(29,78,216,0.22)] transition hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Apply selected recommendations
                        </button>
                      </>
                    )}

                    <div className="rounded-[16px] border border-slate-200 bg-white/80 px-4 py-3">
                      <p className="text-xs leading-6 text-slate-500">
                        {recommendationsReady
                          ? `${totalRecommendations} recommendations are ready to use in this article.`
                          : "Recommendations are still loading. The assistant will activate once they are ready."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {environment.enableCentauriAssistant ? (
                <button
                  type="button"
                  onClick={() => {
                    setAssistantView("actions");
                    setIsChatbotOpen((current) => !current);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d7e3f4] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-2.5 font-medium text-[#1d4ed8] shadow-sm transition hover:border-[#93c5fd] hover:bg-[linear-gradient(180deg,#eff6ff_0%,#e0eeff_100%)]"
                >
                  <Bot className="h-4 w-4" />
                  Centauri Assistant
                </button>
              ) : null}
              <button
                onClick={handleDownload}
                disabled={recommendationsLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                <Download className="w-4 h-4" />
                Download Recommendations
              </button>
              <button
                type="button"
                onClick={handleStartNewAnalysis}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-800 transition hover:bg-slate-50"
              >
                Start New Analysis
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

function RecommendationLoader() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[18px] border border-[#d9e4f4] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#dbeafe_0%,#eff6ff_42%,#ffffff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_40px_rgba(37,99,235,0.12)]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#bfdbfe] border-t-[#2563eb] border-r-[#1d4ed8]" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">Preparing recommendations</p>
      <p className="mt-2 text-xs leading-6 text-slate-500">
        Your editor is ready. Recommendation cards will appear here in a moment.
      </p>
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
