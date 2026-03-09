import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import mammoth from "mammoth";
import {
  AnalysisRequest,
  analyzeSEO,
  buildAnalysisRequest,
  type AnalysisResponse,
} from "@/services/seoAnalysis";
import DOMPurify from 'dompurify';
import { docxToHtmlString } from "@/services/DocxToHtmlService";

interface ContentUploadProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (primaryKeyword: string, content: string, result: AnalysisResponse, originalContent: string, analysisRequest : AnalysisRequest) => void;
  onAnalysisError?: () => void;
  initialContent?: string;
  initialKeyword?: string;
}

export function ContentUpload({
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  initialContent = "", // Default to empty
  initialKeyword = "", // Default to empty
}: ContentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const allowedTags = ['h1', 'h2', 'h3', 'h4', 'li', 'td', 'th', 'p', 'a', 'ul', 'ol', 'strong', 'em', 'br'];

  // Update internal state if props change (important for the "Done Editing" flow)
  useEffect(() => {
    // Always synchronize incoming initial values so the editor's "Done Editing"
    // updates are reflected in the content input area even when it's already mounted.
    setContent(initialContent ?? "");
    setPrimaryKeyword(initialKeyword ?? "");
  }, [initialContent, initialKeyword]);

  function sanitizeHtml(html: string) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['href'], 
      KEEP_CONTENT: true
    });
  }

  // Synchronize the editable div when content state changes (e.g. after file upload)
  useEffect(() => {
    if (editableRef.current && content !== editableRef.current.innerHTML) {
      editableRef.current.innerHTML = content;
    }
  }, [content]);

  /* ---------- File Upload ---------- */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        var htmlStr = await docxToHtmlString(file);
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              // Headings
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Title'] => h1:fresh",
              // Normal paragraph
              "p[style-name='Normal'] => p",
              // Inline formatting
              "b => strong",
              "i => em",
              "u => span.underline",
              "strike => s",
              // Lists
              "p[style-name='List Paragraph'] => li",
              "p[style-name='Bullet'] => li",
              "p[style-name='Numbered'] => li"
            ],
            includeDefaultStyleMap: true,
            convertImage: mammoth.images.imgElement((image) => {
              return image.read("base64").then((imageBuffer) => {
                return { src: `data:${image.contentType};base64,${imageBuffer}` };
              });
            }),
          }
        );
        //const sanitized = sanitizeHtml(result.value);
        //let html = wrapLists(result.value);
        htmlStr = normalizeDocxHtml(htmlStr);
        setContent(result.value);
        setOriginalContent(htmlToPlainText(htmlStr));
      } 
      else {
        const text = await file.text();
        const wrappedText = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        setOriginalContent(text);
        setContent(wrappedText);
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

  function wrapLists(html: string): string {
    // Wrap bullet/numbered lists
    html = html.replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>");
  
    // Remove nested multiple <ul> if needed
    html = html.replace(/<\/ul>\s*<ul>/g, "");
    return html;
  }

  /* ---------- Handle Manual Typing ---------- */
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  /* ---------- Analyze ---------- */
  const handleAnalyze = async () => {
    localStorage.clear();
    if (!primaryKeyword.trim()) {
      toast({
        title: "Primary keyword required",
        description: "Please enter a primary keyword before analyzing.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() || content === "<p></p>") {
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

      // We send 'content' which contains the HTML tags
      const request = buildAnalysisRequest(content, {
        PrimaryKeyword: primaryKeyword,
      });

      const response = await analyzeSEO(request);
      localStorage.setItem("RequestId", response?.requestId);
      onAnalysisComplete?.(primaryKeyword, content, response, originalContent, request);

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

  function normalizeDocxHtml(html: string): string {
    return `
      <div style="
        max-width: 100%;
        width: 100%;
        box-sizing: border-box;
        overflow-wrap: break-word;
        word-break: break-word;
      ">
        <style>
        .docx-wrapper {
          background:"white" !important;
          padding:0 !important;

        }
          .docx {
          width:100% !important;
          padding:10px !important;
          
        }
          .docx-wrapper>section.docx {
    margin-bottom: 0px !important;
  }
          table {
            width: 100% !important;
            border-collapse: collapse;
            table-layout: fixed; /* prevents horizontal overflow */
          }
          table, th, td {
            border: 1px solid #ddd;
            word-break: break-word; /* wrap long text in table cells */
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 0 auto;
          }
          p, h1, h2, h3, h4, h5, h6, li, span, div {
            word-break: break-word;
            overflow-wrap: anywhere;
          }
        </style>
        ${html}
      </div>
    `;
  }
  


  const handleRemove = () => {
    setContent("");
    setFileName("");
    setPrimaryKeyword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (editableRef.current) editableRef.current.innerHTML = "";

    toast({
      title: "Success",
      description: "Content removed",
    });
  };

  return (
    <div className="content-upload-section bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-2xl mx-auto px-4">
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-lg font-medium text-center px-4">
                Centauri is analyzing your content. It could take 3 to 5 minutes. Stay Tight.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Your <span className="text-secondary">Content</span>
            </h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Keyword
            </label>
            <Input
              type="text"
              placeholder="Enter your primary keyword"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          {/* Rich Text Area */}
          <div className="relative mb-6">
            <div
              ref={editableRef}
              contentEditable={!isAnalyzing}
              onInput={handleInput}
              className={`min-h-[250px] max-h-[500px] overflow-y-auto border rounded-md bg-white prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
                ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ border: '1px solid #e2e8f0' }}
            />
            {!content && (
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                Paste your text here or upload a file...
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
              disabled={isAnalyzing}
            >
              Upload File (.docx, .txt, .md)
            </Button>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Content"}
            </Button>
          </div>

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

export function htmlToPlainText(html: string): string {
  if (!html || typeof html !== "string") return "";
  try {
    const container = document.createElement("div");
    container.innerHTML = html;
    let text = container.innerText || "";
    return text
      .replace(/\u00A0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return "";
  }
}