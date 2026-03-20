import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { SignUp } from "@/components/sections/SignUp";
import { ContentUpload } from "@/components/sections/ContentUpload";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Footer } from "@/components/sections/Footer";
import type { AnalysisRequest, AnalysisResponse } from "@/services/seoAnalysis";
import ScoreGauges from "@/components/sections/ScoreGauges";
import { useAuth } from "@/utils/AuthContext";
import TabsWithSvg from "@/components/sections/TabsWithSvg";
import { useRef } from "react";
import { CreateAccount } from "@/components/sections/CreateAccount";
import { GrowthFaqSpotlight } from "@/components/sections/GrowthFaqSpotlight";


export default function Index() {
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResponse | null>(null);
    const [analysisRequest, setAnalysisRequest] =
    useState<AnalysisRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetricLoading, setIsMetricLoading] = useState(true);
  const [primaryKeyword, setPrimaryKeyword] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const [article, setArticle] = useState({ content: "", keyword: "" })

  const { isAuthenticated, logout, user } = useAuth();
  const uploadRef = useRef<HTMLDivElement | null>(null);
const authTopRef = useRef<HTMLDivElement | null>(null);
const handleSave = (newData: { updatedContent: string; keyword: string }) => {
  setArticle({
    content: newData.updatedContent,
    keyword: newData.keyword // Keyword safely updated
  });
};

// When editor saves, show the ContentUpload area with updated article
useEffect(() => {
  if (article.content) {
    setIsMetricLoading(true);
    // give React a moment to render then scroll
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}, [article]);

  useEffect(() => {
    if (isAuthenticated && isMetricLoading) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [isAuthenticated, isMetricLoading]);
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
    result: AnalysisResponse,
    originalContent:string,
    analysisRequest:AnalysisRequest
  ) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setPrimaryKeyword(primaryKeyword);
    setIsMetricLoading(false);
    setContent(content ?? "");
    setOriginalContent(originalContent??"");
    setAnalysisRequest(analysisRequest)
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
  };

  const handleMetricLoading = () => {
    setIsLoading(true);
    setIsMetricLoading(true);
  };

  useEffect(() => {
    if (analysisResult && !isLoading) {
      setTimeout(() => {
        scoreRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [analysisResult, isLoading]);

  return (
    <div className="min-h-screen bg-white">
      <Hero onLogout={handleLogout} isSignedIn={isAuthenticated} user={user} />

<div ref={authTopRef}>
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
          <div ref={uploadRef}>
            <ContentUpload
            onAnalysisStart={() => setIsLoading(true)}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            initialContent={article.content}
            initialKeyword = {article.keyword}
          />
          </div>
          
        )
      )}
</div>
     

      {/* 📊 RESULTS */}
      {!isLoading && !isMetricLoading && (
        <div ref={scoreRef}>
          <ScoreGauges
            handleMetricLoading={handleMetricLoading}
            analysisResult={analysisResult}
            isLoading={isLoading}
            primaryKeyword={primaryKeyword}
            content={content}
            originalContent={originalContent}
            analysisRequest = {analysisRequest}
            onEditorSave={handleSave}
          />
        </div>
      )}

      {/* 📄 STATIC SECTIONS */}
      <HowItWorks />
      {/*<Improvement analysisResult={analysisResult} />*/}
      <TabsWithSvg></TabsWithSvg>
      {/*<Pricing></Pricing>*/}
      <GrowthFaqSpotlight
        onCreateAccount={() => {
          setView("register");
          setTimeout(() => {
            authTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }}
      />
      <Footer />
    </div>
    
  );
}
