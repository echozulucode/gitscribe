import { useState, useEffect } from "react";
import { FolderOpen, Play, Loader2, FileText, Upload, Copy, Bot, RefreshCw, WifiOff, Settings } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { LazyStore } from "@tauri-apps/plugin-store";
import { SettingsModal } from "./SettingsModal";
import "./App.css";

// Initialize store outside component to avoid re-creation
const store = new LazyStore("settings.dat");

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
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "ok" | "error">("checking");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJiraEnabled, setIsJiraEnabled] = useState(false);
  
  // Template State
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  // Check for Tauri environment
  // @ts-ignore
  const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

  // Helper to load refs
  const loadRefs = async (path: string) => {
      if (!isTauri) return;
      try {
        const fetchedRefs = await invoke("get_repo_refs_cmd", { repoPath: path });
        setRefs(fetchedRefs as string[]);
      } catch (e) {
        console.error("Failed to fetch refs:", e);
      }
  };

  // Load settings on startup
  useEffect(() => {
    if (!isTauri) {
        // MOCK DATA FOR BROWSER/TESTS
        setOllamaModels(["llama3", "mistral"]);
        setOllamaStatus("ok");
        setTemplates(["default.md"]);
        return;
    }

    const loadSettings = async () => {
      try {
        const savedRepoPath = await store.get("repoPath");
        if (savedRepoPath) {
            setRepoPath(savedRepoPath as string);
            if (savedRepoPath !== "") {
                loadRefs(savedRepoPath as string);
            }
        }
        
        const savedModel = await store.get("model");
        if (savedModel) setModel(savedModel as string);

        const savedTemplate = await store.get("selectedTemplate");
        if (savedTemplate) setSelectedTemplate(savedTemplate as string);

        const savedJira = await store.get("isJiraEnabled");
        if (savedJira !== null) setIsJiraEnabled(savedJira as boolean);
      } catch (e) {
        console.warn("Failed to load settings (running in browser?):", e);
      }
    };
    loadSettings();
    checkOllama();
    loadTemplates();
  }, [isTauri]);

  // Save settings on change
  useEffect(() => { if (isTauri) store.set("repoPath", repoPath); }, [repoPath, isTauri]);
  useEffect(() => { if (isTauri) store.set("model", model); }, [model, isTauri]);
  useEffect(() => { if (isTauri) store.set("selectedTemplate", selectedTemplate); }, [selectedTemplate, isTauri]);
  useEffect(() => { if (isTauri) store.set("isJiraEnabled", isJiraEnabled); }, [isJiraEnabled, isTauri]);

  // When template changes, load content
  useEffect(() => {
    if (isTauri && selectedTemplate) {
        invoke("load_template_cmd", { filename: selectedTemplate })
            .then(content => setSystemPrompt(content as string))
            .catch(e => console.error("Failed to load template:", e));
    }
  }, [selectedTemplate, isTauri]);

  const loadTemplates = async () => {
      if (!isTauri) return;
      try {
          const list = await invoke("list_templates_cmd");
          const tmpls = list as string[];
          setTemplates(tmpls);
          // Select default if available, or first one
          if (tmpls.includes("default.md")) setSelectedTemplate("default.md");
          else if (tmpls.length > 0) setSelectedTemplate(tmpls[0]);
      } catch (e) {
          console.error("Failed to load templates:", e);
      }
  };

  const checkOllama = async () => {
    if (!isTauri) return;
    setOllamaStatus("checking");
    try {
      const models = await invoke("get_ollama_models_cmd");
      setOllamaModels(models as string[]);
      setOllamaStatus("ok");
      
      const available = models as string[];
      if (available.length > 0 && !available.includes(model)) {
        if (available.some(m => m.includes("llama3"))) setModel(available.find(m => m.includes("llama3"))!);
        else if (available.some(m => m.includes("mistral"))) setModel(available.find(m => m.includes("mistral"))!);
        else setModel(available[0]);
      }
    } catch (e) {
      setOllamaStatus("error");
      console.error("Ollama check failed:", e);
    }
  };

  const handleOpenRepo = async () => {
    if (!isTauri) return;
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Git Repository",
    });

    if (selected) {
      setRepoPath(selected as string);
      loadRefs(selected as string);
    }
  };

  const handleImportNotes = async () => {
    if (!isTauri) return;
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
    if (!isTauri) return;
    if (!repoPath || !startRef || !endRef) return;
    try {
      let jiraUrl, jiraPat;
      if (isJiraEnabled) {
          jiraUrl = await store.get("jira_url");
          jiraPat = await store.get("jira_pat");
      }

      const res = await invoke("generate_preview_cmd", {
        repoPath, start: startRef, end: endRef, notes,
        jiraUrl: jiraUrl || undefined,
        jiraPat: jiraPat || undefined
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

  // System Event Listeners
  useEffect(() => {
    if (!isTauri) return;
    const unlistenRepo = listen("request-open-repo", () => {
        handleOpenRepo();
    });
    const unlistenAbout = listen("request-show-about", () => {
        alert("GitScribe v0.1.0\n\nYour AI-Powered Release Note Assistant.");
    });

    return () => {
        unlistenRepo.then(f => f());
        unlistenAbout.then(f => f());
    };
  }, [isTauri]);

  // Streaming Listener
  useEffect(() => {
    if (!isTauri) return;
    const unlisten = listen<string>("ai-token", (event) => {
        setAiContent(prev => prev + event.payload);
    });
    return () => {
        unlisten.then(f => f());
    };
  }, [isTauri]);

  const handleGenerate = async () => {
    if (!isTauri) return;
    if (!repoPath || !startRef || !endRef) return;
    setIsGenerating(true);
    setActiveTab("result");

    let jiraUrl, jiraPat;
    if (isJiraEnabled) {
        jiraUrl = await store.get("jira_url");
        jiraPat = await store.get("jira_pat");
    }

    if (mode === "manual") {
        setAiContent("Generating Context for Manual Copy...");
        try {
            const res = await invoke("generate_preview_cmd", {
                repoPath, start: startRef, end: endRef, notes,
                jiraUrl: jiraUrl || undefined,
                jiraPat: jiraPat || undefined
            });
            // Use the loaded system prompt instead of placeholder
            const promptContent = systemPrompt || "[No template loaded]";
            const fullPrompt = `${promptContent}\n\n*** DATA TO PROCESS ***\n\n${res}`;
            setAiContent(fullPrompt as string);
        } catch (e) {
            setAiContent(`Error generating context: ${e}`);
        } finally {
            setIsGenerating(false);
        }
    } else {
        if (ollamaStatus !== "ok") {
            setAiContent("Error: Ollama is not detected. Please verify it is running on http://localhost:11434");
            setIsGenerating(false);
            return;
        }

        setAiContent(""); // Clear previous content
        try {
            // Pass the loaded system prompt content
            await invoke("generate_ai_cmd", {
                repoPath, start: startRef, end: endRef, notes, model, 
                systemPrompt: systemPrompt || undefined,
                jiraUrl: jiraUrl || undefined,
                jiraPat: jiraPat || undefined
            });
        } catch (e) {
            setAiContent(prev => prev + `\n\nError generating release notes: ${e}`);
        } finally {
            setIsGenerating(false);
        }
    }
  };

  // Handle Ctrl+Enter for Generate
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]); // Depend on handleGenerate to ensure it's up-to-date

  return (
    <div className="flex h-screen w-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
          <span className="font-bold text-lg tracking-tight text-slate-900">GitScribe</span>
          
          <div className="flex items-center gap-1.5" title={ollamaStatus === "ok" ? "Ollama Connected" : "Ollama Disconnected"}>
            {ollamaStatus === "checking" && <Loader2 size={14} className="animate-spin text-slate-400" />}
            {ollamaStatus === "ok" && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
            {ollamaStatus === "error" && <div className="w-2 h-2 rounded-full bg-rose-500" />}
          </div>
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

          {/* Generation Settings (Prompt & Model) */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <Settings size={14} className="text-slate-400"/>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Settings</label>
                  </div>
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-[10px] text-blue-500 hover:text-blue-700 font-medium hover:underline"
                  >
                    Configure
                  </button>
              </div>

              {/* Jira Toggle */}
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-[10px] font-medium text-slate-600">Enable Jira</span>
                  <button 
                    onClick={() => setIsJiraEnabled(!isJiraEnabled)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${isJiraEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
                  >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${isJiraEnabled ? 'left-4.5' : 'left-0.5'}`} />
                  </button>
              </div>

              {/* Prompt Template Selection */}
              <div className="space-y-1">
                 <label className="text-[10px] font-medium text-slate-400">Prompt Template</label>
                 <div className="relative">
                     <select 
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                     >
                        {templates.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <div className="absolute right-3 top-2.5 pointer-events-none">
                         <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                 </div>
              </div>

              {/* AI Settings (Only in Auto Mode) */}
              {mode === "auto" && (
                  <div className="space-y-1">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-medium text-slate-400">Ollama Model</label>
                        <button onClick={checkOllama} title="Refresh Models" className="text-slate-400 hover:text-slate-600">
                            <RefreshCw size={10} className={ollamaStatus === "checking" ? "animate-spin" : ""} />
                        </button>
                     </div>
                     
                     {ollamaStatus === "ok" ? (
                         <div className="relative">
                             <select 
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                             >
                                {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             <div className="absolute right-3 top-2.5 pointer-events-none">
                                 <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                             </div>
                         </div>
                     ) : (
                         <div className="p-2 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2 text-xs text-rose-700">
                            <WifiOff size={12} />
                            <span>Offline</span>
                         </div>
                     )}
                  </div>
              )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !repoPath || !startRef || !endRef || (mode === "auto" && ollamaStatus !== "ok")}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm text-white shadow-sm transition-all
                    ${isGenerating || !repoPath || !startRef || !endRef || (mode === "auto" && ollamaStatus !== "ok")
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
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
