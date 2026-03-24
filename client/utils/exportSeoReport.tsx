import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  TableRow,
  TableCell,
  WidthType,
  Table,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import type {
  AnalysisRequest,
  AnalysisResponse,
  RecommendationResponse,
} from "@/services/seoAnalysis";
import { getRecommendations } from "@/services/seoAnalysis";
import { toast } from "@/components/ui/use-toast";

/* ================= POLLING CONFIG ================= */
const MAX_ATTEMPTS = 10;
const POLL_INTERVAL = 10_000; // 10 sec

/* ================= API ================= */
export async function GetRecommendations(
  request: AnalysisRequest
): Promise<RecommendationResponse> {
  return getRecommendations(request);
}

/* ================= POLLING ================= */
export async function pollRecommendations(
  request: AnalysisRequest
): Promise<RecommendationResponse | null> {
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    try {
      const response = await GetRecommendations(request);

      if (response?.status?.toLowerCase() === "completed") {
        return response;
      }

      await new Promise((res) => setTimeout(res, POLL_INTERVAL));
      attempts++;
    } catch (err) {
      break;
    }
  }

  return null;
}

/* ================= HTML → DOCX ================= */
function htmlToDocxElements(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements: any[] = [];
  const bodyChildren = Array.from(doc.body.children);

  // ✅ Case 1: Plain text (no HTML elements)
  if (bodyChildren.length === 0) {
    const text = doc.body.textContent?.trim();

    if (text) {
      elements.push(
        new Paragraph({
          children: [new TextRun(text)],
        })
      );
    }

    return elements;
  }
  for (const el of bodyChildren) {
    if (!(el instanceof HTMLElement)) continue;

    if (el.tagName === "TABLE") {
      elements.push(parseTable(el as HTMLTableElement));
      continue;
    }

    switch (el.tagName) {
      case "H1":
        elements.push(
          new Paragraph({ text: el.textContent ?? "", heading: HeadingLevel.HEADING_1 })
        );
        break;
      case "H2":
        elements.push(
          new Paragraph({ text: el.textContent ?? "", heading: HeadingLevel.HEADING_2 })
        );
        break;
      case "H3":
        elements.push(
          new Paragraph({ text: el.textContent ?? "", heading: HeadingLevel.HEADING_3 })
        );
        break;
      case "P":
        elements.push(new Paragraph({ children: parseInline(el) }));
        break;
      case "UL":
        el.querySelectorAll("li").forEach((li) =>
          elements.push(
            new Paragraph({ children: parseInline(li), bullet: { level: 0 } })
          )
        );
        break;
      case "IMG":
        elements.push(parseImage(el as HTMLImageElement));
        break;
    }
  }

  return elements;
}

/* ================= TABLE ================= */
function parseTable(table: HTMLTableElement) {
  const rows = Array.from(table.rows).map((row) =>
    new TableRow({
      children: Array.from(row.cells).map(
        (cell) =>
          new TableCell({
            width: { size: 100 / row.cells.length, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: parseInline(cell) })],
          })
      ),
    })
  );

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

/* ================= IMAGE ================= */
function parseImage(img: HTMLImageElement) {
  if (!img.src?.startsWith("data:image")) {
    return new Paragraph({
      children: [new TextRun({ text: "[Unsupported image]", italics: true })],
    });
  }

  const base64 = img.src.split(",")[1];
  const uint8 = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  return new Paragraph({
    children: [
      new ImageRun({
        data: uint8.buffer,
        type: "jpg",
        transformation: { width: 300, height: 200 },
      }),
    ],
  });
}

/* ================= INLINE TEXT ================= */
function parseInline(
  node: ChildNode,
  style: { bold?: boolean; italics?: boolean; underline?: boolean; color?: string } = {}
): TextRun[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [new TextRun({ text: node.textContent ?? "" })];
  }

  if (!(node instanceof HTMLElement)) return [];

  const nextStyle = { ...style };
  if (node.tagName === "B") nextStyle.bold = true;
  if (node.tagName === "I") nextStyle.italics = true;
  if (node.tagName === "A") {
    nextStyle.underline = true;
    nextStyle.color = "0000FF";
  }

  return Array.from(node.childNodes).flatMap((child) =>
    parseInline(child, nextStyle)
  );
}

export async function exportSeoReport(
  analysis: AnalysisResponse,
  primaryKeyword: string,
  articleContent?: string,
  content?: string
) {
  // 1. Fetch recommendations
  const analysisRequest: AnalysisRequest = {
    Article: { Raw: content ?? articleContent ?? "", Format: "text" },
    PrimaryKeyword: primaryKeyword,
    SecondaryKeywords: [],
    MetaTitle: analysis.inputIntegrity.received.MetaTitle ? "Exists" : "",
    MetaDescription: "",
    Url: "",
    Context: { Locale: "en-US", CitationRules: "" },
  };

  const recommendations = await GetRecommendations(analysisRequest);



  /* ---------------- Helpers ---------------- */
  const H1 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { after: 400 } });
  const H2 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } });
  const kv = (label: string, value?: any) => new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(String(value ?? "N/A"))],
    spacing: { after: 120 },
  });
  
  const scoreLine = (label: string, value?: number,percentage:boolean=false) => new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(`${value ?? 0}${percentage?'%':'/100'}`)],
    spacing: { after: 120 },
  });
  const labeledLine = (
    label: string,
    value: string,
    options?: { strike?: boolean }
  ) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({
          text: value || "—",
          strike: options?.strike ?? false,
        }),
      ],
      spacing: { after: 120 },
    });
  /* ---------------- Document Generation ---------------- */
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          H1("Centauri Content Analysis Report"),

          // Meta info
          kv("Target Keyword", primaryKeyword),
          kv("URL Slug Status", analysis.inputIntegrity.received.url ? analysis.inputIntegrity.received.url : "Missing"),
          kv(
            "Meta Title",
            analysis.inputIntegrity.received.metaTitle ? analysis.inputIntegrity.received.metaTitle : "Missing"
          ),
          kv(
            "Meta Description",
            analysis.inputIntegrity.received.metaDescription
              ? analysis.inputIntegrity.received.metaDescription
              : "Missing"
          ),
          
          // Analysis Scores
          H2("Analysis Scores"),
          scoreLine("SEO Score", Math.round(analysis.finalScores.userVisible.seoScore)),
          scoreLine("AI Indexing", Math.round(analysis.finalScores.userVisible.aiIndexingScore)),
          scoreLine("Expertise", Math.round(analysis.finalScores.userVisible.expertiseScore), true),
          scoreLine("Authority", Math.round(analysis.finalScores.userVisible.authorityScore)),
          scoreLine("Readability", Math.round(analysis.finalScores.userVisible.readabilityScore)),

          // --- CRITICAL FIX: SPREAD OPERATORS (...) ---
          
          H2("Overall Recommendations"),
          ...(recommendations.recommendations?.overall?.flatMap((rec) => {

  
            // 2. Return an array of paragraphs (flatMap will flatten this)
            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${rec.priority}] ${rec.issue}: `,
                    bold: true,
                  }),
                  new TextRun({ text: rec.whatToChange }),
                ],
                spacing: { before: 300, after: 200 },
              }),
              labeledLine("Original", rec.examples?.bad || "N/A", { strike: true }),
              labeledLine("Fix", rec.examples?.good || "N/A"),
              new Paragraph({ spacing: { after: 200 } }), // Spacer
            ];
          }) ?? []),
  
          H2("Section Level Improvements"),
          ...(recommendations.recommendations?.sectionLevel?.flatMap((rec) => {
  
            return [
              new Paragraph({
                children: [
                  new TextRun({ text: `[${rec.priority}] ${rec.issue}: `, bold: true }),
                  new TextRun({ text: rec.whatToChange }),
                ],
                spacing: { before: 300, after: 200 },
              }),
              labeledLine("Original", rec.examples?.bad || "N/A", { strike: true }),
              labeledLine("Fix", rec.examples?.good || "N/A"),
            ];
          }) ?? []),

          H2("Sentence Level Improvements"),
          ...(recommendations.recommendations?.sentenceLevel?.flatMap((rec) => {
  
            return [
              new Paragraph({
                children: [
                  new TextRun({ text: `[${rec.priority}] ${rec.issue}: `, bold: true }),
                  new TextRun({ text: rec.whatToChange }),
                ],
                spacing: { before: 300, after: 200 },
              }),
              labeledLine("Original", rec.examples?.bad || "N/A", { strike: true }),
              labeledLine("Fix", rec.examples?.good || "N/A"),
            ];
          }) ?? []),

          H2("Original Content"),
          ...(content ? htmlToDocxElements(content) : []),
        ],
      },
    ],
  });

  // 2. Save file
  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Centauri_Report_${primaryKeyword.replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Docx generation failed:", error);
    toast({ title: "Error", description: "Failed to generate .docx file." });
  }
}
