import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getStoredRemainingCredits,
  getStoredSubscription,
  authAPI,
  type AuthUser,
  type CurrentSubscription,
  type RemainingCredits,
} from "@/utils/AuthApi";
import { useEffect, useState } from "react";
import { CircleDollarSign, LogOut, Menu, Trash2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  isSignedIn: boolean;
  user?: AuthUser | null;
  onLoginClick?: () => void;
  onLogout?: () => void | Promise<void>;
}

export function Header({ isSignedIn, user, onLoginClick, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<RemainingCredits | null>(null);
  const [isRemovingAccount, setIsRemovingAccount] = useState(false);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const displayName = fullName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    if (!isSignedIn) {
      setSubscription(null);
      setRemainingCredits(null);
      return;
    }

    const syncLocalState = () => {
      setSubscription(getStoredSubscription());
      setRemainingCredits(getStoredRemainingCredits());
    };

    syncLocalState();
    window.addEventListener("centauri:subscription-updated", syncLocalState);
    window.addEventListener("centauri:credits-updated", syncLocalState);

    return () => {
      window.removeEventListener("centauri:subscription-updated", syncLocalState);
      window.removeEventListener("centauri:credits-updated", syncLocalState);
    };
  }, [isSignedIn]);

  const handleRemoveAccount = async () => {
    if (isRemovingAccount) {
      return;
    }

    const confirmed = window.confirm(
      "Remove your account permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsRemovingAccount(true);
      const response = await authAPI.deleteAccount();
      await onLogout?.();
      navigate("/", { replace: true });
      toast({
        title: "Account removed",
        description: response?.message || "Your account was removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Could not remove account",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while removing your account.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingAccount(false);
    }
  };

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center">
          <img
            src="/assets/hero-logo.png"
            alt="Centauri"
            className="h-auto w-[170px] sm:w-[210px]"
          />
        </a>

        {isSignedIn && (
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

              <div className="mt-2 rounded-xl border border-[#dce7f6] bg-[#f8fbff] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current Subscription
                </p>
                {subscription ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{subscription.name}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {subscription.status === "trial"
                        ? `${subscription.articleAnalysesPerMonth} credits available for 14 days`
                        : `${subscription.articleAnalysesPerMonth} analyses/month`}
                    </p>
                    <p className="mt-1 text-xs text-[#2563eb]">{subscription.priceLabel}</p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                      {subscription.status === "trial" ? "Trial Access" : subscription.status || "Active"}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No active subscription selected yet.</p>
                )}
              </div>

              <div className="mt-2 rounded-xl border border-[#dce7f6] bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Remaining Credits
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {remainingCredits?.available ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {remainingCredits?.used || remainingCredits?.total
                    ? `${remainingCredits.used ?? 0} used of ${remainingCredits.total ?? remainingCredits.available}`
                    : "Available for upcoming analyses"}
                </p>
              </div>

              <DropdownMenuItem
                className="mt-2 rounded-xl px-3 py-3 text-slate-700 focus:bg-slate-50"
                onSelect={(event) => {
                  event.preventDefault();
                  navigate("/pricing");
                }}
              >
                <CircleDollarSign className="mr-2 h-4 w-4 text-[#2563eb]" />
                Get Subscription
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

              <DropdownMenuItem
                className="rounded-xl px-3 py-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                disabled={isRemovingAccount}
                onSelect={(event) => {
                  event.preventDefault();
                  void handleRemoveAccount();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isRemovingAccount ? "Removing Account..." : "Remove Account"}
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
        ) }
      </div>
    </header>
  );
}
