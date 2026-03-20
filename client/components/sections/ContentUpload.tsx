import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import mammoth from "mammoth";
import {
  AnalysisRequest,
  analyzeSEOWithPolling,
  buildAnalysisRequest,
  type AnalysisResponse,
} from "@/services/seoAnalysis";
import DOMPurify from "dompurify";
import { docxToHtmlString } from "@/services/DocxToHtmlService";
import { FileText, Trash2, UploadCloud } from "lucide-react";

interface ContentUploadProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (
    primaryKeyword: string,
    content: string,
    result: AnalysisResponse,
    originalContent: string,
    analysisRequest: AnalysisRequest,
  ) => void;
  onAnalysisError?: () => void;
  initialContent?: string;
  initialKeyword?: string;
}

export function ContentUpload({
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  initialContent = "",
  initialKeyword = "",
}: ContentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const imagesRef = useRef<Array<{ placeholder: string; blobUrl: string }>>([]);
  const [fileName, setFileName] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const normalizedPlainText = htmlToPlainText(content).trim();
  const hasContent = normalizedPlainText.length > 0;
  const canAnalyze = !isAnalyzing && primaryKeyword.trim().length > 0 && hasContent;

  const allowedTags = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "td",
    "th",
    "p",
    "a",
    "ul",
    "ol",
    "strong",
    "em",
    "br",
    "img",
  ];

  useEffect(() => {
    setContent(initialContent ?? "");
    setPrimaryKeyword(initialKeyword ?? "");
  }, [initialContent, initialKeyword]);

  function sanitizeHtml(html: string) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ["href", "src", "alt", "width", "height"],
      KEEP_CONTENT: true,
      ALLOWED_URI_REGEXP: /^(data|blob|https?):/i,
    });
  }

  useEffect(() => {
    if (editableRef.current && content !== editableRef.current.innerHTML) {
      editableRef.current.innerHTML = content;
    }
  }, [content]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        let htmlStr = await docxToHtmlString(file);
        imagesRef.current = [];
        let imgCounter = 0;
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Title'] => h1:fresh",
              "p[style-name='Normal'] => p",
              "b => strong",
              "i => em",
              "u => span.underline",
              "strike => s",
              "p[style-name='List Paragraph'] => li",
              "p[style-name='Bullet'] => li",
              "p[style-name='Numbered'] => li",
            ],
            includeDefaultStyleMap: true,
            convertImage: mammoth.images.imgElement((image) => {
              imgCounter += 1;
              const placeholder = `embedded-image-${imgCounter}`;
              return image.read("base64").then((imageBuffer) => {
                const byteChars = atob(imageBuffer);
                const byteNumbers = new Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i += 1) {
                  byteNumbers[i] = byteChars.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: image.contentType });
                const blobUrl = URL.createObjectURL(blob);
                imagesRef.current.push({ placeholder, blobUrl });
                return { src: placeholder };
              });
            }),
          },
        );

        htmlStr = normalizeDocxHtml(htmlStr);
        let displayHtml = result.value;
        imagesRef.current.forEach((img) => {
          displayHtml = displayHtml.replace(new RegExp(img.placeholder, "g"), img.blobUrl);
        });
        setContent(sanitizeHtml(displayHtml));
        setOriginalContent(htmlToPlainText(htmlStr));
      } else {
        const text = await file.text();
        const wrappedText = `<p>${text.replace(/\n/g, "<br>")}</p>`;
        setOriginalContent(text);
        setContent(sanitizeHtml(wrappedText));
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

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  const handleAnalyze = async () => {
    localStorage.removeItem("RequestId");

    if (!primaryKeyword.trim()) {
      toast({
        title: "Primary keyword required",
        description: "Please enter a primary keyword before analyzing.",
        variant: "destructive",
      });
      return;
    }

    if (!hasContent) {
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

      let requestHtml = content;
      imagesRef.current.forEach((img) => {
        if (img.blobUrl && requestHtml.includes(img.blobUrl)) {
          requestHtml = requestHtml.replace(new RegExp(img.blobUrl, "g"), img.placeholder);
        }
      });

      const request = buildAnalysisRequest(requestHtml, {
        PrimaryKeyword: primaryKeyword,
      });

      const response = await analyzeSEOWithPolling(request);
      localStorage.setItem("RequestId", response?.requestId);
      onAnalysisComplete?.(primaryKeyword, content, response, originalContent, request);

      toast({
        title: "Success",
        description: "Content analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage =
        error instanceof Error && error.message.includes("timed out")
          ? "Something went wrong. Please try again"
          : "Failed to analyze content";
      toast({
        title: "Error",
        description: errorMessage,
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
          table-layout: fixed;
        }
        table, th, td {
          border: 1px solid #ddd;
          word-break: break-word;
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
    <div className="content-upload-section flex min-h-[calc(100vh-96px)] items-start bg-[radial-gradient(circle_at_top_left,#eef5ff_0%,#f8fbff_40%,#ffffff_75%)] py-3 sm:py-4">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {isAnalyzing ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
              <p className="px-4 text-center text-lg font-medium text-white">
                Centauri is analyzing your content. It could take 3 to 5 minutes. Stay Tight.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex min-h-[calc(100vh-118px)] flex-col overflow-hidden rounded-[28px] border border-[#d7e3f4] bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="border-b border-[#e8eef7] bg-[linear-gradient(135deg,#0f172a_0%,#17325c_52%,#1c4d8d_100%)] px-6 py-4 text-white sm:px-8 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              Content Workspace
            </p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Analyze your content with precision
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:text-base">
                  Add your primary keyword, bring in your draft, and run a full Centauri analysis
                  from one focused workspace.
                </p>
              </div>
              {fileName ? (
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90">
                  <span className="font-medium">Loaded file</span>
                  <span className="max-w-[220px] truncate text-white/70">{fileName}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
              <div className="order-2 rounded-2xl border border-[#e5edf8] bg-[#f8fbff] p-4 shadow-sm xl:order-1 xl:h-full xl:overflow-y-auto">
                <div className="hidden space-y-4 xl:block">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Primary Keyword
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your primary keyword"
                      value={primaryKeyword}
                      onChange={(e) => setPrimaryKeyword(e.target.value)}
                      disabled={isAnalyzing}
                      className="h-11 border-[#cdd9eb] bg-white"
                    />
                  </div>

                  <div className="rounded-2xl border border-dashed border-[#c8d6ea] bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-slate-800">Upload a draft</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Accepted file types: DOCX, TXT, MD
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-11 justify-center gap-2 rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
                        disabled={isAnalyzing}
                      >
                        <UploadCloud className="h-4 w-4" />
                        Upload File
                      </Button>
                      {fileName ? (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-[#dde6f4] bg-[#f8fbff] px-3 py-2 text-sm text-slate-600">
                          <FileText className="h-4 w-4 text-[#2758a5]" />
                          <span className="truncate">{fileName}</span>
                        </div>
                      ) : null}
                      <Button
                        onClick={handleRemove}
                        variant="ghost"
                        className="h-10 justify-center gap-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        disabled={isAnalyzing || (!fileName && !hasContent)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear Content
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 xl:hidden">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Primary Keyword
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your primary keyword"
                      value={primaryKeyword}
                      onChange={(e) => setPrimaryKeyword(e.target.value)}
                      disabled={isAnalyzing}
                      className="h-11 border-[#cdd9eb] bg-white"
                    />
                  </div>

                  <div className="rounded-2xl border border-dashed border-[#c8d6ea] bg-white px-4 py-4">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Upload a draft</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Accepted file types: DOCX, TXT, MD
                        </p>
                      </div>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-11 justify-center gap-2 rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
                        disabled={isAnalyzing}
                      >
                        <UploadCloud className="h-4 w-4" />
                        Upload File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 min-w-0 xl:order-2">
                <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e5edf8] px-4 py-3 sm:px-5 sm:py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">Article Content</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Paste your content or edit imported text directly in the workspace.
                      </p>
                    </div>
                    <div className="ml-3 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#2758a5]">
                      {hasContent
                        ? `${normalizedPlainText.split(/\s+/).filter(Boolean).length} words`
                        : "Waiting for content"}
                    </div>
                  </div>

                  <div className="relative order-2 min-h-0 flex-1 p-4 sm:p-5">
                    <div
                      ref={editableRef}
                      contentEditable={!isAnalyzing}
                      onInput={handleInput}
                      className={`overflow-y-auto rounded-xl border border-[#d9e4f4] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5 prose rich-prose max-w-none focus:outline-none focus:ring-2 focus:ring-[#2758a5]/20 focus:ring-offset-2 sm:p-6 ${
                        isAnalyzing ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      style={{
                        height: "clamp(260px, 42vh, 520px)",
                        maxHeight: "100%",
                      }}
                    />
                    {!content ? (
                      <div className="pointer-events-none absolute left-8 top-8 max-w-md text-sm leading-6 text-slate-400 sm:left-10 sm:top-10">
                        Paste your article here or upload a file. Rich text formatting from
                        supported documents will be preserved where possible.
                      </div>
                    ) : null}
                  </div>

                  <div className="order-3 flex flex-col gap-3 border-t border-[#e5edf8] bg-[#fbfdff] px-4 py-4 sm:px-5 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                    <div className="flex items-center gap-2 xl:hidden">
                      {fileName ? (
                        <div className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-[#dde6f4] bg-[#f8fbff] px-3 py-2 text-sm text-slate-600">
                          <FileText className="h-4 w-4 flex-shrink-0 text-[#2758a5]" />
                          <span className="truncate">{fileName}</span>
                        </div>
                      ) : null}
                      <Button
                        onClick={handleRemove}
                        variant="ghost"
                        className="h-10 justify-center gap-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        disabled={isAnalyzing || (!fileName && !hasContent)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>

                    <Button
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                      className="h-11 min-w-[180px] bg-[#1d4ed8] text-white shadow-sm hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Content"}
                    </Button>
                  </div>
                </div>
              </div>
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
    </div>
  );
}

export function htmlToPlainText(html: string): string {
  if (!html || typeof html !== "string") return "";
  try {
    const container = document.createElement("div");
    container.innerHTML = html;
    const text = container.innerText || "";
    return text.replace(/\u00A0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return "";
  }
}
