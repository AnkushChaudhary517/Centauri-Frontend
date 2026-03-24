interface HeroProps {
  onLoginClick?: () => void;
}

export function Hero({ onLoginClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/shape.png)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-36">
        <div className="flex flex-col lg:flex-row gap-14">
          <div className="max-w-xl">
            <img
              src="/assets/hero-logo.png"
              style={{ maxWidth: "250px", maxHeight: "40px", marginBottom: "1.5rem" }}
            />
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight mb-6 font-Sora">
              End-to-end AI and SEO checker for better rankings
            </h1>

            <p className="text-base sm:text-lg text-gray-200 font-Sora">
              Spot weak sections instantly and get a structured report that
              improves clarity, structure, originality, and search performance.
            </p>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
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
            </div>
          </div>

          <div
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
          </div>
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
