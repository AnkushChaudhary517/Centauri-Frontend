import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authAPI } from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";
import { cn } from "@/lib/utils";

interface SignUpProps {
  onSignInSuccess?: () => void;
  onCreateAccount?: () => void;
  variant?: "page" | "dialog";
}

export function SignUp({
  onSignInSuccess,
  onCreateAccount,
  variant = "page",
}: SignUpProps) {
  const [mode, setMode] = useState<"login" | "forgotPassword" | "resetPassword">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await login(email, password);

      if (response) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });

        onSignInSuccess?.();
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.forgotPassword(email.trim());
      toast({
        title: "Success",
        description: "A verification code has been sent to your email to reset the password.",
      });
      setMode("resetPassword");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send reset code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !verificationCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.resetPassword(email.trim(), verificationCode.trim(), newPassword);
      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });
      setMode("login");
      setPassword("");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setMode("login");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    authAPI.initiateGoogleSignIn();
  };

  return (
    <div
      className={cn(
        "signup-section",
        variant === "page" ? "bg-white py-12 sm:py-16 lg:py-20" : "bg-transparent py-0",
      )}
    >
      <div className={cn("mx-auto", variant === "page" ? "max-w-md px-4" : "max-w-none px-0")}>
        <div
          className={cn(
            "rounded-xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10",
            variant === "dialog" &&
              "rounded-[28px] border-[#d7e3f4] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,251,255,0.98)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8",
          )}
        >
          {/* <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Get Started with <span className="text-secondary">Centauri</span>
          </h2> */}

          <div className="space-y-4">
            {mode === "login" && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">Sign in with Google</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
              </>
            )}

            {mode === "login" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="E-mail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary text-white"
                >
                  {isLoading ? "Please wait..." : "Login"}
                </Button>
              </form>
            )}

            {mode === "forgotPassword" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary text-white"
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-sm font-medium text-secondary hover:underline"
                >
                  Back to Login
                </button>
              </form>
            )}

            {mode === "resetPassword" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="E-mail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  type="text"
                  placeholder="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary text-white"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-sm font-medium text-secondary hover:underline"
                >
                  Back to Login
                </button>
              </form>
            )}

            {mode === "login" ? (
              <p className="mt-4 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="text-secondary font-medium hover:underline"
                >
                  Create one
                </button>
                <span className="mx-2 text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => setMode("forgotPassword")}
                  className="text-secondary font-medium hover:underline"
                >
                  Forgot password
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-gray-600">
                Use the verification code from your email to complete the password reset.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
