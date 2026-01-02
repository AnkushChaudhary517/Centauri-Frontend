/**
 * Metric Card Components with Asset Images
 * Specialized card components for displaying SEO metrics with visual assets
 */

import { ASSETS } from "@/lib/assets";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: "good" | "fair" | "excellent" | "warning";
  backgroundAsset?: string;
  icon?: ReactNode;
  tooltip?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Base metric card component with asset background
 */
export function MetricCardBase({
  title,
  value,
  unit = "",
  status = "good",
  backgroundAsset = ASSETS.backgrounds.base,
  icon,
  tooltip,
  className = "",
  children,
}: MetricCardProps) {
  const statusColors = {
    good: "bg-blue-100 text-blue-700",
    fair: "bg-yellow-100 text-yellow-700",
    excellent: "bg-green-100 text-green-700",
    warning: "bg-red-100 text-red-700",
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-gray-200 p-6 sm:p-8 bg-white shadow-sm transition-all hover:shadow-md ${className}`}
      style={{
        backgroundImage: `url(${backgroundAsset})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background overlay for readability */}
      <div className="absolute inset-0 bg-white/80" />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Icon/Indicator */}
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}

        {/* Title */}
        <h3 className="text-sm font-bold uppercase text-blue-600 mb-4 tracking-wider">
          {title}
        </h3>

        {/* Value with tooltip */}
        <div className="relative inline-block" title={tooltip}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-extrabold text-gray-800">{value}</span>
            {unit && <span className="text-sm font-semibold text-gray-500">{unit}</span>}
          </div>
        </div>

        {/* Status badge */}
        {status && (
          <div className={`mt-4 inline-block px-4 py-2 rounded-full text-xs font-semibold ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}

        {/* Children content */}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

/**
 * SEO Score card component
 */
export function SEOScoreCard({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <MetricCardBase
      title="SEO Score"
      value={value}
      unit="of 100"
      status="good"
      backgroundAsset={ASSETS.backgrounds.base}
      className={className}
    />
  );
}

/**
 * AI Indexing card component
 */
export function AIIndexingCard({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <MetricCardBase
      title="AI Indexing"
      value={value}
      unit="of 100"
      status="good"
      backgroundAsset={ASSETS.backgrounds.base}
      className={className}
    />
  );
}

/**
 * Plagiarism Detection card component
 */
export function PlagiarismCard({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <MetricCardBase
      title="Plagiarism"
      value={value}
      unit="of 100"
      status="good"
      backgroundAsset={ASSETS.backgrounds.base2}
      className={className}
    />
  );
}

/**
 * Authority Score card component
 */
export function AuthorityCard({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <MetricCardBase
      title="Authority"
      value={value}
      unit="of 100"
      status="excellent"
      backgroundAsset={ASSETS.backgrounds.roundedRectangleAutoSh2}
      className={className}
    />
  );
}

/**
 * Readability Score card component
 */
export function ReadabilityCard({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <MetricCardBase
      title="Readability"
      value={value}
      unit="of 100"
      status="fair"
      backgroundAsset={ASSETS.backgrounds.base2}
      className={className}
    />
  );
}

/**
 * Generic metric card with chart
 */
export function MetricCardWithChart({
  title,
  value,
  chartImage,
  lowLabel = "Low",
  highLabel = "High",
  className = "",
}: {
  title: string;
  value: string | number;
  chartImage: string;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 p-6 sm:p-8 bg-white shadow-sm ${className}`}>
      {/* Title */}
      <h3 className="text-sm font-bold uppercase text-blue-600 mb-4 tracking-wider">{title}</h3>

      {/* Value */}
      <div className="text-center mb-6">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
      </div>

      {/* Chart */}
      <div className="relative h-32 mb-4 flex items-center justify-center">
        <img src={chartImage} alt={`${title} chart`} className="max-w-full h-auto" loading="lazy" />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs font-semibold text-gray-600">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
