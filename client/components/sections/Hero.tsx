import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleDollarSign, LogOut, Menu, UserRound } from "lucide-react";
import type { AuthUser } from "@/utils/AuthApi";

interface HeroProps {
  onLogout?: () => void;
  isSignedIn: boolean;
  user?: AuthUser | null;
}

export function Hero({ onLogout, isSignedIn, user }: HeroProps) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const displayName = fullName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/shape.png)" }}
      />

      {isSignedIn ? (
        <div className="absolute right-6 top-6 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full border-white/20 bg-white/95 p-0 text-slate-900 shadow-lg hover:bg-white"
                aria-label="Open account menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-72 rounded-2xl border-slate-200 bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.14)]"
            >
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#1d4ed8]">
                    {initials || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email || "Signed in"}</p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <div className="rounded-xl bg-[linear-gradient(135deg,#eff6ff_0%,#f8fbff_100%)] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                  Workspace
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Manage your account, add credits, and continue optimizing content.
                </p>
              </div>

              <DropdownMenuItem
                className="mt-2 rounded-xl px-3 py-3 text-slate-700 focus:bg-slate-50"
                onSelect={(event) => {
                  event.preventDefault();
                }}
              >
                <CircleDollarSign className="mr-2 h-4 w-4 text-[#2563eb]" />
                Add Credits
              </DropdownMenuItem>

              <DropdownMenuItem
                className="rounded-xl px-3 py-3 text-slate-700 focus:bg-slate-50"
                onSelect={(event) => {
                  event.preventDefault();
                }}
              >
                <UserRound className="mr-2 h-4 w-4 text-slate-500" />
                Account Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="rounded-xl px-3 py-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                onSelect={(event) => {
                  event.preventDefault();
                  onLogout?.();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

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
