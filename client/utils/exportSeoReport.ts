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
    const title = (text: string) =>
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            size: 32,
          }),
        ],
        spacing: { after: 400 },
      });
  
    const h2 = (text: string) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      });
  
    const labelValue = (label: string, value?: string | number | null) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true }),
          new TextRun(String(value ?? "N/A")),
        ],
        spacing: { after: 120 },
      });
  
    /* ---------------- Document ---------------- */
  
    const doc = new Document({
      sections: [
        {
          children: [
            /* ---------- Header ---------- */
            title("Centauri Content Analysis Report"),
  
            new Paragraph({
              children: [
                new TextRun({ text: "Target Keyword: ", bold: true }),
                new TextRun(primaryKeyword),
              ],
              spacing: { after: 300 },
            }),
  
            /* ---------- Suggested Metadata ---------- */
            h2("Suggested SEO Metadata"),
  
            labelValue("URL Slug", analysis.inputIntegrity.received?.Url ? "Provided" : "Missing"),
            labelValue("Meta Title", analysis.inputIntegrity.received?.MetaTitle ? "Provided" : "Missing"),
            labelValue(
              "Meta Description",
              analysis.inputIntegrity.received?.MetaDescription ? "Provided" : "Missing"
            ),
  
            /* ---------- Scores ---------- */
            h2("Analysis Scores"),
  
            new Paragraph({
              children: [
                new TextRun({
                  text: `SEO Score: ${analysis.finalScores.userVisible.seoScore ?? 0}/100`,
                }),
                new TextRun({
                  text: ` | AI Indexing: ${analysis.finalScores.userVisible.aiIndexingScore ?? 0}/100`,
                }),
                new TextRun({
                  text: ` | Authority: ${analysis.level2Scores.authorityScore ?? 0}/10`,
                }),
                new TextRun({
                  text: ` | Plagiarism: ${analysis.level2Scores.plagiarismScore ?? 0}/10`,
                }),
                new TextRun({
                  text: ` | Readability: ${analysis.finalScores.userVisible.readabilityScore ?? 0}/10`,
                }),
              ],
              spacing: { after: 300 },
            }),
  
            /* ---------- Action Plan ---------- */
            h2("Improvement Action Plan"),
  
            ...analysis.recommendations.map((rec) => {
              const priority =
                rec.issue.toLowerCase().includes("ai") ||
                rec.issue.toLowerCase().includes("credibility")
                  ? "HIGH"
                  : "MEDIUM";
  
              return new Paragraph({
                children: [
                  new TextRun({
                    text: `[${priority}] ${rec.issue}\n`,
                    bold: true,
                  }),
                  new TextRun({
                    text: rec.whatToChange,
                  }),
                ],
                spacing: { after: 200 },
              });
            }),
  
            /* ---------- Original Content ---------- */
            h2("Original Article Content"),
  
            ...(articleContent
              ? articleContent.split("\n").map(
                  (line) =>
                    new Paragraph({
                      text: line,
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
  
    const blob = await Packer.toBlob(doc);
    const safeKeyword =
      primaryKeyword?.trim().replace(/\s+/g, "_") || "Report";
  
    saveAs(blob, `Centauri_Analysis_${safeKeyword}.docx`);
  }
  