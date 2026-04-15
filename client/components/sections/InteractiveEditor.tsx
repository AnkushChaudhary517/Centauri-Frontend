import { useEffect, useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
} from "lucide-react";

interface InteractiveEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  highlightText?: string;
  highlightTrigger?: number;
  highlightMode?: "overall" | "sentence" | "section";
}

export function InteractiveEditor({
  content,
  onContentChange,
  highlightText,
  highlightTrigger,
  highlightMode = "overall",
}: InteractiveEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const escapeForRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const buildWholeWordRegex = (value: string, global = true) => {
    const escaped = escapeForRegex(value.trim());
    const flags = global ? "gu" : "u";
    return new RegExp(`(^|[^\\p{L}\\p{N}_])(${escaped})(?=$|[^\\p{L}\\p{N}_])`, flags);
  };

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  const execFormat = (cmd: string, value?: string) => {
    document.execCommand(cmd, false as any, value);
    if (contentRef.current) onContentChange(contentRef.current.innerHTML);
    contentRef.current?.focus();
  };

  const applyBlockFormat = (tag: "p" | "h1" | "h2" | "h3" | "h4") => {
    execFormat("formatBlock", `<${tag}>`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const tabNode = document.createTextNode("\u00a0\u00a0");
      range.insertNode(tabNode);
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      selection.removeAllRanges();
      selection.addRange(range);
      onContentChange(contentRef.current?.innerHTML || "");
    }
  };

  useEffect(() => {
    if (!contentRef.current) return;

    const clearHighlights = () => {
      const highlightedText = contentRef.current!.querySelectorAll(".highlighted-text");
      highlightedText.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ""), el);
          parent.normalize();
        }
      });

      const highlightedSections = contentRef.current!.querySelectorAll(".highlighted-section");
      highlightedSections.forEach((el) => {
        el.classList.remove("highlighted-section");
        (el as HTMLElement).style.background = "";
        (el as HTMLElement).style.borderRadius = "";
        (el as HTMLElement).style.boxShadow = "";
        (el as HTMLElement).style.paddingInline = "";
      });
    };

    clearHighlights();

    if (!highlightText || highlightMode === "overall") {
      return;
    }

    if (highlightMode === "sentence") {
      const fullText = contentRef.current.innerText || "";
      const testRegex = buildWholeWordRegex(highlightText, false);
      if (!testRegex.test(fullText)) return;

      const regex = buildWholeWordRegex(highlightText);

      const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT, null);
      const nodes: Node[] = [];
      let node: Node | null = null;
      while ((node = walker.nextNode())) {
        regex.lastIndex = 0;
        if (regex.test(node.textContent || "")) nodes.push(node);
      }

      nodes.forEach((textNode) => {
        const span = document.createElement("span");
        const text = textNode.textContent || "";
        regex.lastIndex = 0;
        span.innerHTML = text.replace(
          regex,
          '$1<span class="highlighted-text" style="background-color:#fde68a;font-weight:600;padding:0 4px;border-radius:4px;">$2</span>',
        );
        textNode.parentNode!.replaceChild(span, textNode);
      });

      const firstMatch = contentRef.current.querySelector(".highlighted-text") as HTMLElement | null;
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (highlightMode === "section") {
      const blocks = Array.from(contentRef.current.children) as HTMLElement[];
      if (!blocks.length) return;

      const targetIndex = blocks.findIndex((block) =>
        (block.textContent || "").includes(highlightText),
      );

      if (targetIndex === -1) return;

      const isHeadingTag = (tagName: string) => /^H[1-6]$/.test(tagName);

      let startIndex = targetIndex;
      for (let index = targetIndex; index >= 0; index -= 1) {
        if (isHeadingTag(blocks[index].tagName)) {
          startIndex = index;
          break;
        }
        startIndex = 0;
      }

      let endIndex = blocks.length;
      for (let index = targetIndex + 1; index < blocks.length; index += 1) {
        if (isHeadingTag(blocks[index].tagName)) {
          endIndex = index;
          break;
        }
      }

      const sectionBlocks = blocks.slice(startIndex, endIndex);
      sectionBlocks.forEach((block) => {
        block.classList.add("highlighted-section");
        block.style.background = "linear-gradient(90deg, rgba(253,230,138,0.32), rgba(253,230,138,0.08))";
        block.style.borderRadius = "12px";
        block.style.boxShadow = "inset 4px 0 0 #f59e0b";
        block.style.paddingInline = "12px";
      });

      const firstBlock = sectionBlocks[0];
      firstBlock?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightText, highlightTrigger, highlightMode]);

  const handleInput = () => {
    if (contentRef.current) {
      onContentChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div className="interactive-editor flex h-full flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)]">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur">
        <div ref={toolbarRef} className="flex flex-wrap items-center gap-2">
          <button
            aria-label="Paragraph"
            title="Paragraph"
            onClick={() => applyBlockFormat("p")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Pilcrow className="h-4 w-4" />
          </button>
          <button
            aria-label="Heading 1"
            title="Heading 1"
            onClick={() => applyBlockFormat("h1")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            aria-label="Heading 2"
            title="Heading 2"
            onClick={() => applyBlockFormat("h2")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            aria-label="Heading 3"
            title="Heading 3"
            onClick={() => applyBlockFormat("h3")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <button
            aria-label="Heading 4"
            title="Heading 4"
            onClick={() => applyBlockFormat("h4")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Heading4 className="h-4 w-4" />
          </button>
          <button
            aria-label="Bulleted list"
            title="Bulleted list"
            onClick={() => execFormat("insertUnorderedList")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            aria-label="Numbered list"
            title="Numbered list"
            onClick={() => execFormat("insertOrderedList")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            aria-label="Insert link"
            title="Insert link"
            onClick={() => {
              const url = prompt("Enter URL");
              if (url) execFormat("createLink", url);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 p-2 sm:p-2.5"
        style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <div className="relative flex-1">
          {(!content || content.replace(/\s|&nbsp;|<br\/?>(\s*)?/g, "").length === 0) && (
            <div className="pointer-events-none absolute inset-0 p-5 text-sm text-slate-400">
              Paste or type your article here. Use the toolbar to format text.
            </div>
          )}

          <div
            ref={contentRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            className="h-full min-h-[620px] overflow-y-auto rounded-[16px] border border-slate-200 bg-white px-5 py-5 prose rich-prose max-w-none text-slate-900 leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:ring-offset-1"
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </div>
    </div>
  );
}
