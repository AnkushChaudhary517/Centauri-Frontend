/**
 * AssetImage Component
 * A flexible wrapper component for displaying asset images with various sizing options
 */

import { ReactNode } from "react";
import { ASSETS } from "@/lib/assets";

interface AssetImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "scale-down";
  loading?: "lazy" | "eager";
  priority?: boolean;
  children?: ReactNode;
}

/**
 * General purpose image component for assets
 */
export function AssetImage({
  src,
  alt = "Asset image",
  className = "",
  width,
  height,
  fill = false,
  objectFit = "contain",
  loading = "lazy",
  priority = false,
  children,
}: AssetImageProps) {
  const containerClasses = `relative ${fill ? "w-full h-full" : ""} ${className}`;

  const imageProps = {
    src,
    alt,
    loading: loading as "lazy" | "eager",
    decoding: "async" as const,
  };

  if (fill) {
    return (
      <div className={containerClasses}>
        <img
          {...imageProps}
          className={`absolute inset-0 w-full h-full ${
            objectFit === "contain"
              ? "object-contain"
              : objectFit === "cover"
                ? "object-cover"
                : objectFit === "scale-down"
                  ? "object-scale-down"
                  : "object-fill"
          }`}
        />
        {children}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <img
        {...imageProps}
        width={width}
        height={height}
        className={`${
          objectFit === "contain"
            ? "object-contain"
            : objectFit === "cover"
              ? "object-cover"
              : objectFit === "scale-down"
                ? "object-scale-down"
                : "object-fill"
        }`}
      />
      {children}
    </div>
  );
}

/**
 * Decorative shape component for visual elements
 */
export function DecorativeShape({
  assetKey: _assetKey,
  src,
  className = "",
  width = 100,
  height = 100,
  position = "absolute",
  opacity = 1,
}: {
  assetKey?: string;
  src?: string;
  className?: string;
  width?: number;
  height?: number;
  position?: "relative" | "absolute" | "fixed" | "sticky";
  opacity?: number;
}) {
  const imageUrl = src || ASSETS.shapes.shape1;

  return (
    <div
      className={`${position} pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <img
        src={imageUrl}
        alt="Decorative shape"
        width={width}
        height={height}
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

/**
 * Ellipse/circle decorator component
 */
export function EllipseDecorator({
  src,
  className = "",
  width = 200,
  height = 200,
  position = "absolute",
  blur = false,
}: {
  src?: string;
  className?: string;
  width?: number;
  height?: number;
  position?: "relative" | "absolute" | "fixed" | "sticky";
  blur?: boolean;
}) {
  const imageUrl = src || ASSETS.ellipses.ellipse2;

  return (
    <div
      className={`${position} pointer-events-none ${blur ? "blur-xl" : ""} ${className}`}
    >
      <img
        src={imageUrl}
        alt="Ellipse decoration"
        width={width}
        height={height}
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

/**
 * Pointer/indicator component
 */
export function PointerElement({
  src = ASSETS.pointers.pointer,
  className = "",
  width = 118,
  height = 51,
}: {
  src?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <img
      src={src}
      alt="Pointer"
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
      loading="lazy"
    />
  );
}

/**
 * Path/line decorator component
 */
export function PathLine({
  src = ASSETS.paths.path,
  className = "",
  width = 2,
  height = 93,
}: {
  src?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <img
      src={src}
      alt="Path line"
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
      loading="lazy"
    />
  );
}

/**
 * Background image wrapper with opacity control
 */
export function BackgroundAsset({
  src,
  children,
  className = "",
  opacity = 1,
}: {
  src: string;
  children?: ReactNode;
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ opacity: 1 - opacity, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
