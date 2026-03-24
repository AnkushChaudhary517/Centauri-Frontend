import { useEffect, useRef, useState } from "react";
import { AuthDialog } from "@/components/sections/AuthDialog";
import { ContentUpload } from "@/components/sections/ContentUpload";
import { Footer } from "@/components/sections/Footer";
import { GrowthFaqSpotlight } from "@/components/sections/GrowthFaqSpotlight";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import ScoreGauges from "@/components/sections/ScoreGauges";
import TabsWithSvg from "@/components/sections/TabsWithSvg";
import type { AnalysisRequest, AnalysisResponse } from "@/services/seoAnalysis";
import { authAPI } from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";

export default function Index() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetricLoading, setIsMetricLoading] = useState(true);
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [article, setArticle] = useState({ content: "", keyword: "" });
  const [view, setView] = useState<"login" | "register">("login");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const scoreRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated, logout, user } = useAuth();

  const openLoginDialog = () => {
    setView("login");
    setIsAuthDialogOpen(true);
  };

  const handleSave = (newData: { updatedContent: string; keyword: string }) => {
    setArticle({
      content: newData.updatedContent,
      keyword: newData.keyword,
    });
  };

  useEffect(() => {
    if (article.content) {
      setIsMetricLoading(true);
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [article]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsAuthDialogOpen(false);
      setView("login");

      if (isMetricLoading) {
        setTimeout(() => {
          uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  }, [isAuthenticated, isMetricLoading]);

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

  const handleLogout = async () => {
    setAnalysisResult(null);
    setAnalysisRequest(null);
    setIsLoading(false);
    setIsMetricLoading(true);
    setPrimaryKeyword("");
    setContent("");
    setOriginalContent("");
    setArticle({ content: "", keyword: "" });
    await logout();
    setView("login");
  };

  const handleAnalysisComplete = (
    nextPrimaryKeyword: string,
    nextContent: string,
    result: AnalysisResponse,
    nextOriginalContent: string,
    nextAnalysisRequest: AnalysisRequest,
  ) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setPrimaryKeyword(nextPrimaryKeyword);
    setIsMetricLoading(false);
    setContent(nextContent ?? "");
    setOriginalContent(nextOriginalContent ?? "");
    setAnalysisRequest(nextAnalysisRequest);
    void authAPI.refreshRemainingCredits().catch((error) => {
      console.error("Remaining credits refresh failed:", error);
    });
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
      <Header
        isSignedIn={isAuthenticated}
        user={user}
        onLoginClick={openLoginDialog}
        onLogout={handleLogout}
      />

      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        view={view}
        onViewChange={setView}
      />

      {!isAuthenticated ? (
        <>
          <Hero onLoginClick={openLoginDialog} />
          <HowItWorks />
          <TabsWithSvg />
          <GrowthFaqSpotlight
            onCreateAccount={() => {
              setView("register");
              setIsAuthDialogOpen(true);
            }}
          />
          <Footer />
        </>
      ) : (
        <main className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#153a72_20%,#edf4ff_20.1%,#ffffff_100%)] pt-24">
          {isMetricLoading ? (
            <div ref={uploadRef}>
              <ContentUpload
                onAnalysisStart={() => setIsLoading(true)}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
                initialContent={article.content}
                initialKeyword={article.keyword}
              />
            </div>
          ) : null}

          {!isLoading && !isMetricLoading ? (
            <div ref={scoreRef}>
              <ScoreGauges
                handleMetricLoading={handleMetricLoading}
                analysisResult={analysisResult}
                isLoading={isLoading}
                primaryKeyword={primaryKeyword}
                content={content}
                originalContent={originalContent}
                analysisRequest={analysisRequest}
                onEditorSave={handleSave}
              />
            </div>
          ) : null}

          <HowItWorks />
          <TabsWithSvg />
          <GrowthFaqSpotlight
            onCreateAccount={() => {
              setView("register");
              setIsAuthDialogOpen(true);
            }}
          />
          <Footer />
        </main>
      )}
    </div>
  );
}
