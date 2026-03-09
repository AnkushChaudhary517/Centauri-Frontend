import { Button } from "../ui/button";

interface HeroProps {
  onLogout?: () => void;
  isSignedIn: boolean;
}

export function Hero({ onLogout, isSignedIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden text-white">
      {/* BACKGROUND IMAGE (ALWAYS PRESENT) */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/shape.png)" }}
      />

      {/* Logout button */}
      {isSignedIn && (
        <Button
          onClick={onLogout}
          variant="outline"
          className="absolute right-6 top-6 z-20 bg-white text-gray-900 hover:bg-gray-100"
        >
          Logout
        </Button>
      )}

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-36">
        {/* IMPORTANT: flex-col first, row only on lg */}
        <div className="flex flex-col lg:flex-row gap-14">
          
          {/* LEFT CONTENT */}
          <div className="max-w-xl">
          <img
          src="/assets/hero-logo.png"
          style={{maxWidth:"250px",maxHeight:"40px",marginBottom:"1.5rem"}}
          ></img>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight mb-6 font-Sora">
              End-to-end AI and SEO checker for better rankings
            </h1>

            <p className="text-base sm:text-lg text-gray-200 font-Sora">
              Spot weak sections instantly and get a structured report that
              improves clarity, structure, originality, and search performance.
            </p>
          </div>

          {/* RIGHT – METRIC BOXES */}
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

/* ----------------------------- */
/* METRIC CARD */
/* ----------------------------- */

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
      style={{backgroundColor:"#f7f4f2"}}
    >
      <div className="flex-1 flex items-center justify-center" style={{height:"100%",width:"100%"}}>
        <img
          src={image}
          alt={title}
        
        />
      </div>
    </div>
  );
}
