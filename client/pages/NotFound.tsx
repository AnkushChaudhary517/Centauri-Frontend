import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SearchX } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_35%,#ffffff_75%)] px-6 py-20">
      <SeoHead
        title="Page Not Found | Centauri"
        description="The page you requested could not be found."
        canonical="https://getcentauri.com/"
        robots="noindex, nofollow"
      />

      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dbeafe]">
            <SearchX className="h-8 w-8 text-[#2563eb]" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
            Error 404
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            This page drifted out of orbit
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            The link may be outdated, or the page may have moved. Head back to Centauri and keep
            improving your content with clear SEO and AI indexing guidance.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-6">
              <a href="/">Return Home</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <a href="/pricing">View Pricing</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
