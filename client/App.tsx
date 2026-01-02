import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import { useEffect } from "react";
import { authAPI } from "./utils/AuthApi";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <Toaster />
      <Sonner />
      <OAuthRedirectHandler>
      <HashRouter>
        <Routes>
          
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          
        </Routes>
      </HashRouter>
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
    // Get token and params from hash route (HashRouter)
    const token = searchParams.get("token") || searchParams.get("access_token");
    const provider = searchParams.get("provider") || "google"; // Default to google
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth error:", error, errorDescription);
      navigate(`/?error=oauth_failed&message=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    if (token) {
      console.log("OAuth callback received token, provider:", provider);
      
      // Exchange token for JWT tokens based on provider
      const exchangePromise = authAPI.exchangeGoogleToken(token);

      exchangePromise.then((response) => {
        console.log("Token exchange response:", response);
        
        if (response.success && response.data) {
          const userData = {
            userId: response.data.userId || response.data.user_id,
            email: response.data.email || "",
            firstName: response.data.firstName || response.data.first_name || "",
            lastName: response.data.lastName || response.data.last_name || "",
            profileImage: response.data.profileImage || response.data.profile_image || "",
          };
          localStorage.setItem("isUserAuthenticated", "true");
          const jwtToken = response.data.token || response.data.access_token;
          const refreshToken = response.data.refreshToken || response.data.refresh_token;
          
          if (jwtToken && refreshToken) {
            console.log("Setting tokens and user data");
            handleOAuthCallback(jwtToken, refreshToken, userData);
            
            navigate("/");
          } else {
            console.error("Missing tokens in response:", response.data);
            navigate(`/?error=oauth_failed&message=${encodeURIComponent("Missing tokens in response")}`);
          }
        } else {
          console.error("Token exchange failed:", response.error || response);
          navigate(`/?error=oauth_failed&message=${encodeURIComponent(response.error?.message || response.message || "Token exchange failed")}`);
        }
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
    // Check if we're on a backend OAuth callback URL (e.g., /api/v1/auth/callback)
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    if (pathname.includes('/auth/callback') || pathname.includes('/api/v1/auth/callback')) {
      const urlParams = new URLSearchParams(search);
      const token = urlParams.get("token") || urlParams.get("access_token");
      const provider = urlParams.get("provider") || "google";
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");
      
      // Build hash route with params
      const hashParams = new URLSearchParams();
      if (token) hashParams.set("token", token);
      if (provider) hashParams.set("provider", provider);
      if (error) hashParams.set("error", error);
      if (errorDescription) hashParams.set("error_description", errorDescription);
      
      const hashRoute = `/#/auth/callback${hashParams.toString() ? '?' + hashParams.toString() : ''}`;
      window.location.replace(hashRoute);
    }
  }, []);
  
  return <>{children}</>;
}


createRoot(document.getElementById("root")!).render(<App />);
