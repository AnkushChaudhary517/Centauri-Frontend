/**
 * HowItWorks Step Components
 * Specialized components for displaying step-by-step process with asset images
 */

import { ReactNode } from "react";
import { ASSETS } from "@/lib/assets";

interface HowItWorksStepProps {
  stepNumber: number;
  stepLabel: string;
  title: string;
  description: string;
  imageUrl: string;
  shapeBackground?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Individual step component for HowItWorks section
 */
export function HowItWorksStep({
  stepNumber,
  stepLabel = `Step ${stepNumber}`,
  title,
  description,
  imageUrl,
  shapeBackground = ASSETS.shapes.shape43,
  className = "",
  children,
}: HowItWorksStepProps) {
  return (
    <div className={`flex flex-col items-start gap-6 group ${className}`}>
      {/* Image with shape background */}
      <div className="relative w-full max-w-xs">
        {/* Background shape */}
        <div className="absolute inset-0 opacity-80 transform group-hover:scale-105 transition-transform duration-300">
          <img
            src={shapeBackground}
            alt="Background shape"
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        {/* Main image */}
        <div className="relative aspect-square flex items-center justify-center p-6">
          <img
            src={imageUrl}
            alt={`${stepLabel}: ${title}`}
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Step badge */}
        <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-3 shadow-md">
          {stepLabel}
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{title}</h3>

        {/* Description */}
        <p className="text-base text-gray-700 leading-relaxed mb-4">{description}</p>

        {/* Additional children content */}
        {children}
      </div>
    </div>
  );
}

/**
 * Vertical steps layout for HowItWorks
 */
export function HowItWorksVertical({
  steps,
  className = "",
}: {
  steps: HowItWorksStepProps[];
  className?: string;
}) {
  return (
    <div className={`space-y-8 sm:space-y-12 lg:space-y-16 ${className}`}>
      {steps.map((step, index) => (
        <HowItWorksStep key={index} {...step} stepNumber={step.stepNumber || index + 1} />
      ))}
    </div>
  );
}

/**
 * Grid layout for HowItWorks with 2 or 4 columns
 */
export function HowItWorksGrid({
  steps,
  columns = 2,
  className = "",
}: {
  steps: HowItWorksStepProps[];
  columns?: 2 | 4;
  className?: string;
}) {
  const gridClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={`grid ${gridClass} gap-6 sm:gap-8 ${className}`}>
      {steps.map((step, index) => (
        <HowItWorksStep key={index} {...step} stepNumber={step.stepNumber || index + 1} />
      ))}
    </div>
  );
}

/**
 * Pre-configured HowItWorks steps using default assets
 */
export const DEFAULT_HOW_IT_WORKS_STEPS: HowItWorksStepProps[] = [
  {
    stepNumber: 1,
    stepLabel: "Step 1",
    title: "Sign up and log in",
    description: "Create your account, confirm your email, and access your dashboard.",
    imageUrl: ASSETS.chatgptImages.chatgptImageDec182025,
    shapeBackground: ASSETS.shapes.shape43,
  },
  {
    stepNumber: 2,
    stepLabel: "Step 2",
    title: "Upload or paste your content",
    description: "Upload a document or paste your draft directly into the editor.",
    imageUrl: ASSETS.chatgptImages.chatgptImageDec1802252,
    shapeBackground: ASSETS.shapes.shape43Copy2,
  },
  {
    stepNumber: 3,
    stepLabel: "Step 3",
    title: "Run the review using our content scoring tool",
    description:
      'Click "Review" to see your SEO content checker, originality checker, readability checker, and authority score checker results on one screen.',
    imageUrl: ASSETS.chatgptImages.chatgptImageDec1802253,
    shapeBackground: ASSETS.shapes.shape43Copy,
  },
  {
    stepNumber: 4,
    stepLabel: "Step 4",
    title: "Download your structured report",
    description: "Export a file with section-level comments and clear, actionable suggestions.",
    imageUrl: ASSETS.chatgptImages.chatgptImageDec1802254,
    shapeBackground: ASSETS.shapes.shape43Copy,
  },
];

/**
 * Complete HowItWorks section component
 */
export function HowItWorksSection({
  title = "How Centauri works as your end-to-end content review tool",
  steps = DEFAULT_HOW_IT_WORKS_STEPS,
  layout = "grid",
  className = "",
}: {
  title?: string;
  steps?: HowItWorksStepProps[];
  layout?: "vertical" | "grid" | "grid-4";
  className?: string;
}) {
  return (
    <section className={`py-12 sm:py-16 lg:py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
          {title}
        </h2>

        {/* Steps */}
        {layout === "vertical" && <HowItWorksVertical steps={steps} />}
        {layout === "grid" && <HowItWorksGrid steps={steps} columns={2} />}
        {layout === "grid-4" && <HowItWorksGrid steps={steps} columns={4} />}
      </div>
    </section>
  );
}
