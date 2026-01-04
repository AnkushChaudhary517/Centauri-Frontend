import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authAPI } from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";

interface TrialCTAProps {
  onSignInSuccess?: () => void;
  onCreateAccount?: () => void;
}

export function TrialCTA({
  onSignInSuccess,
  onCreateAccount,
}: TrialCTAProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const { toast } = useToast();
  const { login } = useAuth();

  // ✅ EMAIL / PASSWORD LOGIN
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

  // ✅ GOOGLE SIGN-IN (REDIRECT FLOW)
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    authAPI.initiateGoogleSignIn();
  };

  return (
    <div className="w-full flex justify-center py-12">
      {/* CARD */}
      <div className="max-w-5xl w-full rounded-[28px] overflow-hidden bg-gradient-to-br from-[#0b133a] to-[#050b24] text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* LEFT SECTION */}
          <div className="p-10 md:p-12">
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-6">
              Create your account <br />
              to begin your{" "}
              <span className="text-orange-500">free trial today.</span>
            </h2>

            <p className="text-sm text-gray-300 mb-8">
              Teams using this workflow consistently see measurable gains:
            </p>

            <div className="space-y-4 text-sm text-gray-200">
              <div className="flex gap-3">
                <span className="text-orange-500">▣</span>
                <span>
                  <b>2.5x higher visibility</b> as E-E-A-T aligned pages get indexed more reliably
                </span>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-500">▣</span>
                <span>
                  <b>40% less editing time</b> when structure issues are addressed before final review
                </span>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-500">▣</span>
                <span>
                  <b>27% higher engagement</b> from cleaner, more scannable formatting
                </span>
              </div>

              <div className="flex gap-3">
                <span className="text-orange-500">▣</span>
                <span>
                  <b>30% faster review cycles</b> with section-level notes
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="p-10 md:p-12 bg-white/5 backdrop-blur-sm">
            <form className="space-y-5" onSubmit={handleEmailLogin}>
              <div>
                <label className="text-xs text-gray-300">Email / Phone</label>
                <Input
                  className="mt-1 bg-transparent border border-white/30 text-white placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-xs text-gray-300">Password</label>
                <Input
                  type="password"
                  className="mt-1 bg-transparent border border-white/30 text-white placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                title={isAuthenticated ? "You are already logged in" : ""}
                disabled={isLoading || isAuthenticated}
                className={`w-full py-2.5 ${
                  isAuthenticated
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isAuthenticated
    ? "Already Logged In"
    : isLoading
    ? "Please wait..."
    : "Login"}
              </Button>

              <div className="text-center text-sm text-gray-400">or</div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isAuthenticated}
                title={isAuthenticated ? "You are already logged in" : ""}
                className="w-full flex items-center justify-center gap-2 border border-white/30 rounded-lg py-2.5 hover:bg-white/10 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              <p className="text-xs text-center text-gray-400">
                Don’t have an account?{" "}
                <button
  type="button"
  onClick={onCreateAccount}
  className="text-orange-500 hover:underline"
>
  Create one
</button>
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
