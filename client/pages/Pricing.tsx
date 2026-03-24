import { Header } from "@/components/sections/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  authAPI,
  DEFAULT_TRIAL_SUBSCRIPTION,
  type CurrentSubscription,
  type SubscriptionPlanInput,
} from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";
import { ArrowLeft, BadgeCheck, CheckCircle2, Layers3, Sparkles, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STARTER_PLAN: SubscriptionPlanInput = {
  planId: "starter-monthly",
  name: "Starter Plan",
  monthlyPrice: 15,
  articleAnalysesPerMonth: 10,
  billingCycle: "monthly",
};

const BENEFITS = [
  "10 article analyses per month",
  "Full scoring across structure, authority, and readability",
  "Clear, actionable recommendations for each article",
  "Access to previous analyses",
];

const WHY_CHOOSE_CENTAURI = [
  {
    title: "See exactly what’s missing in your content",
    description:
      "Centauri breaks down your article into measurable components so you know what to fix and why.",
    icon: Target,
  },
  {
    title: "Improve faster with clear recommendations",
    description:
      "No vague suggestions. Each recommendation is tied to a specific gap in your article.",
    icon: Sparkles,
  },
  {
    title: "Built for how modern content is evaluated",
    description:
      "Your content is scored not just for SEO, but also for how AI systems interpret and rank it.",
    icon: Layers3,
  },
  {
    title: "Consistent improvement across every article",
    description:
      "Instead of random edits, you build a repeatable process to improve every piece you publish.",
    icon: Zap,
  },
  {
    title: "Designed for teams that publish regularly",
    description:
      "Whether you're a founder, marketer, or content team, Centauri fits into your workflow without adding complexity.",
    icon: BadgeCheck,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    authAPI
      .getCurrentSubscription()
      .then((result) => setCurrentSubscription(result))
      .catch((error) => {
        console.error("Current subscription load error:", error);
      });
  }, [isAuthenticated, navigate]);

  const displayedSubscription = currentSubscription ?? DEFAULT_TRIAL_SUBSCRIPTION;

  const handleSelectPlan = async () => {
    try {
      setIsSubmitting(true);
      const result = await authAPI.subscribeToPlan(STARTER_PLAN);
      setCurrentSubscription(result.subscription);

      toast({
        title: "Subscription activated",
        description:
          result.message ||
          "Your Starter Plan is active now. You can return to the workspace and continue analyzing articles.",
      });
    } catch (error) {
      console.error("Subscription purchase failed:", error);
      toast({
        title: "Subscription failed",
        description:
          error instanceof Error
            ? error.message
            : "We could not activate your subscription right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1324_0%,#12335f_16%,#eef5ff_16.1%,#ffffff_100%)]">
      <Header isSignedIn={isAuthenticated} user={user} onLogout={logout} />

      <main className="pt-24 sm:pt-28">
        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to workspace
            </button>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
              <div className="rounded-[32px] border border-[#4f78b8] bg-[linear-gradient(135deg,#0f2748_0%,#18457d_52%,#3b82f6_100%)] px-6 py-7 text-white shadow-[0_24px_70px_rgba(2,6,23,0.20)] sm:px-8 sm:py-9">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-100/80">
                  Subscription pricing
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                  Make every article count before you publish
                </h1>
                <p className="mt-6 max-w-3xl rounded-[24px] border border-white/16 bg-slate-950/18 px-5 py-5 text-base leading-8 text-white sm:text-lg">
                  Centauri helps you identify what&apos;s missing in your content before it goes
                  live. Get clear scores across structure, authority, and readability, along with
                  specific fixes you can apply instantly. No guesswork. No endless rewrites. Just
                  better-performing content.
                </p>
              </div>

              <div className="rounded-[30px] border border-[#4f78b8] bg-[linear-gradient(135deg,#102847_0%,#1a4a84_56%,#60a5fa_100%)] p-6 text-white shadow-[0_24px_70px_rgba(2,6,23,0.20)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Current Subscription
                </p>
                <div className="mt-4 rounded-[24px] border border-white/14 bg-slate-950/16 p-5">
                  <p className="text-2xl font-semibold">{displayedSubscription.name}</p>
                  <p className="mt-2 text-sm text-white/72">{displayedSubscription.priceLabel}</p>
                  <p className="mt-2 text-sm text-white/72">
                    {displayedSubscription.status === "trial"
                      ? `${displayedSubscription.articleAnalysesPerMonth} trial credits available for 14 days`
                      : `${displayedSubscription.articleAnalysesPerMonth} article analyses per month`}
                  </p>
                  <p className="mt-4 inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    {displayedSubscription.status || "active"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="rounded-[32px] border border-[#d7e3f4] bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                    Starter Plan
                  </p>
                  <div className="mt-4 grid gap-5 border-b border-[#e7eef8] pb-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
                    <div className="min-w-0">
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Start with focused monthly analysis
                      </h2>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        A clean, predictable plan for teams that want structured feedback before
                        publishing.
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-[#dbe7f6] bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_100%)] px-5 py-5 text-left shadow-sm lg:text-right">
                      <div className="flex items-end gap-2 lg:justify-end">
                        <p className="text-5xl font-bold leading-none tracking-[-0.04em] text-slate-900">
                          $15
                        </p>
                        <p className="pb-1 text-sm font-medium text-slate-500">/ month</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Billed monthly for article analysis access.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    {BENEFITS.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-3 rounded-2xl border border-[#e5edf8] bg-[#fbfdff] px-4 py-4"
                      >
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f0ff]">
                          <CheckCircle2 className="h-4 w-4 text-[#2563eb]" />
                        </div>
                        <p className="text-sm leading-6 text-slate-700">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="rounded-[32px] border border-[#d7e3f4] bg-[linear-gradient(180deg,#0f172a_0%,#183b71_100%)] p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                  Subscription checkout
                </p>
                <h3 className="mt-4 text-3xl font-bold tracking-tight">Starter Plan</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">
                  One simple monthly subscription designed for teams who want to review content
                  before it goes live.
                </p>

                <div className="mt-8 rounded-[24px] border border-white/12 bg-white/10 p-5">
                  <p className="text-sm font-semibold text-white">Included</p>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-5xl font-bold leading-none tracking-[-0.04em]">$15</p>
                    <p className="pb-1 text-sm text-white/70">per month</p>
                  </div>
                  <p className="mt-4 text-sm text-white/80">10 article analyses every month</p>
                </div>

                <Button
                  onClick={handleSelectPlan}
                  disabled={isSubmitting}
                  className="mt-8 h-12 w-full rounded-full bg-white text-slate-900 hover:bg-slate-100"
                >
                  {isSubmitting ? "Activating subscription..." : "Subscribe to Starter Plan"}
                </Button>

                <p className="mt-4 text-center text-xs leading-6 text-white/60">
                  Success and failure states are handled instantly after the subscription API
                  responds.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[32px] border border-[#d7e3f4] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                  Why Choose Centauri
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Built to improve every article with less friction
                </h2>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {WHY_CHOOSE_CENTAURI.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[24px] border border-[#e4ecf7] bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4ff]">
                        <Icon className="h-5 w-5 text-[#2563eb]" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
