import { useEffect, useRef, useState } from "react";
import { AuthDialog } from "@/components/sections/AuthDialog";
import { ContentUpload } from "@/components/sections/ContentUpload";
import { Footer } from "@/components/sections/Footer";
import { GrowthFaqSpotlight } from "@/components/sections/GrowthFaqSpotlight";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SeoHead } from "@/components/SeoHead";
import ScoreGauges from "@/components/sections/ScoreGauges";
import TabsWithSvg from "@/components/sections/TabsWithSvg";
import { useToast } from "@/components/ui/use-toast";
import type { AnalysisRequest, AnalysisResponse } from "@/services/seoAnalysis";
import { clearCurrentAnalysisRequestId } from "@/services/seoAnalysis";
import {
  authAPI,
  SESSION_EXPIRED_EVENT,
  SESSION_EXPIRED_MESSAGE_STORAGE_KEY,
} from "@/utils/AuthApi";
import { useAuth } from "@/utils/AuthContext";

export default function Index() {
  const [article, setArticle] = useState({
    content: "",
    keyword: "",
    shouldReanalyze: false,
    previousRequestId: null as string | null,
    pendingUpload: false,
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetricLoading, setIsMetricLoading] = useState(true);
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [view, setView] = useState<"login" | "register">("login");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { toast } = useToast();

  const scoreRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated, logout, user } = useAuth();

  const openLoginDialog = () => {
    setView("login");
    setIsAuthDialogOpen(true);
  };

  const handleSave = (newData: {
    updatedContent: string;
    keyword: string;
    isEdited: boolean;
    previousRequestId?: string | null;
  }) => {
    const previousRequestId = newData.previousRequestId ?? null;
    setArticle({
      content: newData.updatedContent,
      keyword: newData.keyword,
      shouldReanalyze: Boolean(previousRequestId),
      previousRequestId,
      pendingUpload: true,
    });
  };

  useEffect(() => {
    if (article.pendingUpload) {
      setIsMetricLoading(true);
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [article.pendingUpload]);

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

  useEffect(() => {
    const showSessionExpiredMessage = () => {
      const message =
        sessionStorage.getItem(SESSION_EXPIRED_MESSAGE_STORAGE_KEY) ||
        "Your session has expired. Please log in again.";

      sessionStorage.removeItem(SESSION_EXPIRED_MESSAGE_STORAGE_KEY);
      setView("login");
      setIsAuthDialogOpen(true);
      toast({
        title: "Session expired",
        description: message,
        variant: "destructive",
      });
    };

    const handleSessionExpired = () => {
      showSessionExpiredMessage();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    if (sessionStorage.getItem(SESSION_EXPIRED_MESSAGE_STORAGE_KEY)) {
      showSessionExpiredMessage();
    }

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [toast]);

  const handleLogout = async () => {
    setAnalysisResult(null);
    setAnalysisRequest(null);
    setIsLoading(false);
    setIsMetricLoading(true);
    setPrimaryKeyword("");
    setContent("");
    setOriginalContent("");
    clearCurrentAnalysisRequestId();
    setArticle({
      content: "",
      keyword: "",
      shouldReanalyze: false,
      previousRequestId: null,
      pendingUpload: false,
    });
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
    setArticle((current) => ({
      ...current,
      shouldReanalyze: false,
      previousRequestId: result.requestId ?? null,
      pendingUpload: false,
    }));
    void authAPI.refreshRemainingCredits().catch((error) => {
      console.error("Remaining credits refresh failed:", error);
    });
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
  };

  const handleMetricLoading = () => {
    clearCurrentAnalysisRequestId();
    setIsLoading(true);
    setIsMetricLoading(true);
  };

  const handleEditorCloseToUpload = () => {
    setIsLoading(false);
    setIsMetricLoading(true);
    setAnalysisResult(null);
    setAnalysisRequest(null);

    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-white">
      <SeoHead
        title="AI Content Optimization Tool for SEO & AI Indexing | Centauri"
        description="Improve SEO, AI indexing, and content quality with Centauri. Get actionable recommendations, not just scores."
        canonical="https://getcentauri.com/"
        ogTitle="Centauri - AI Content Optimization Tool"
        ogDescription="Improve SEO & AI indexing with actionable insights."
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Centauri",
          applicationCategory: "SEO Tool",
        }}
      />

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
          <Hero
            onLoginClick={openLoginDialog}
            onCreateAccountClick={() => {
              setView("register");
              setIsAuthDialogOpen(true);
            }}
          />
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
                reanalyzeContext={{
                  shouldReanalyze: article.shouldReanalyze,
                  previousRequestId: article.previousRequestId,
                }}
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
                onEditorClose={handleEditorCloseToUpload}
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
