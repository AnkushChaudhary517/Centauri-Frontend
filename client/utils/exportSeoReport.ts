import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
  } from "docx";
  import { saveAs } from "file-saver";
  import type { AnalysisResponse } from "@/services/seoAnalysis";
  
  export async function exportSeoReport(
    analysis: AnalysisResponse,
    primaryKeyword: string,
    articleContent?: string
  ) {
    /* ---------------- Helpers ---------------- */
  
    const H1 = (text: string) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      });
  
    const H2 = (text: string) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      });
  
    const kv = (label: string, value?: string | number | null) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true }),
          new TextRun(String(value ?? "N/A")),
        ],
        spacing: { after: 120 },
      });
  
    const scoreLine = (label: string, value?: number, max = 100) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true }),
          new TextRun(`${value ?? 0}/${max}`),
        ],
        spacing: { after: 120 },
      });
  
    const actionItem = (priority: string, issue: string, fix: string) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `[${priority}] ${issue}\n`,
            bold: true,
          }),
          new TextRun({ text: fix }),
        ],
        spacing: { after: 240 },
      });
  
    /* ---------------- Document ---------------- */
  
    const doc = new Document({
      sections: [
        {
          children: [
            /* ---------- Title ---------- */
            H1("Centauri Content Analysis Report"),
  
            kv("Target Keyword", primaryKeyword),
  
            /* ---------- Input Integrity ---------- */
            kv(
              "URL Slug",
              analysis.inputIntegrity.received.Url ? "Provided" : "Missing"
            ),
            kv(
              "Meta Title",
              analysis.inputIntegrity.received.MetaTitle ? "Provided" : "Missing"
            ),
            kv(
              "Meta Description",
              analysis.inputIntegrity.received.MetaDescription
                ? "Provided"
                : "Missing"
            ),
  
            /* ---------- Suggested SEO Metadata ---------- */
            H2("Suggested SEO Metadata"),
  
            kv("Primary Keyword", primaryKeyword),
            kv(
              "Secondary Keywords",
              analysis.inputIntegrity.received.SecondaryKeywords
                ? "Provided"
                : "Missing"
            ),
  
            /* ---------- Scores ---------- */
            H2("Analysis Scores"),
  
            scoreLine(
              "SEO Score",
              analysis.finalScores.userVisible.seoScore,
              100
            ),
            scoreLine(
              "AI Indexing",
              analysis.finalScores.userVisible.aiIndexingScore,
              100
            ),
            scoreLine(
              "Authority",
              analysis.level2Scores.authorityScore,
              100
            ),
            scoreLine(
              "Plagiarism",
              analysis.level2Scores.plagiarismScore,
              100
            ),
            scoreLine(
              "Readability",
              analysis.finalScores.userVisible.readabilityScore,
              100
            ),
  
            /* ---------- Overall Action Plan ---------- */
            H2("Overall Improvement Action Plan"),
  
            ...analysis.recommendations.map((rec) => {
              const priority =
                rec.issue.toLowerCase().includes("ai") ||
                rec.issue.toLowerCase().includes("credibility")
                  ? "HIGH"
                  : "MEDIUM";
  
              return actionItem(priority, rec.issue, rec.whatToChange);
            }),
  
            /* ---------- Original Content ---------- */
            H2("Original Article Content"),
  
            ...(articleContent
              ? articleContent.split("\n").map(
                  (line) =>
                    new Paragraph({
                      text: line.trim(),
                      spacing: { after: 120 },
                      
                    })
                )
              : [
                  new Paragraph({
                    text: "Original article content not available.",
                  }),
                ]),
          ],
        },
      ],
    });
  
    /* ---------------- Save ---------------- */
  
    const blob = await Packer.toBlob(doc);
    const safeKeyword =
      primaryKeyword?.trim().replace(/\s+/g, "_") || "Report";
  
    saveAs(blob, `Centauri_Analysis_${safeKeyword}.docx`);
  }
  