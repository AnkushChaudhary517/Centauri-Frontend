import React from "react";
import type { AnalysisResponse } from "@/services/seoAnalysis";

type Stat = {
  label: string;
  value: number;
  color: "orange" | "blue";
};

interface InsightCardProps {
  title: string;
  description: string;
  summaryTitle: string;
  summaryText: string;
  score?: number;
  stats: Stat[];
  analysisResult?: AnalysisResponse | null;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  summaryTitle,
  summaryText,
  score = 0,
  stats,
  analysisResult,
}) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="bg-white border border-blue-500 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-center lg:items-start">
        <h4 className="text-lg font-semibold text-blue-600 mb-1">
          {summaryTitle}
        </h4>
        <p className="text-sm text-gray-500 mb-6">{summaryText}</p>

        {/* CIRCULAR SVG */}
        <svg viewBox="0 0 120 120" className="w-40 h-40 mb-6">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#1E88E5"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#ff7a00"
            strokeWidth="10"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text
            x="60"
            y="68"
            textAnchor="middle"
            className="text-2xl font-bold fill-gray-800"
          >
            {score}%
          </text>
        </svg>

        {/* STATS */}
        <div className="space-y-3 w-full max-w-xs">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    stat.color === "orange"
                      ? "bg-orange-500"
                      : "bg-blue-600"
                  }`}
                />
                <span className="text-gray-700">{stat.label}</span>
              </div>
              <span className="font-semibold">{stat.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
