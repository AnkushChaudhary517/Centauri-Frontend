import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  authAPI,
  DEFAULT_TRIAL_CREDITS,
  DEFAULT_TRIAL_SUBSCRIPTION,
  setStoredRemainingCredits,
  setStoredSubscription,
} from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, CheckCircle2, Eye, EyeOff, ShieldCheck, UserCircle2, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateAccountProps {
  onBackToLogin: () => void;
  variant?: "page" | "dialog";
}

export function CreateAccount({
  onBackToLogin,
  variant = "page",
}: CreateAccountProps) {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    contactNumber: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const isBusy = isLoading || isVerifying;

  const sidebarSteps = useMemo(
    () => [
      {
        title: "Your personal details",
        description: "Tell us about yourself",
        icon: UserCircle2,
      },
      {
        title: "Your company details",
        description: "Add your company information",
        icon: Building2,
      },
      {
        title: "Secure your account",
        description: "Set password and contact info",
        icon: ShieldCheck,
      },
    ],
    [],
  );

  const setProfileField = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());
  const validateVerificationCode = (value: string) => /^\d{4,8}$/.test(value.trim());
  const validatePhone = (value: string) => /^\+?[0-9\s()-]{7,20}$/.test(value.trim());

  const validateProfileForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!profileForm.firstName.trim()) {
      nextErrors.firstName = "First name is required";
    }

    if (!profileForm.lastName.trim()) {
      nextErrors.lastName = "Last name is required";
    }

    if (!profileForm.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (profileForm.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (profileForm.contactNumber.trim() && !validatePhone(profileForm.contactNumber)) {
      nextErrors.contactNumber = "Enter a valid contact number";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Send verification code
  const handleSendVerification = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      await authAPI.sendVerificationEmail(email);
      toast({
        title: "Success",
        description: "Verification code sent to your email",
      });
      setShowCodeInput(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send verification code",
        variant: "destructive",
      });
      // Reset for retry
      setShowCodeInput(false);
      setVerificationCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Email and verification code are required",
        variant: "destructive",
      });
      return;
    }

    if (!validateVerificationCode(verificationCode)) {
      toast({
        title: "Error",
        description: "Please enter a valid verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.verifyEmail(email, verificationCode);
      toast({
        title: "Success",
        description: "Email verified successfully",
      });
      setIsProfileDialogOpen(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      setIsLoading(true);

      await authAPI.updateProfile({
        email: email.trim(),
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        company: profileForm.company.trim(),
        contactNumber: profileForm.contactNumber.trim(),
        password: profileForm.password,
      });

      await login(email.trim(), profileForm.password);
      setStoredSubscription(DEFAULT_TRIAL_SUBSCRIPTION);
      setStoredRemainingCredits(DEFAULT_TRIAL_CREDITS);

      setIsProfileDialogOpen(false);
      toast({
        title: "Success",
        description: "Your account is ready. 5 trial credits have been added for 14 days.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to finish setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "signup-section",
        variant === "page" ? "bg-white py-12" : "bg-transparent py-0",
      )}
    >
      <div className={cn("mx-auto", variant === "page" ? "max-w-md px-4" : "max-w-none px-0")}>
        <div
          className={cn(
            "relative rounded-xl border p-8 shadow-sm",
            variant === "page"
              ? "bg-white"
              : "rounded-[28px] border-[#d7e3f4] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,251,255,0.98)_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur",
          )}
        >
          {/* Page Loader Overlay */}
          {isBusy && !isProfileDialogOpen && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl z-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                <p className="text-sm text-gray-600">
                  {isVerifying ? "Sending verification code..." : "Verifying your email..."}
                </p>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6">
            Create your <span className="text-secondary">Account</span>
          </h2>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="E-mail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isBusy || isProfileDialogOpen}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSendVerification}
                disabled={isBusy || showCodeInput}
                className="bg-secondary text-white"
              >
                {isVerifying ? "Sending..." : "Verify"}
              </Button>
            </div>

            {showCodeInput && (
              <Input
                type="text"
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isBusy || isProfileDialogOpen}
              />
            )}

            <Button type="submit" className="w-full bg-secondary" disabled={isBusy || !showCodeInput}>
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button
              onClick={onBackToLogin}
              className="text-secondary hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent
          overlayClassName="bg-slate-950/18 backdrop-blur-md"
          className="h-[100dvh] w-[100vw] max-h-[100dvh] max-w-none overflow-hidden border-0 bg-transparent p-0 shadow-none sm:h-[calc(100dvh-24px)] sm:w-[min(96vw,1120px)] sm:max-h-[calc(100dvh-24px)] sm:max-w-[1120px]"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">Complete your account setup</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in your personal details to complete account setup.
          </DialogDescription>

          <div className="h-full overflow-hidden rounded-none bg-[#e6eef8] shadow-[0_30px_80px_rgba(15,38,74,0.18)] sm:rounded-[32px]">
            <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] lg:grid-rows-1">
              <aside className="relative overflow-hidden bg-[linear-gradient(180deg,#0f5fb8_0%,#0a4689_100%)] px-4 py-4 text-white sm:px-6 sm:py-5 lg:px-7 lg:py-8">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(circle_at_bottom_left,transparent_0,transparent_38%,rgba(255,255,255,0.25)_39%,transparent_40%),radial-gradient(circle_at_bottom_center,transparent_0,transparent_38%,rgba(255,255,255,0.25)_39%,transparent_40%),radial-gradient(circle_at_bottom_right,transparent_0,transparent_38%,rgba(255,255,255,0.25)_39%,transparent_40%)]" />
                </div>

                <div className="relative flex h-full flex-col">
                  <div className="mb-4 flex items-center gap-3 text-sm font-semibold sm:mb-5 lg:mb-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                      <Users2 className="h-4 w-4" />
                    </div>
                    <span>Centauri</span>
                  </div>

                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
                    {sidebarSteps.map((step, index) => {
                      const Icon = step.icon;

                      return (
                        <div key={step.title} className="flex items-center gap-3 lg:items-start">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
                            {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-5">{step.title}</p>
                            <p className="mt-1 hidden text-xs text-white/70 sm:block lg:block">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 hidden lg:block lg:mt-auto">
                    <p className="text-xs text-white/65">All rights reserved @Centauri</p>
                  </div>
                </div>
              </aside>

              <section className="relative min-w-0 overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f2f7ff_55%,#edf4ff_100%)] px-4 py-4 sm:px-7 sm:py-6 lg:px-10 lg:py-8">
                <div className="pointer-events-none absolute inset-y-8 right-0 hidden w-16 overflow-hidden xl:block">
                  <div className="absolute right-6 top-4 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                  <div className="absolute right-0 top-36 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                  <div className="absolute right-6 top-68 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                  <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                </div>

                <div className="mx-auto flex h-full max-w-2xl flex-col justify-start pr-0 lg:justify-center xl:pr-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8ea2bf] sm:text-sm sm:tracking-normal">Step 1/3</p>
                  <h3 className="mt-1 text-xl font-bold text-[#10233f] sm:mt-2 sm:text-3xl">Basic Info</h3>
                  <p className="mt-2 max-w-md text-sm leading-5 text-[#6d7f99] sm:leading-6">
                    Tell us a bit about yourself to get started with your new Centauri account.
                  </p>
                  <div className="mt-3 h-px bg-[#dfe8f4] sm:mt-4" />

                  <form onSubmit={handleFinishSetup} className="mt-4 grid flex-1 content-start gap-3 sm:mt-5 sm:gap-4">
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#334762]">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={profileForm.firstName}
                          onChange={(e) => setProfileField("firstName", e.target.value)}
                          placeholder="John"
                          disabled={isLoading}
                          className="h-10 border-[#ced9ea] bg-white/90 text-sm"
                        />
                        {fieldErrors.firstName ? (
                          <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#334762]">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={profileForm.lastName}
                          onChange={(e) => setProfileField("lastName", e.target.value)}
                          placeholder="Doe"
                          disabled={isLoading}
                          className="h-10 border-[#ced9ea] bg-white/90 text-sm"
                        />
                        {fieldErrors.lastName ? (
                          <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-[#334762]">Company</label>
                      <Input
                        value={profileForm.company}
                        onChange={(e) => setProfileField("company", e.target.value)}
                        placeholder="Your company name"
                        disabled={isLoading}
                        className="h-10 border-[#ced9ea] bg-white/90 text-sm"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-[#334762]">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={email}
                        disabled
                        className="h-10 border-[#ced9ea] bg-[#f6f9ff] text-sm text-[#6d7f99]"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-[#334762]">Contact number</label>
                      <Input
                        value={profileForm.contactNumber}
                        onChange={(e) => setProfileField("contactNumber", e.target.value)}
                        placeholder="+91 9876543210"
                        disabled={isLoading}
                        className="h-10 border-[#ced9ea] bg-white/90 text-sm"
                      />
                      {fieldErrors.contactNumber ? (
                        <p className="text-xs text-red-600">{fieldErrors.contactNumber}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-[#334762]">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={profileForm.password}
                          onChange={(e) => setProfileField("password", e.target.value)}
                          placeholder="Create a password"
                          disabled={isLoading}
                          className="h-10 border-[#ced9ea] bg-white/90 pr-11 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#6d7f99] transition hover:text-[#10233f]"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.password ? (
                        <p className="text-xs text-red-600">{fieldErrors.password}</p>
                      ) : (
                        <p className="text-xs text-[#7f90a8]">
                          Use at least 8 characters for your password.
                        </p>
                      )}
                    </div>

                    <div className="pt-1 sm:col-span-2 sm:pt-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 w-full rounded-md bg-[#0f5fb8] px-7 text-white shadow-sm hover:bg-[#0c4f9a] sm:h-10 sm:w-auto sm:min-w-[170px]"
                      >
                        {isLoading ? "Finishing setup..." : "Finish Setup"}
                      </Button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
