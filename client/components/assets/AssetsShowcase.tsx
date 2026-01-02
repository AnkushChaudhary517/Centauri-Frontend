/**
 * Assets Showcase Component
 * Demonstrates all available asset components and their usage
 * This can be used for documentation and testing purposes
 */

import {
  AssetImage,
  DecorativeShape,
  EllipseDecorator,
  MetricCardBase,
  HowItWorksGrid,
  DEFAULT_HOW_IT_WORKS_STEPS,
  BackgroundWithEllipses,
  GradientSectionWithAccents,
  FeatureCardWithShape,
  DecorativeDivider,
} from ".";
import { ASSETS } from "@/lib/assets";

export function AssetsShowcase() {
  return (
    <div className="w-full space-y-12 py-12">
      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Centauri Assets Showcase</h1>
        <p className="text-lg text-gray-600">
          A comprehensive demonstration of all available asset components and decorative elements used throughout
          the Centauri application.
        </p>
      </div>

      {/* Asset Images Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Asset Image Components</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* AssetImage Example */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AssetImage</h3>
            <AssetImage
              src={ASSETS.shapes.shape1}
              alt="Example shape asset"
              width={150}
              height={150}
              className="mx-auto"
            />
          </div>

          {/* DecorativeShape Example */}
          <div className="border border-gray-200 rounded-lg p-6 relative h-64">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">DecorativeShape</h3>
            <DecorativeShape src={ASSETS.shapes.shape43} width={200} height={200} />
          </div>

          {/* EllipseDecorator Example */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">EllipseDecorator</h3>
            <EllipseDecorator src={ASSETS.ellipses.ellipse2} width={150} height={150} className="mx-auto" />
          </div>
        </div>
      </section>

      {/* Metric Cards Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Metric Card Components</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCardBase
            title="SEO Score"
            value="85.5"
            unit="/100"
            status="good"
            backgroundAsset={ASSETS.backgrounds.base}
          />

          <MetricCardBase
            title="AI Indexing"
            value="72"
            unit="/100"
            status="fair"
            backgroundAsset={ASSETS.backgrounds.base}
          />

          <MetricCardBase
            title="Authority"
            value="92"
            unit="/100"
            status="excellent"
            backgroundAsset={ASSETS.backgrounds.roundedRectangleAutoSh2}
          />
        </div>
      </section>

      {/* HowItWorks Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">HowItWorks Components</h2>

        <HowItWorksGrid steps={DEFAULT_HOW_IT_WORKS_STEPS} columns={2} />
      </section>

      {/* Decorative Elements Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Decorative Elements</h2>

        {/* BackgroundWithEllipses */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Background with Ellipses</h3>

          <BackgroundWithEllipses
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12"
            leftEllipse={true}
            rightEllipse={true}
          >
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Section Title</h4>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Content with decorative ellipses in the background for visual appeal.
              </p>
            </div>
          </BackgroundWithEllipses>
        </div>

        {/* GradientSectionWithAccents */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Gradient Section with Accents</h3>

          <GradientSectionWithAccents
            gradientFrom="#2b21da"
            gradientTo="#ff6b00"
            className="text-white rounded-2xl"
          >
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-4">Gradient Section</h4>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Eye-catching section with gradient background and decorative shape accents.
              </p>
            </div>
          </GradientSectionWithAccents>
        </div>

        {/* FeatureCardWithShape */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Feature Cards with Shapes</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCardWithShape
              title="Feature 1"
              description="Description of the first feature with shape background decoration."
              icon="🚀"
              shapeBackground={ASSETS.shapes.shape43}
            />

            <FeatureCardWithShape
              title="Feature 2"
              description="Description of the second feature with shape background decoration."
              icon="⚡"
              shapeBackground={ASSETS.shapes.shape37}
            />

            <FeatureCardWithShape
              title="Feature 3"
              description="Description of the third feature with shape background decoration."
              icon="✨"
              shapeBackground={ASSETS.shapes.shape1}
            />
          </div>
        </div>

        {/* DecorativeDivider */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Decorative Divider</h3>

          <div className="space-y-4">
            <p className="text-gray-600">Before divider</p>
            <DecorativeDivider showEllipses={true} />
            <p className="text-gray-600">After divider</p>
          </div>
        </div>
      </section>

      {/* Asset Collections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Asset Collections</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Backgrounds</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• base</li>
              <li>• base2</li>
              <li>• roundedRectangle6</li>
              <li>• roundedRectangleAutoSh</li>
              <li>• roundedRectangleAutoSh2</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Ellipses</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• ellipse1Copy</li>
              <li>• ellipse1Copy7</li>
              <li>• ellipse1Copy72</li>
              <li>• ellipse1Copy8</li>
              <li>• ellipse2</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Shapes</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• shape1 - shape43</li>
              <li>• shape43Copy</li>
              <li>• shape43Copy2</li>
              <li>+ Many more...</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Other Elements</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Paths (lines)</li>
              <li>• Pointers</li>
              <li>• Vectors</li>
              <li>• Chat images</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Usage Guide */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-t border-gray-200 pt-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Usage Guide</h2>

        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Import Assets</h3>
            <code className="block bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              import {"{ ASSETS }"} from "@/lib/assets";
            </code>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Use Asset Components</h3>
            <code className="block bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {`import { MetricCardBase, HowItWorksGrid } from "@/components/assets";`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Reference Assets</h3>
            <code className="block bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {`<img src={ASSETS.shapes.shape43} alt="Shape" />`}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
