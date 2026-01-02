import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrialCTA() {
  return (
    <div className="trial-cta-section bg-primary text-primary-foreground py-12 sm:py-16 lg:py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Create your account to begin
            <br />
            your <span className="text-secondary">free trial</span> today.
          </h2>
          <p className="text-lg text-gray-200">
            Enjoy using Centauri consistently and reliably.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-secondary">✓</span>
            <span>3.0 higher visibility on SERP + 3 month</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-secondary">✓</span>
            <span>2500 rating in just 3 months free trial</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-secondary">✓</span>
            <span>37% improvement in engagement with higher</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-secondary">✓</span>
            <span>50% better conversion rates, always free 6</span>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              placeholder="Email / Phone"
              className="bg-white bg-opacity-10 border border-white border-opacity-30 text-white placeholder-gray-300"
            />
            <Input
              type="password"
              placeholder="Password"
              className="bg-white bg-opacity-10 border border-white border-opacity-30 text-white placeholder-gray-300"
            />
          </div>

          <Button className="w-full bg-secondary hover:bg-blue-700 text-white font-semibold py-2.5">
            Login
          </Button>

          {/* Sign in with Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-white border-opacity-30 text-white rounded-lg py-2.5 hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#fff"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Privacy note */}
          <p className="text-xs text-gray-300 text-center">
            Already have an account?{" "}
            <a href="#" className="text-secondary hover:underline">
              Sign in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
