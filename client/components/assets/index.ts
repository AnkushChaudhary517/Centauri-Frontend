/**
 * Assets Components Barrel Export
 * Central export point for all asset-related components
 */

// Image components
export { AssetImage, DecorativeShape, EllipseDecorator, PointerElement, PathLine, BackgroundAsset } from "./AssetImage";

// Metric card components
export {
  MetricCardBase,
  SEOScoreCard,
  AIIndexingCard,
  PlagiarismCard,
  AuthorityCard,
  ReadabilityCard,
  MetricCardWithChart,
} from "./MetricCardWithAsset";

// HowItWorks components
export {
  HowItWorksStep,
  HowItWorksVertical,
  HowItWorksGrid,
  DEFAULT_HOW_IT_WORKS_STEPS,
  HowItWorksSection,
} from "./HowItWorksStep";

// Decorative elements
export {
  BackgroundWithEllipses,
  CornerShapeDecoration,
  CenteredCircleDecorator,
  GradientSectionWithAccents,
  FeatureCardWithShape,
  DecorativeDivider,
  DecoratedText,
} from "./DecorativeElements";
