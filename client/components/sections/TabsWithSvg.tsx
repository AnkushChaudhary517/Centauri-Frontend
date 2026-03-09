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
            title="Readability Score"
            description="Make your content easier to read and easier to follow. The readability checker highlights long sentences, dense paragraphs, and flow issues that slow readers down. Clear, scannable writing keeps users engaged longer and reduces drop-offs across long-form content."
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
          description="Improve SEO signals so your content reaches the right audience and stands a better chance of ranking higher on search engines. Clearer claims and stronger reasoning help Google trust your content faster."
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
          description="Protect your content from sounding recycled and avoid credibility issues that come from hidden duplication. Original ideas strengthen your brand voice and keep your message distinct."
          summaryTitle="Plagiarism Analysis"
          summaryText="Most of your content is contextually original."
          score={
            analysisResult?.finalScores.userVisible.expertiseScore ?? 0
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
          description="Get better placement in AI summaries by making your writing easier for AI systems to read and interpret. A clean structure increases your chances of appearing as an answer when users search through AI tools."
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
          description="Build stronger trust by writing with clarity and confidence. Readers respond better to content that feels informed, direct, and sure of its claims."
          summaryTitle="Authority Evaluation"
          summaryText="Content shows good credibility but lacks expert citations."
          score={
            analysisResult?.finalScores.userVisible.authorityScore ?? 58
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
