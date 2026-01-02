/**
 * Decorative Elements Component Library
 * Reusable decorative and visual enhancement components using asset images
 */

import { ASSETS } from "@/lib/assets";

/**
 * Background with ellipse decorations
 */
export function BackgroundWithEllipses({
  children,
  className = "",
  leftEllipse = true,
  rightEllipse = true,
  topEllipse = true,
}: {
  children: React.ReactNode;
  className?: string;
  leftEllipse?: boolean;
  rightEllipse?: boolean;
  topEllipse?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left decorative ellipse */}
      {leftEllipse && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/4 opacity-40 pointer-events-none">
          <img
            src={ASSETS.ellipses.ellipse2}
            alt=""
            className="w-96 h-96 object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Right decorative ellipse */}
      {rightEllipse && (
        <div className="absolute right-0 bottom-0 translate-x-1/4 opacity-30 pointer-events-none">
          <img
            src={ASSETS.ellipses.ellipse2Copy2}
            alt=""
            className="w-80 h-80 object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Top decorative ellipse */}
      {topEllipse && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-20 pointer-events-none">
          <img
            src={ASSETS.ellipses.ellipse1Copy}
            alt=""
            className="w-96 h-96 object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Corner shape decorations
 */
export function CornerShapeDecoration({
  position = "top-right",
  shape = "shape43",
  opacity = 0.5,
  scale = 1,
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  shape?: keyof typeof ASSETS.shapes;
  opacity?: number;
  scale?: number;
}) {
  const shapeUrl = ASSETS.shapes[shape as keyof typeof ASSETS.shapes];
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none opacity-${Math.round(opacity * 100)}`}
      style={{ opacity }}
    >
      <img
        src={shapeUrl}
        alt="Corner decoration"
        className="w-48 h-48 sm:w-64 sm:h-64"
        style={{ transform: `scale(${scale})` }}
        loading="lazy"
      />
    </div>
  );
}

/**
 * Centered circle with shape background
 */
export function CenteredCircleDecorator({
  size = "lg",
  shapeBackground = ASSETS.shapes.shape43,
  content,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  shapeBackground?: string;
  content?: React.ReactNode;
}) {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-96 h-96",
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} mx-auto`}
      style={{
        backgroundImage: `url(${shapeBackground})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {content && (
        <div className="absolute inset-0 flex items-center justify-center">{content}</div>
      )}
    </div>
  );
}

/**
 * Gradient section with shape accents
 */
export function GradientSectionWithAccents({
  children,
  gradientFrom = "#2b21da",
  gradientTo = "#ff6b00",
  topAccent = true,
  bottomAccent = true,
  className = "",
}: {
  children: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  topAccent?: boolean;
  bottomAccent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative py-16 sm:py-24 lg:py-32 overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(130deg, ${gradientFrom} -25%, ${gradientTo} 125%)`,
      }}
    >
      {/* Top accent */}
      {topAccent && (
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none -mr-20">
          <img
            src={ASSETS.shapes.shape37}
            alt=""
            className="w-64 h-auto"
            loading="lazy"
          />
        </div>
      )}

      {/* Bottom accent */}
      {bottomAccent && (
        <div className="absolute bottom-0 left-0 opacity-20 pointer-events-none -ml-20">
          <img
            src={ASSETS.ellipses.ellipse2}
            alt=""
            className="w-80 h-auto"
            loading="lazy"
          />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

/**
 * Feature card with shape background
 */
export function FeatureCardWithShape({
  title,
  description,
  icon,
  shapeBackground = ASSETS.shapes.shape1,
  className = "",
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  shapeBackground?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 bg-white border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Background shape */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform">
        <img
          src={shapeBackground}
          alt=""
          className="w-40 h-40 object-contain"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {icon && <div className="mb-4 text-4xl">{icon}</div>}

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{title}</h3>

        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/**
 * Divider with decorative elements
 */
export function DecorativeDivider({
  showEllipses = true,
  height = "h-1",
  color = "bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500",
}: {
  showEllipses?: boolean;
  height?: string;
  color?: string;
}) {
  return (
    <div className="relative py-8 sm:py-12">
      {/* Left ellipse */}
      {showEllipses && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 opacity-20 pointer-events-none">
          <img
            src={ASSETS.ellipses.ellipse1Copy9}
            alt=""
            className="w-40 h-40"
            loading="lazy"
          />
        </div>
      )}

      {/* Divider line */}
      <div className={`relative z-10 ${height} ${color}`} />

      {/* Right ellipse */}
      {showEllipses && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-20 pointer-events-none">
          <img
            src={ASSETS.ellipses.ellipse1Copy92}
            alt=""
            className="w-40 h-40"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Text with decorative underline
 */
export function DecoratedText({
  children,
  underlineColor = "bg-orange-500",
  underlineHeight = "h-1",
}: {
  children: React.ReactNode;
  underlineColor?: string;
  underlineHeight?: string;
}) {
  return (
    <div className="relative inline-block">
      {children}
      <div className={`absolute bottom-0 left-0 right-0 ${underlineHeight} ${underlineColor} opacity-70`} />
    </div>
  );
}
