import { renderAsync } from "docx-preview";

export async function docxToHtmlString(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Create a temporary container
  const tempDiv = document.createElement("div");

  // Render DOCX into the div
  await renderAsync(arrayBuffer, tempDiv);

  // Extract HTML string
  return tempDiv.innerHTML;
}
