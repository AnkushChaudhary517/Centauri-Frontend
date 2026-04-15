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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  getStoredRemainingCredits,
  getStoredSubscription,
  authAPI,
  type AuthUser,
  type CurrentSubscription,
  type RemainingCredits,
} from "@/utils/AuthApi";
import { type ReactNode, useEffect, useState } from "react";
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

  const handlePricingNavigation = () => {
    navigate("/pricing");
  };

  const handleAccountDetails = () => {
    // Placeholder until account details page is available.
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const canGetSubscription = (remainingCredits?.available ?? 0) <= 0;

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 sm:py-6">
        <a href="/" className="flex items-center">
          <img
            src="/assets/hero-logo.png"
            alt="Centauri"
            className="h-auto w-[170px] sm:w-[210px]"
          />
        </a>

        {isSignedIn && (
          <>
            <div className="hidden sm:block">
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
                  sideOffset={10}
                  collisionPadding={16}
                  className="max-h-[min(88svh,40rem)] w-[min(calc(100vw-1rem),20rem)] rounded-2xl border-slate-200 bg-white p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:w-[min(calc(100vw-2rem),21rem)] sm:p-2 data-[side=bottom]:overflow-y-auto"
                >
                  <AccountMenuPanel
                    displayName={displayName}
                    email={user?.email}
                    initials={initials}
                    subscription={subscription}
                    remainingCredits={remainingCredits}
                    isRemovingAccount={isRemovingAccount}
                    canGetSubscription={canGetSubscription}
                    onPricing={handlePricingNavigation}
                    onAccountDetails={handleAccountDetails}
                    onRemoveAccount={() => void handleRemoveAccount()}
                    onLogout={handleLogout}
                    useDropdownItems
                    compact
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-11 rounded-full border-white/20 bg-white/95 p-0 text-slate-900 shadow-lg hover:bg-white"
                    aria-label="Open account menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[min(92vw,24rem)] overflow-y-auto border-l-0 bg-white p-0 sm:max-w-none"
                >
                  <SheetHeader className="border-b border-slate-200 px-5 py-5 text-left">
                    <SheetTitle className="text-base font-semibold text-slate-900">
                      Account
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500">
                      Manage your profile, subscription, and available credits.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4 py-4">
                    <AccountMenuPanel
                      displayName={displayName}
                      email={user?.email}
                      initials={initials}
                      subscription={subscription}
                      remainingCredits={remainingCredits}
                      isRemovingAccount={isRemovingAccount}
                      canGetSubscription={canGetSubscription}
                      onPricing={handlePricingNavigation}
                      onAccountDetails={handleAccountDetails}
                      onRemoveAccount={() => void handleRemoveAccount()}
                      onLogout={handleLogout}
                      compact={false}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

type AccountMenuPanelProps = {
  displayName: string;
  email?: string;
  initials: string;
  subscription: CurrentSubscription | null;
  remainingCredits: RemainingCredits | null;
  isRemovingAccount: boolean;
  canGetSubscription: boolean;
  onPricing: () => void;
  onAccountDetails: () => void;
  onRemoveAccount: () => void;
  onLogout: () => void;
  useDropdownItems?: boolean;
  compact?: boolean;
};

function AccountMenuPanel({
  displayName,
  email,
  initials,
  subscription,
  remainingCredits,
  isRemovingAccount,
  canGetSubscription,
  onPricing,
  onAccountDetails,
  onRemoveAccount,
  onLogout,
  useDropdownItems = false,
  compact = false,
}: AccountMenuPanelProps) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <DropdownMenuLabel className={cn("px-3 py-3", compact && "px-2.5 py-2.5")}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#1d4ed8]",
              compact && "h-10 w-10 text-xs",
            )}
          >
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{email || "Signed in"}</p>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <div
        className={cn(
          "rounded-xl bg-[linear-gradient(135deg,#eff6ff_0%,#f8fbff_100%)] px-3 py-3",
          compact && "px-2.5 py-2.5",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
          Workspace
        </p>
        <p className={cn("mt-2 text-sm leading-6 text-slate-600", compact && "mt-1.5 text-[13px] leading-5")}>
          Manage your account, add credits, and continue optimizing content.
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl border border-[#dce7f6] bg-[#f8fbff] px-3 py-3",
          compact && "px-2.5 py-2.5",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Current Subscription
        </p>
        {subscription ? (
          <>
            <p className="mt-2 text-sm font-semibold text-slate-900">{subscription.name}</p>
            <p
              className={cn(
                "mt-1 text-xs leading-5 text-slate-600",
                compact && "leading-[1.125rem]",
              )}
            >
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

      <div
        className={cn(
          "rounded-xl border border-[#dce7f6] bg-white px-3 py-3",
          compact && "px-2.5 py-2.5",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Remaining Credits
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {remainingCredits?.available ?? 0}
        </p>
        <p
          className={cn(
            "mt-1 text-xs leading-5 text-slate-500",
            compact && "leading-[1.125rem]",
          )}
        >
          {remainingCredits?.used || remainingCredits?.total
            ? `${remainingCredits.used ?? 0} used of ${remainingCredits.total ?? remainingCredits.available}`
            : "Available for upcoming analyses"}
        </p>
      </div>

      <MenuAction
        icon={<CircleDollarSign className="h-4 w-4 text-[#2563eb]" />}
        label="Get Subscription"
        onSelect={onPricing}
        disabled={!canGetSubscription}
        useDropdownItem={useDropdownItems}
        compact={compact}
      />
      <MenuAction
        icon={<UserRound className="h-4 w-4 text-slate-500" />}
        label="Account Details"
        onSelect={onAccountDetails}
        useDropdownItem={useDropdownItems}
        compact={compact}
      />
      {/* <MenuAction
        icon={<Trash2 className="h-4 w-4" />}
        label={isRemovingAccount ? "Removing Account..." : "Remove Account"}
        onSelect={onRemoveAccount}
        disabled={isRemovingAccount}
        destructive
        useDropdownItem={useDropdownItems}
        compact={compact}
      /> */}

      <DropdownMenuSeparator />

      <MenuAction
        icon={<LogOut className="h-4 w-4" />}
        label="Logout"
        onSelect={onLogout}
        destructive
        useDropdownItem={useDropdownItems}
        compact={compact}
      />
    </div>
  );
}

type MenuActionProps = {
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
  useDropdownItem?: boolean;
  compact?: boolean;
};

function MenuAction({
  icon,
  label,
  onSelect,
  disabled = false,
  destructive = false,
  useDropdownItem = false,
  compact = false,
}: MenuActionProps) {
  const actionClassName = cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors",
    compact && "gap-2.5 px-2.5 py-2.5 text-[13px]",
    destructive
      ? "text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700"
      : "text-slate-700 hover:bg-slate-50 focus:bg-slate-50",
    disabled && "pointer-events-none opacity-50",
  );

  if (useDropdownItem) {
    return (
      <DropdownMenuItem
        className={actionClassName}
        disabled={disabled}
        onSelect={(event) => {
          event.preventDefault();
          onSelect();
        }}
      >
        {icon}
        {label}
      </DropdownMenuItem>
    );
  }

  return (
    <button type="button" className={actionClassName} onClick={onSelect} disabled={disabled}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
