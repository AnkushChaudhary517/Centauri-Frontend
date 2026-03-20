import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authAPI } from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, CheckCircle2, ShieldCheck, UserCircle2, Users2 } from "lucide-react";

interface CreateAccountProps {
  onBackToLogin: () => void;
}

export function CreateAccount({ onBackToLogin }: CreateAccountProps) {
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

      setIsProfileDialogOpen(false);
      toast({
        title: "Success",
        description: "Your account has been set up successfully",
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
    <div className="signup-section bg-white py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="border rounded-xl p-8 shadow-sm relative">
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
          overlayClassName="bg-transparent"
          className="w-[min(92vw,980px)] max-w-[980px] overflow-hidden border-0 bg-transparent p-0 shadow-none"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">Complete your account setup</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in your personal details to complete account setup.
          </DialogDescription>

          <div className="overflow-hidden rounded-[32px] bg-[#e6eef8] shadow-[0_30px_80px_rgba(15,38,74,0.18)]">
            <div className="grid max-h-[85vh] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="relative overflow-hidden px-8 py-10 text-white bg-[linear-gradient(180deg,#0f5fb8_0%,#0a4689_100%)] lg:max-h-[85vh]">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(circle_at_bottom_left,transparent_0,transparent_38%,rgba(255,255,255,0.25)_39%,transparent_40%),radial-gradient(circle_at_bottom_center,transparent_0,transparent_38%,rgba(255,255,255,0.25)_39%,transparent_40%),radial-gradient(circle_at_bottom_right,transparent_0,transparent_38%,rgba(255,255,255,0.25)_39%,transparent_40%)]" />
                </div>

                <div className="relative">
                  <div className="mb-14 flex items-center gap-3 text-sm font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                      <Users2 className="h-4 w-4" />
                    </div>
                    <span>Centauri</span>
                  </div>

                  <div className="space-y-7">
                    {sidebarSteps.map((step, index) => {
                      const Icon = step.icon;

                      return (
                        <div key={step.title} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                            {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{step.title}</p>
                            <p className="mt-1 text-xs text-white/70">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-12 text-xs text-white/65 lg:mt-28">All rights reserved @Centauri</p>
                </div>
              </aside>

              <section className="relative min-w-0 overflow-y-auto px-6 py-8 sm:px-8 sm:py-10 lg:max-h-[85vh] lg:px-12 bg-[linear-gradient(135deg,#ffffff_0%,#f2f7ff_55%,#edf4ff_100%)]">
                <div className="pointer-events-none absolute inset-y-8 right-0 hidden w-20 overflow-hidden lg:block">
                  <div className="absolute right-6 top-4 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                  <div className="absolute right-0 top-36 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                  <div className="absolute right-6 top-68 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                  <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full border border-[#d8e4f3]" />
                </div>

                <div className="mx-auto max-w-xl pr-0 lg:pr-8">
                  <p className="text-sm font-semibold text-[#8ea2bf]">Step 1/3</p>
                  <h3 className="mt-3 text-3xl font-bold text-[#10233f]">Basic Info</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#6d7f99]">
                    Tell us a bit about yourself to get started with your new Centauri account.
                  </p>
                  <div className="mt-6 h-px bg-[#dfe8f4]" />

                  <form onSubmit={handleFinishSetup} className="mt-8 space-y-5 pb-2">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#334762]">First name</label>
                        <Input
                          value={profileForm.firstName}
                          onChange={(e) => setProfileField("firstName", e.target.value)}
                          placeholder="John"
                          disabled={isLoading}
                          className="h-11 border-[#ced9ea] bg-white/90"
                        />
                        {fieldErrors.firstName ? (
                          <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#334762]">Last name</label>
                        <Input
                          value={profileForm.lastName}
                          onChange={(e) => setProfileField("lastName", e.target.value)}
                          placeholder="Doe"
                          disabled={isLoading}
                          className="h-11 border-[#ced9ea] bg-white/90"
                        />
                        {fieldErrors.lastName ? (
                          <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#334762]">Company</label>
                      <Input
                        value={profileForm.company}
                        onChange={(e) => setProfileField("company", e.target.value)}
                        placeholder="Your company name"
                        disabled={isLoading}
                        className="h-11 border-[#ced9ea] bg-white/90"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#334762]">Email</label>
                      <Input
                        value={email}
                        disabled
                        className="h-11 border-[#ced9ea] bg-[#f6f9ff] text-[#6d7f99]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#334762]">Contact number</label>
                      <Input
                        value={profileForm.contactNumber}
                        onChange={(e) => setProfileField("contactNumber", e.target.value)}
                        placeholder="+91 9876543210"
                        disabled={isLoading}
                        className="h-11 border-[#ced9ea] bg-white/90"
                      />
                      {fieldErrors.contactNumber ? (
                        <p className="text-xs text-red-600">{fieldErrors.contactNumber}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#334762]">Password</label>
                      <Input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileField("password", e.target.value)}
                        placeholder="Create a password"
                        disabled={isLoading}
                        className="h-11 border-[#ced9ea] bg-white/90"
                      />
                      {fieldErrors.password ? (
                        <p className="text-xs text-red-600">{fieldErrors.password}</p>
                      ) : (
                        <p className="text-xs text-[#7f90a8]">
                          Use at least 8 characters for your password.
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 min-w-[170px] rounded-md bg-[#0f5fb8] px-7 text-white hover:bg-[#0c4f9a]"
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
