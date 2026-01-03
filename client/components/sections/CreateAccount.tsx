import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authAPI } from "@/utils/AuthApi";

interface CreateAccountProps {
  onBackToLogin: () => void;
}

export function CreateAccount({ onBackToLogin }: CreateAccountProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.register( name, email, password);

      toast({
        title: "Account created",
        description: "Please login with your credentials",
      });

      onBackToLogin();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-section bg-white py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="border rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            Create your <span className="text-secondary">Account</span>
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="E-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" className="w-full bg-secondary">
              {isLoading ? "Creating account..." : "Register"}
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
    </div>
  );
}
