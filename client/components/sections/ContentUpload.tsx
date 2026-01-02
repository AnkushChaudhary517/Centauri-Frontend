import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import mammoth from "mammoth";
import {
  analyzeSEO,
  buildAnalysisRequest,
  type AnalysisResponse,
} from "@/services/seoAnalysis";

interface ContentUploadProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (primaryKeyword: string, content: string, result: AnalysisResponse) => void;
  onAnalysisError?: () => void;
  onLogout?: () => void;
}

export function ContentUpload({
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  onLogout,
}: ContentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  /* ---------- File Upload ---------- */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setFileName(file.name);
  
    try {
      // DOCX handling
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
  
        const result = await mammoth.extractRawText({
          arrayBuffer,
        });
  
        setContent(result.value);
      } 
      // TXT / MD handling
      else {
        const text = await file.text();
        setContent(text);
      }
  
      toast({
        title: "Success",
        description: `File "${file.name}" loaded successfully`,
      });
    } catch (error) {
      console.error("File read error:", error);
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
    }
  };

  /* ---------- Review ---------- */
  const handleReview = () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please paste text or upload a file first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Content ready for review",
      description: "Your content is loaded successfully.",
    });

    console.log("REVIEW CONTENT:", content);
  };

  /* ---------- Analyze ---------- */
  const handleAnalyze = async () => {
    if (!primaryKeyword.trim()) {
      toast({
        title: "Primary keyword required",
        description: "Please enter a primary keyword before analyzing.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please paste text or upload a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      onAnalysisStart?.();

      const request = buildAnalysisRequest(content, {
        PrimaryKeyword: primaryKeyword,
      });

      const response = await analyzeSEO(request);
      onAnalysisComplete?.(primaryKeyword, content, response);

      toast({
        title: "Success",
        description: "Content analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze content",
        variant: "destructive",
      });
      onAnalysisError?.();
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ---------- Remove ---------- */
  const handleRemove = () => {
    setContent("");
    setFileName("");
    setPrimaryKeyword("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    toast({
      title: "Success",
      description: "Content removed",
    });
  };

  return (
    <div className="content-upload-section bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Your <span className="text-secondary">Content</span>
            </h2>
            <Button
              onClick={onLogout}
              variant="outline"
              className="text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Logout
            </Button>
          </div>

          {/* Primary Keyword */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Keyword
            </label>
            <Input
              type="text"
              placeholder="Enter your primary keyword"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
            />
          </div>

          {/* Textarea */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here or upload a file"
            className="min-h-[200px]"
            disabled={isAnalyzing}
          />

          {/* Upload + Review */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              disabled={isAnalyzing}
            >
              Upload File (.txt, .md, .docx)
            </Button>

            <Button
              onClick={handleReview}
              variant="outline"
              className="flex-1"
              disabled={isAnalyzing}
            >
              Review your Content
            </Button>
          </div>

          {/* Analyze */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-10 py-2.5 bg-secondary text-white font-semibold"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
