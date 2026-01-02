import { Button } from "../ui/button";
interface HeroProps {
  onLogout?: () => void;
  isSignedIn : () => false;
}
export function Hero({
  onLogout,
  isSignedIn
}) {
  return (
    <div className="hero-section bg-primary text-primary-foreground overflow-hidden">
      {isSignedIn && (<Button
              onClick={onLogout}
              variant="outline"
              className="absolute right-5 top-5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Logout
            </Button>)}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-primary font-bold text-lg">C</span>
              </div>
              <span className="text-white font-bold text-xl">centauri</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold leading-tight">
                End-to-end AI and SEO checker for better rankings
              </h1>
              <p className="text-base sm:text-lg text-gray-200">
                End-to-end SEO checker with content structure, originality, and search performance.
              </p>
            </div>
          </div>

          {/* Right side - Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 - Bar Chart */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 text-secondary"
              >
                {/* Simple bar chart */}
                <rect x="15" y="60" width="8" height="30" fill="currentColor" />
                <rect x="30" y="45" width="8" height="45" fill="currentColor" />
                <rect x="45" y="35" width="8" height="55" fill="currentColor" opacity="0.7" />
                <rect x="60" y="50" width="8" height="40" fill="currentColor" opacity="0.5" />
              </svg>
            </div>

            {/* Card 2 - Gauge Chart */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16"
              >
                {/* Simple gauge */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <path
                  d="M 50 50 L 50 20 A 30 30 0 0 1 75 35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-secondary"
                />
              </svg>
            </div>

            {/* Card 3 - Pie Chart */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16"
              >
                {/* Simple pie chart */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-secondary"
                  strokeDasharray="47 100"
                  strokeDashoffset="0"
                />
              </svg>
            </div>

            {/* Card 4 - Circular Progress */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16"
              >
                {/* Circular progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-accent"
                  strokeDasharray="65 100"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Curved bottom */}
      <div className="relative h-12 -mb-1">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-full text-white"
        >
          <path
            d="M 0,40 Q 360,120 720,100 T 1440,40 L 1440,120 L 0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
