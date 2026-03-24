import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateAccount } from "@/components/sections/CreateAccount";
import { SignUp } from "@/components/sections/SignUp";
import { CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: "login" | "register";
  onViewChange: (view: "login" | "register") => void;
}

export function AuthDialog({ open, onOpenChange, view, onViewChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[radial-gradient(circle_at_top,rgba(20,62,122,0.32)_0%,rgba(15,23,42,0.72)_58%,rgba(2,6,23,0.88)_100%)] backdrop-blur-[10px]"
        className="max-h-[94vh] w-[calc(100vw-20px)] max-w-[1080px] overflow-hidden rounded-[28px] border border-white/25 bg-[linear-gradient(135deg,rgba(12,27,52,0.92)_0%,rgba(17,61,117,0.86)_42%,rgba(238,244,255,0.98)_42.1%,rgba(255,255,255,0.98)_100%)] p-0 shadow-[0_40px_110px_rgba(2,6,23,0.42)] sm:w-[calc(100vw-32px)] sm:rounded-[34px]"
      >
        <DialogTitle className="sr-only">
          {view === "login" ? "Sign in to Centauri" : "Create your Centauri account"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Authenticate to access the article analysis workspace.
        </DialogDescription>

        <div className="grid max-h-[94vh] grid-cols-1 overflow-y-auto lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="relative overflow-hidden bg-[linear-gradient(180deg,#0f172a_0%,#12396f_54%,#173f7a_100%)] px-6 py-8 text-white sm:px-8 sm:py-9 lg:px-8 lg:py-8">
            <div className="absolute inset-0">
              <div className="absolute -left-14 top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-[#60a5fa]/20 blur-3xl" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.08)_100%)]" />
            </div>

            <div className="relative flex h-full flex-col">
              <img src="/assets/hero-logo.png" alt="Centauri" className="w-[160px] sm:w-[180px]" />

              <div className="mt-8 sm:mt-10">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Analysis Workspace
                </p>
                <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                  {view === "login"
                    ? "Log in and start analyzing in minutes"
                    : "Create your account and unlock article analysis"}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/72 sm:leading-7">
                  Designed for teams that want a fast, polished workflow from authentication to
                  upload, review, and optimization.
                </p>
              </div>

              <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                <FeatureRow
                  icon={LockKeyhole}
                  title="Secure access"
                  description="Protected sign-in before any article is processed or analyzed."
                />
                <FeatureRow
                  icon={CheckCircle2}
                  title="Immediate next step"
                  description="After login, users land directly in the content upload workspace."
                />
                <FeatureRow
                  icon={Sparkles}
                  title="Guided experience"
                  description="A focused flow that keeps the path to analysis clear and friction-free."
                />
              </div>

              <div className="mt-6 rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md sm:mt-8 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  Product Flow
                </p>
                <p className="mt-2 text-sm leading-6 text-white/85">
                  Sign in, upload a draft, run analysis, and continue refining without leaving the
                  workspace.
                </p>
              </div>
            </div>
          </aside>

          <section className="relative bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.42)_0%,rgba(255,255,255,0)_36%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#f9fbff_100%)] px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-10 top-10 h-20 w-20 rounded-full border border-[#d9e4f5]" />
              <div className="absolute bottom-12 left-12 h-24 w-24 rounded-full border border-[#d9e4f5]" />
            </div>

            <div className="relative mx-auto flex min-h-full w-full max-w-[540px] items-center">
              <div className="w-full">
                <div className="mb-4 px-1 sm:mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                    {view === "login" ? "Welcome Back" : "Account Setup"}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {view === "login" ? "Access your Centauri workspace" : "Join Centauri"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {view === "login"
                      ? "Use your account to continue with article upload and analysis."
                      : "Create your account to start analyzing content with a guided workflow."}
                  </p>
                </div>

                {view === "login" ? (
                  <SignUp
                    variant="dialog"
                    onSignInSuccess={() => onOpenChange(false)}
                    onCreateAccount={() => onViewChange("register")}
                  />
                ) : (
                  <CreateAccount variant="dialog" onBackToLogin={() => onViewChange("login")} />
                )}
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/12">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/68">{description}</p>
      </div>
    </div>
  );
}
