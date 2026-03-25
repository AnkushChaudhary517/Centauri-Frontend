import type { AnalysisResponse } from "@/services/seoAnalysis";

export interface MetricItem {
  label: string;
  value: number;
  max: number;
  color: string;
  showPercentage: boolean;
  description: string;
}

export function getAnalysisMetrics(analysisResult?: AnalysisResponse | null): MetricItem[] {
  if (!analysisResult) return [];

  const userVisible = analysisResult.finalScores.userVisible;

  return [
    {
      label: "SEO Score",
      value: userVisible.seoScore ?? 0,
      max: 100,
      color: "#4f46e5",
      showPercentage: false,
      description:
        "A blended measure of on-page optimization, structure, and keyword alignment.",
    },
    {
      label: "AI Indexing",
      value: userVisible.aiIndexingScore ?? 0,
      max: 100,
      color: "#10b981",
      showPercentage: false,
      description:
        "How well the content is structured for AI systems and machine-assisted discovery.",
    },
    {
      label: "Expertise",
      value: userVisible.expertiseScore ?? 0,
      max: 100,
      color: "#3b82f6",
      showPercentage: true,
      description:
        "Signals that the content demonstrates first-hand knowledge and subject depth.",
    },
    {
      label: "Authority",
      value: userVisible.authorityScore ?? 0,
      max: 100,
      color: "#8b5cf6",
      showPercentage: false,
      description:
        "Indicates how trustworthy and credible the content feels to readers and search systems.",
    },
    {
      label: "Readability",
      value: userVisible.readabilityScore ?? 0,
      max: 100,
      color: "#f97316",
      showPercentage: false,
      description:
        "Estimates how easily readers can scan, understand, and retain the content.",
    },
  ];
}
