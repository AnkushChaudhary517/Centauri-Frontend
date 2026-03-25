import { SignUp } from "@/components/sections/SignUp";

interface HeroProps {
  onLoginClick?: () => void;
  onCreateAccountClick?: () => void;
}

export function Hero({ onLoginClick, onCreateAccountClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/shape.png)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:min-h-screen lg:py-16">
        <div className="flex flex-col gap-14 lg:min-h-[calc(100vh-8rem)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-1 items-center">
            {/* <img
              src="/assets/hero-logo.png"
              style={{ maxWidth: "250px", maxHeight: "40px", marginBottom: "1.5rem" }}
            /> */}
            <div>
              <h1 className="mb-6 font-Sora text-4xl font-bold leading-tight sm:text-5xl xl:text-6xl">
                End-to-end AI and SEO checker for better rankings
              </h1>

              <p className="font-Sora text-base text-gray-200 sm:text-lg">
                Spot weak sections instantly and get a structured report that improves clarity,
                structure, originality, and search performance.
              </p>
            </div>

            {/* <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Required Before Analysis
              </p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
                Sign in to start analyzing your article
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-200">
                Your analysis workspace opens right after login so you can upload a draft and
                begin reviewing it immediately.
              </p>
              <button
                type="button"
                onClick={onLoginClick}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Login To Continue
              </button>
            </div> */}
          </div>

          <div className="w-full max-w-[520px] lg:ml-auto">
            <div className="rounded-[30px] border border-white/18 bg-[linear-gradient(180deg,rgba(13,28,52,0.62)_0%,rgba(255,255,255,0.12)_100%)] p-5 shadow-[0_26px_80px_rgba(2,6,23,0.26)] backdrop-blur-md sm:p-6">
              <h2 className="mb-5 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Sign in to start analyzing your content
              </h2>

              <SignUp
                variant="dialog"
                onSignInSuccess={() => undefined}
                onCreateAccount={onCreateAccountClick}
              />
            </div>
          </div>

          {/* <div
            className="
              grid
              grid-cols-2
              gap-4
              sm:gap-6
              w-full
              max-w-md
              lg:max-w-none
            "
          >
            <MetricCard
              title="SEARCH ENGINE OPTIMIZATION"
              image="/assets/metrics/seo-bar.png"
            />
            <MetricCard
              title="ORIGINALITY"
              image="/assets/metrics/originality-gauge.png"
            />
            <MetricCard
              title="READABILITY"
              image="/assets/metrics/readability-gauge.png"
            />
            <MetricCard
              title="AUTHORITY"
              image="/assets/metrics/authority-gauge.png"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  title,
  image,
}: {
  title: string;
  image: string;
}) {
  return (
    <div
      className="
        rounded-xl
        shadow-xl
        p-3
        sm:p-4
        lg:p-5
        aspect-square
        flex
        flex-col
      "
      style={{ backgroundColor: "#f7f4f2" }}
    >
      <div className="flex-1 flex items-center justify-center" style={{ height: "100%", width: "100%" }}>
        <img src={image} alt={title} />
      </div>
    </div>
  );
}
