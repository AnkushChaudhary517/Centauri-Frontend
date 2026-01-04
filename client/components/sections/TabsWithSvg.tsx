import React, { useState } from "react";
import InsightCard from "./InsightCard";
import type { AnalysisResponse } from "@/services/seoAnalysis";

type TabKey = "readability" | "seo" | "ai" | "plagiarism" | "authority";

interface Props {
  analysisResult?: AnalysisResponse | null;
}

const tabs = [
  { key: "seo", label: "SEO Score" },
  { key: "ai", label: "AI Indexing Score" },
  { key: "readability", label: "Readability Review" },
  { key: "authority", label: "Authority Score" },
  { key: "plagiarism", label: "Contexual Plagiarism" },
];

const TabsWithInsight: React.FC<Props> = ({ analysisResult }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("readability");

  return (
    <section className="py-16">
      <h2 className="text-4xl font-bold text-center mb-10">
        <span className="text-orange-500">Improve</span> how your content is read,
        <br /> ranked, and understood
      </h2>

      {/* TABS */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              activeTab === tab.key
                ? "bg-orange-500 text-white"
                : "border border-blue-500 text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4">
        {activeTab === "readability" && (
          <InsightCard
            title="Readability Review"
            description="Identify friction points with the integrated readability checker so you can improve content readability across long-form drafts."
            summaryTitle="Readability Review"
            summaryText="20% of this text appears to be AI-generated"
            score={
              analysisResult?.finalScores.userVisible.readabilityScore ?? 20
            }
            stats={[
              { label: "Resembles AI text", value: 20, color: "orange" },
              { label: "No AI text patterns found", value: 80, color: "blue" },
            ]}
            analysisResult={analysisResult}
          />
        )}
        {activeTab === "seo" && (
          <InsightCard
          title="SEO Score"
          description="Analyze how well your content is optimized for search engines, including keyword placement, metadata usage, and on-page SEO factors."
          summaryTitle="SEO Performance"
          summaryText="Your content has moderate on-page SEO optimization."
          score={
            analysisResult?.finalScores.userVisible.seoScore ?? 65
          }
          stats={[
            { label: "SEO optimized sections", value: 65, color: "blue" },
            { label: "Needs SEO improvement", value: 35, color: "orange" },
          ]}
          analysisResult={analysisResult}
        />
        )}
        {activeTab === "plagiarism" && (
          <InsightCard
          title="Contextual Plagiarism"
          description="Detect semantic and contextual similarity with existing content across the web to ensure originality and uniqueness."
          summaryTitle="Plagiarism Analysis"
          summaryText="Most of your content is contextually original."
          score={
            analysisResult?.level2Scores.plagiarismScore ?? 88
          }
          stats={[
            { label: "Original content", value: 88, color: "blue" },
            { label: "Contextual similarity detected", value: 12, color: "orange" },
          ]}
          analysisResult={analysisResult}
        />
        
        )}
        {activeTab === "ai" && (
          <InsightCard
          title="AI Indexing Score"
          description="Evaluate how well your content can be indexed, interpreted, and trusted by AI-driven search and discovery engines."
          summaryTitle="AI Indexing Review"
          summaryText="Some parts of this content may resemble AI-generated patterns."
          score={
            analysisResult?.finalScores.userVisible.aiIndexingScore ?? 72
          }
          stats={[
            { label: "Human-like content", value: 72, color: "blue" },
            { label: "AI-pattern resemblance", value: 28, color: "orange" },
          ]}
          analysisResult={analysisResult}
        />
        
        )}
{activeTab === "authority" && (
          <InsightCard
          title="Authority Score"
          description="Measure how authoritative and trustworthy your content appears based on credibility signals, structure, and topical depth."
          summaryTitle="Authority Evaluation"
          summaryText="Content shows good credibility but lacks expert citations."
          score={
            analysisResult?.level2Scores.authorityScore ?? 58
          }
          stats={[
            { label: "Authority signals present", value: 58, color: "blue" },
            { label: "Credibility gaps", value: 42, color: "orange" },
          ]}
          analysisResult={analysisResult}
        />
        
        
        )}
      </div>
    </section>
  );
};

export default TabsWithInsight;
