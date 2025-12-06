import { useState, useEffect } from "react";
import { FolderOpen, Play, Loader2, FileText, Upload, Copy, Bot } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

function App() {
  const [repoPath, setRepoPath] = useState<string>("");
  const [startRef, setStartRef] = useState("");
  const [endRef, setEndRef] = useState("");
  const [refs, setRefs] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"strategy" | "preview" | "result">("strategy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [aiContent, setAiContent] = useState("");
  const [model, setModel] = useState("llama3");
  const [mode, setMode] = useState<"manual" | "auto">("auto");

  const handleOpenRepo = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Git Repository",
    });

    if (selected) {
      setRepoPath(selected as string);
      // Fetch Refs
      try {
        const fetchedRefs = await invoke("get_repo_refs_cmd", { repoPath: selected as string });
        setRefs(fetchedRefs as string[]);
      } catch (e) {
        console.error("Failed to fetch refs:", e);
      }
    }
  };

  const handleImportNotes = async () => {
    const selected = await open({
      multiple: false,
      title: "Import Strategic Notes",
      filters: [{ name: "Markdown/Text", extensions: ["md", "txt"] }],
    });

    if (!selected) return;
    
    try {
      const content = await invoke("load_file_cmd", { filePath: selected as string });
      setNotes(content as string);
    } catch (e) {
      alert(`Error importing notes: ${e}`);
    }
  };

  const loadPreview = async () => {
    if (!repoPath || !startRef || !endRef) return;
    try {
      const res = await invoke("generate_preview_cmd", {
        repoPath, start: startRef, end: endRef, notes
      });
      setPreviewContent(res as string);
    } catch (e) {
      setPreviewContent(`Error generating preview: ${e}`);
    }
  };

  useEffect(() => {
    if (activeTab === "preview") {
      const timeout = setTimeout(loadPreview, 500); // Debounce
      return () => clearTimeout(timeout);
    }
  }, [repoPath, startRef, endRef, notes, activeTab]);

  const handleGenerate = async () => {
    if (!repoPath || !startRef || !endRef) return;
    setIsGenerating(true);
    setActiveTab("result");

    if (mode === "manual") {
        // Manual Mode: Just generate the full prompt context and show it
        setAiContent("Generating Context for Manual Copy...");
        try {
             // Reuse preview logic but formatted as final output
            const res = await invoke("generate_preview_cmd", {
                repoPath, start: startRef, end: endRef, notes
            });
            // Prepend a standard header/prompt instruction
            const fullPrompt = `*** SYSTEM PROMPT ***\n[Paste your system prompt here or configure in settings]\n\n*** DATA ***\n${res}`;
            setAiContent(fullPrompt as string);
        } catch (e) {
            setAiContent(`Error generating context: ${e}`);
        } finally {
            setIsGenerating(false);
        }
    } else {
        // Auto Mode: Call Ollama
        setAiContent("Initializing AI Model (" + model + ")... Please wait.");
        try {
            const res = await invoke("generate_ai_cmd", {
                repoPath, start: startRef, end: endRef, notes, model, systemPrompt: null
            });
            setAiContent(res as string);
        } catch (e) {
            setAiContent(`Error generating release notes: ${e}`);
        } finally {
            setIsGenerating(false);
        }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200">
          <span className="font-bold text-lg tracking-tight text-slate-900">CommitIQ</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Repo Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Repository</label>
            <button
              onClick={handleOpenRepo}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 transition-colors text-sm text-slate-700"
              title={repoPath}
            >
              <FolderOpen size={16} className="text-slate-400" />
              <span className="truncate">{repoPath || "Select Repository..."}</span>
            </button>
          </div>

          {/* Range Selection */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Range</label>
            <div className="grid grid-cols-1 gap-2">
              <div>
                  <input 
                    list="git-refs"
                    placeholder="Start (e.g. v1.0.0)" 
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={startRef}
                    onChange={(e) => setStartRef(e.target.value)}
                  />
              </div>
              <div>
                  <input 
                    list="git-refs"
                    placeholder="End (e.g. HEAD)" 
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={endRef}
                    onChange={(e) => setEndRef(e.target.value)}
                  />
              </div>
              <datalist id="git-refs">
                {refs.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>

          {/* Mode Selection */}
           <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Generation Mode</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-md">
                <button 
                    onClick={() => setMode("auto")}
                    className={`flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded ${mode === "auto" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                    <Bot size={14} /> Auto
                </button>
                <button 
                    onClick={() => setMode("manual")}
                    className={`flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded ${mode === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                    <Copy size={14} /> Manual
                </button>
            </div>
          </div>

          {/* AI Settings (Only in Auto Mode) */}
          {mode === "auto" && (
              <div className="space-y-2">
                 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ollama Model</label>
                 <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                 />
              </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !repoPath || !startRef || !endRef}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm text-white shadow-sm transition-all
                    ${isGenerating || !repoPath || !startRef || !endRef
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98]'}
                    `}
            >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : (mode === "auto" ? <Play size={16} /> : <Copy size={16} />)}
                {isGenerating ? "Processing..." : (mode === "auto" ? "Generate with AI" : "Generate Prompt")}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Tabs */}
        <div className="h-14 border-b border-slate-200 flex items-end px-6 space-x-6">
            <button 
                onClick={() => setActiveTab("strategy")}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "strategy" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
                <FileText size={16} />
                Strategy & Notes
            </button>
            <button 
                onClick={() => setActiveTab("preview")}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "preview" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
                Context Preview
            </button>
            <button 
                onClick={() => setActiveTab("result")}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "result" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
                {mode === "auto" ? "Release Notes (AI)" : "Prompt Context"}
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50/50 relative">
            {activeTab === "strategy" && (
                <div className="absolute inset-0 flex flex-col p-8">
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Strategic Context</h2>
                        <button 
                            onClick={handleImportNotes}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                        >
                            <Upload size={14} />
                            Import from File
                        </button>
                     </div>
                     <textarea
                        className="flex-1 w-full p-6 bg-white border border-slate-200 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-mono leading-relaxed"
                        placeholder="Type specific strategic context, marketing highlights, or instructions here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                     />
                </div>
            )}

            {activeTab === "preview" && (
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        {previewContent ? (
                             <pre className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm text-xs font-mono text-slate-600 overflow-auto whitespace-pre-wrap">
                                {previewContent}
                             </pre>
                        ) : (
                            <div className="p-12 text-center text-slate-400">
                                Configure repository and range to see preview.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "result" && (
                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                         {aiContent ? (
                             <div className="prose prose-slate prose-sm max-w-none bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                                 <pre className="whitespace-pre-wrap font-sans">{aiContent}</pre>
                             </div>
                         ) : (
                            <div className="p-12 text-center text-slate-400">
                                Click Generate to produce {mode === "auto" ? "release notes" : "context"}.
                            </div>
                         )}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;
