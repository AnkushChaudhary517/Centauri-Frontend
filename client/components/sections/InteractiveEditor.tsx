import { useEffect, useRef } from "react";

interface InteractiveEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  highlightText?: string;
  highlightTrigger?: number;
}

export function InteractiveEditor({
  content,
  onContentChange,
  highlightText,
  highlightTrigger,
}: InteractiveEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null); // scrollable container
  const contentRef = useRef<HTMLDivElement>(null); // editable content
  const toolbarRef = useRef<HTMLDivElement>(null);


  // Update content display when content (rich HTML) changes
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  // formatting helpers using execCommand for simplicity
  const execFormat = (cmd: string, value?: string) => {
    document.execCommand(cmd, false as any, value);
    // bubble up changes
    if (contentRef.current) onContentChange(contentRef.current.innerHTML);
    contentRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // keep Tab inside editor as 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const tabNode = document.createTextNode('\u00a0\u00a0');
      range.insertNode(tabNode);
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      sel.removeAllRanges();
      sel.addRange(range);
      onContentChange(contentRef.current?.innerHTML || '');
    }
  };

  // Highlight the relevant text when highlightText changes
  useEffect(() => {
    if (!contentRef.current) return;

    // helper to clear highlights
    const clearHighlights = () => {
      const highlighted = contentRef.current!.querySelectorAll('.highlighted-text');
      highlighted.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });
    };

    if (!highlightText) {
      clearHighlights();
      return;
    }

    const fullText = contentRef.current.innerText || '';
    if (fullText.indexOf(highlightText) === -1) {
      // exact bad text not found — do nothing
      return;
    }

    const escaped = highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');

    clearHighlights();

    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT, null);
    const nodes: Node[] = [];
    let n: Node | null = null;
    while ((n = walker.nextNode())) {
      if (regex.test(n.textContent || '')) nodes.push(n);
    }

    nodes.forEach((node) => {
      const span = document.createElement('span');
      const text = node.textContent || '';
      span.innerHTML = text.replace(regex, '<span class="highlighted-text" style="background-color:#fef08a;font-weight:600;padding:0 4px;border-radius:4px;">$&</span>');
      node.parentNode!.replaceChild(span, node);
    });

    const firstMatch = contentRef.current.querySelector('.highlighted-text') as HTMLElement | null;
    if (firstMatch) {
      // choose the scrollable element (the editable content itself)
      const container = contentRef.current as HTMLElement;
      try {
        // Calculate offset relative to container and center the match
        const containerRect = container.getBoundingClientRect();
        const targetRect = firstMatch.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
        const scrollTo = Math.max(0, relativeTop - container.clientHeight / 2 + targetRect.height / 2);
        container.scrollTo({ top: scrollTo, behavior: 'smooth' });

        // move caret to the match start
        const range = document.createRange();
        range.selectNodeContents(firstMatch);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightText, highlightTrigger]);

  const handleInput = () => {
    if (contentRef.current) {
      onContentChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div className="interactive-editor h-full flex flex-col bg-white">
      {/* Header + Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Document Editor</h2>
          <p className="text-sm text-gray-600 mt-1">Select a recommendation to highlight and edit content inline</p>
        </div>
        <div ref={toolbarRef} className="flex items-center gap-2">
          <button aria-label="Bold" onClick={() => execFormat('bold')} className="px-3 py-1 rounded bg-white border hover:bg-gray-50">B</button>
          <button aria-label="Italic" onClick={() => execFormat('italic')} className="px-3 py-1 rounded bg-white border hover:bg-gray-50">I</button>
          <button aria-label="Underline" onClick={() => execFormat('underline')} className="px-3 py-1 rounded bg-white border hover:bg-gray-50">U</button>
          <button aria-label="Bulleted list" onClick={() => execFormat('insertUnorderedList')} className="px-3 py-1 rounded bg-white border hover:bg-gray-50">• List</button>
          <button aria-label="Numbered list" onClick={() => execFormat('insertOrderedList')} className="px-3 py-1 rounded bg-white border hover:bg-gray-50">1. List</button>
          <button aria-label="Insert link" onClick={() => { const url = prompt('Enter URL'); if (url) execFormat('createLink', url); }} className="px-3 py-1 rounded bg-white border hover:bg-gray-50">Link</button>
        </div>
      </div>

      {/* Editor Area */}
      <div ref={containerRef} className="flex-1 p-4" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="flex-1 relative">
          {/* placeholder when editor is empty */}
          {(!content || content.replace(/\s|&nbsp;|<br\/?>(\s*)?/g, '').length === 0) && (
            <div className="absolute inset-0 pointer-events-none p-6 text-gray-400">
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
            className="min-h-[250px] max-h-[500px] overflow-y-auto border rounded-md bg-white prose rich-prose max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-6 text-gray-900 leading-relaxed"
            style={{
              border: '1px solid #e2e8f0',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div>💡 Click a recommendation to highlight related content and apply fixes.</div>
          <div className="text-right">Words: {content ? content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length : 0}</div>
        </div>
      </div>
    </div>
  );
}
