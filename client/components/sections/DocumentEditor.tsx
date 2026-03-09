import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { InteractiveEditor } from "./InteractiveEditor";
import { RecommendationsList } from "./RecommendationsList";
import { RecommendationOptions } from "./RecommendationOptions";
import type { Recommendation, RecommendationItem } from "@/services/seoAnalysis";

interface DocumentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  recommendations: RecommendationItem; // contains overall, sectionLevel, sentenceLevel
  onSave: (updatedContent: string) => void;
}

export function DocumentEditor({
  isOpen,
  onClose,
  onSave,
  content: initialContent,
  recommendations,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);
  const [collapsedMiddle, setCollapsedMiddle] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = useState<number | null>(
    (recommendations && recommendations.sentenceLevel && recommendations.sentenceLevel.length > 0) ? 0 : null
  );
  const [activeTab, setActiveTab] = useState<'overall'|'sectionLevel'|'sentenceLevel'>('sentenceLevel');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // when active tab or recommendations change, auto-select first item when available
  useEffect(() => {
    const activeListLength = (
      activeTab === 'overall' ? (recommendations.overall?.length || 0) :
      activeTab === 'sectionLevel' ? (recommendations.sectionLevel?.length || 0) :
      (recommendations.sentenceLevel?.length || 0)
    );
    if (activeListLength > 0) setSelectedRecommendationIndex(0);
    else setSelectedRecommendationIndex(null);
  }, [activeTab, recommendations]);

  // keep internal content state in sync when parent updates content prop
  useEffect(() => {
    setContent(initialContent ?? "");
  }, [initialContent]);

  if (!isOpen) return null;

  const activeList: Recommendation[] = (
    activeTab === 'overall' ? (recommendations.overall || []) :
    activeTab === 'sectionLevel' ? (recommendations.sectionLevel || []) :
    (recommendations.sentenceLevel || [])
  );

  const selectedRecommendation =
    selectedRecommendationIndex !== null ? activeList[selectedRecommendationIndex] : null;

  const totalRecommendations = (recommendations?.overall?.length || 0) + (recommendations?.sectionLevel?.length || 0) + (recommendations?.sentenceLevel?.length || 0);

  const handleApplySuggestion = (suggestion: string) => {
    if (selectedRecommendation) {
      // Replace the bad example with good example if found
      const newContent = content.replace(
        selectedRecommendation.examples.bad,
        selectedRecommendation.examples.good
      );
      setContent(newContent);

      // Auto-select next recommendation
      if (selectedRecommendationIndex !== null && selectedRecommendationIndex < activeList.length - 1) {
        setSelectedRecommendationIndex(selectedRecommendationIndex + 1);
      }
    }
  };

  const handleDownload = () => {
    // Create a simple text file or doc format
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "edited-content.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleDone = () => {
    onSave(content); // Pass the edited content back
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      {/* Modal Container */}
      <div className={(isFullScreen ? 'h-screen w-screen rounded-md' : 'h-[85vh] w-[min(1200px,95vw)] rounded-lg') + ' bg-white shadow-xl flex flex-col overflow-hidden mx-auto relative'}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Centauri Content <span className="text-orange-500">Editor</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review {totalRecommendations} recommendations and optimize your content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle full screen"
            >
              {isFullScreen ? '🗗' : '🗖'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close editor"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="flex-1 overflow-hidden flex flex-row gap-6 items-stretch min-w-0 pb-20">
          {/* Left Column - Recommendations List */}
          {!collapsedLeft && (
            <div className="flex-none w-72 max-w-[320px] border-r border-gray-100 flex flex-col bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 justify-between bg-gradient-to-r from-orange-50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveTab('overall'); setSelectedRecommendationIndex(recommendations.overall?.length ? 0 : null); }}
                    className={`px-3 py-1 rounded ${activeTab==='overall' ? 'bg-orange-100' : 'bg-white'}`}
                  >Overall</button>
                  <button
                    onClick={() => { setActiveTab('sectionLevel'); setSelectedRecommendationIndex(recommendations.sectionLevel?.length ? 0 : null); }}
                    className={`px-3 py-1 rounded ${activeTab==='sectionLevel' ? 'bg-orange-100' : 'bg-white'}`}
                  >Section</button>
                  <button
                    onClick={() => { setActiveTab('sentenceLevel'); setSelectedRecommendationIndex(recommendations.sentenceLevel?.length ? 0 : null); }}
                    className={`px-3 py-1 rounded ${activeTab==='sentenceLevel' ? 'bg-orange-100' : 'bg-white'}`}
                  >Sentence</button>
                </div>
                <button
                  onClick={() => setCollapsedLeft(true)}
                  className="text-sm px-2 py-1 rounded hover:bg-gray-100"
                  title="Minimize left"
                >
                  —
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <RecommendationsList
                  recommendations={activeList}
                  selectedIndex={selectedRecommendationIndex}
                  onSelectRecommendation={setSelectedRecommendationIndex}
                />
              </div>
            </div>
          )}

          {/* Middle Column - Editor */}
          {!collapsedMiddle ? (
            <div className="flex-1 min-w-[360px] flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b bg-white flex items-center justify-end">
                <button
                  onClick={() => setCollapsedMiddle(true)}
                  className="text-sm px-2 py-1 rounded hover:bg-gray-100"
                  title="Minimize editor"
                >
                  —
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-gray-50 min-w-0">
                <div className="h-full w-full border rounded-md bg-white overflow-auto shadow-sm min-w-0" style={{borderColor:'#eef2f6'}}>
                  <InteractiveEditor
                    content={content}
                    onContentChange={setContent}
                    highlightText={
                      selectedRecommendation ? selectedRecommendation.examples.bad : ""
                    }
                    highlightTrigger={selectedRecommendationIndex ?? -1}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-12 flex items-center justify-center border-r">
              <button onClick={() => setCollapsedMiddle(false)} className="text-sm">▢</button>
            </div>
          )}

          {/* Right Column - Recommendation Options */}
          {!collapsedRight && selectedRecommendation && (
            <div className="flex-none w-80 max-w-[360px] min-w-0 flex flex-col bg-white border-l shadow-sm">
              <div className="px-4 py-2 border-b flex justify-end bg-gradient-to-r from-orange-50">
                <button onClick={() => setCollapsedRight(true)} className="text-sm px-2 py-1 rounded hover:bg-gray-100">—</button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <RecommendationOptions
                  recommendation={selectedRecommendation}
                  onApplySuggestion={handleApplySuggestion}
                />
              </div>
            </div>
          )}
          {collapsedRight && (
            <div className="w-12 flex items-center justify-center border-l">
              <button onClick={() => setCollapsedRight(false)} className="text-sm">▢</button>
            </div>
          )}
        </div>

        {/* Footer (sticky inside modal) */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200" style={{backdropFilter: 'blur(2px)'}}>
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedRecommendationIndex !== null && activeList.length > 0
              ? `Showing recommendation ${selectedRecommendationIndex + 1} of ${activeList.length}`
              : "No recommendations"}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              //onClick={onClose}
              onClick={handleDone}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
            >
              Done Editing
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
