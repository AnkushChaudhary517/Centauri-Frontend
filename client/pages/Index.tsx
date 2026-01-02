import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { SignUp } from "@/components/sections/SignUp";
import { ContentUpload } from "@/components/sections/ContentUpload";
import { MetricsCards } from "@/components/sections/MetricsCards";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Improvement } from "@/components/sections/Improvement";
import { Pricing } from "@/components/sections/Pricing";
import { TrialCTA } from "@/components/sections/TrialCTA";
import { Footer } from "@/components/sections/Footer";
import type { AnalysisResponse } from "@/services/seoAnalysis";
import { MetricsDisplay } from "@/components/sections/MetricsDisplay";
import ScoreGauges from "@/components/sections/ScoreGauges";

export default function Index() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetricLoading, setIsMetricLoading] = useState(true);
  const [primaryKeyword, setPrimaryKeyword] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const handleSignInSuccess = () => {
    setIsSignedIn(true);
  };

  const handleLogout = () => {
    setIsSignedIn(false);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (primaryKeyword: string,content: string, result: AnalysisResponse) => {
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
      <Hero onLogout={handleLogout} isSignedIn={isSignedIn}/>
      {!isSignedIn ? (
        <SignUp onSignInSuccess={handleSignInSuccess} />
      ) : (
        isMetricLoading && <ContentUpload  onAnalysisStart={() => setIsLoading(true)} onAnalysisComplete={handleAnalysisComplete} onAnalysisError={handleAnalysisError} />
      )}
      {!isLoading && (<ScoreGauges handleMetricLoading ={handleMetricLoading} analysisResult={analysisResult} isLoading={isLoading} primaryKeyword={primaryKeyword ?? ""} content={content} />)}
      <HowItWorks />
      <Improvement analysisResult={analysisResult} />
      {/*<Pricing />*/}
      <TrialCTA />
      <Footer />
    </div>
  );
}
