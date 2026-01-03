import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { SignUp } from "@/components/sections/SignUp";
import { ContentUpload } from "@/components/sections/ContentUpload";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Improvement } from "@/components/sections/Improvement";
import { TrialCTA } from "@/components/sections/TrialCTA";
import { Footer } from "@/components/sections/Footer";
import type { AnalysisResponse } from "@/services/seoAnalysis";
import ScoreGauges from "@/components/sections/ScoreGauges";
import { useAuth } from "@/utils/AuthContext";
import { CreateAccount } from "@/components/sections/CreatEAccount";

export default function Index() {
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetricLoading, setIsMetricLoading] = useState(true);
  const [primaryKeyword, setPrimaryKeyword] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const { isAuthenticated, logout } = useAuth();

  // 🔁 login / register toggle
  const [view, setView] = useState<"login" | "register">("login");

  const handleLogout = async () => {
    setAnalysisResult(null);
    await logout();
    setView("login");
  };

  const handleAnalysisComplete = (
    primaryKeyword: string,
    content: string,
    result: AnalysisResponse
  ) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setPrimaryKeyword(primaryKeyword);
    setIsMetricLoading(false);
    setContent(content ?? "");
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
  };

  const handleMetricLoading = () => {
    setIsLoading(true);
    setIsMetricLoading(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Hero onLogout={handleLogout} isSignedIn={isAuthenticated} />

      {/* 🔐 AUTH SECTION */}
      {!isAuthenticated ? (
        view === "login" ? (
          <SignUp
            onSignInSuccess={() => setView("login")}
            onCreateAccount={() => setView("register")}
          />
        ) : (
          <CreateAccount onBackToLogin={() => setView("login")} />
        )
      ) : (
        isMetricLoading && (
          <ContentUpload
            onAnalysisStart={() => setIsLoading(true)}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
          />
        )
      )}

      {/* 📊 RESULTS */}
      {!isLoading && (
        <ScoreGauges
          handleMetricLoading={handleMetricLoading}
          analysisResult={analysisResult}
          isLoading={isLoading}
          primaryKeyword={primaryKeyword}
          content={content}
        />
      )}

      {/* 📄 STATIC SECTIONS */}
      <HowItWorks />
      <Improvement analysisResult={analysisResult} />
      <TrialCTA />
      <Footer />
    </div>
  );
}
