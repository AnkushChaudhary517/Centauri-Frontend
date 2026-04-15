import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import { useEffect } from "react";
import { authAPI } from "./utils/AuthApi";
import PricingPage from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <Toaster />
      <Sonner />
      <OAuthRedirectHandler>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </OAuthRedirectHandler>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("access_token");
    const provider = searchParams.get("provider") || "google";
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth error:", error, errorDescription);
      navigate(`/?error=oauth_failed&message=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    if (token) {
      console.log("OAuth callback received token, provider:", provider);
      authAPI.exchangeGoogleToken(token).then((response) => {
        handleOAuthCallback(response.token, response.refreshToken);
        navigate("/");
      }).catch((err) => {
        console.error("Token exchange error:", err);
        navigate(`/?error=oauth_failed&message=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`);
      });
    } else {
      console.error("No token received from backend. URL params:", Object.fromEntries(searchParams));
      navigate("/?error=oauth_failed&message=No token received from backend");
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Google sign-in...</p>
      </div>
    </div>
  );
}


function OAuthRedirectHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    if (pathname.includes('/auth/callback') || pathname.includes('/api/v1/auth/callback')) {
      const urlParams = new URLSearchParams(search);
      const token = urlParams.get("token") || urlParams.get("access_token");
      const provider = urlParams.get("provider") || "google";
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");
      
      // Normalize callback params onto the app route so React Router can handle them.
      const hashParams = new URLSearchParams();
      if (token) hashParams.set("token", token);
      if (provider) hashParams.set("provider", provider);
      if (error) hashParams.set("error", error);
      if (errorDescription) hashParams.set("error_description", errorDescription);
      
      const callbackRoute = `/auth/callback${hashParams.toString() ? "?" + hashParams.toString() : ""}`;
      if (pathname !== "/auth/callback" || search !== `?${hashParams.toString()}`) {
        window.location.replace(callbackRoute);
      }
    }
  }, []);
  
  return <>{children}</>;
}


createRoot(document.getElementById("root")!).render(<App />);
