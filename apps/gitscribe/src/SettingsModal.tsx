import { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("settings.dat");

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraPat, setJiraPat] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const savedUrl = await store.get("jira_url");
      if (savedUrl) setJiraUrl(savedUrl as string);
      
      const savedPat = await store.get("jira_pat");
      if (savedPat) setJiraPat(savedPat as string);
    } catch (e) {
      console.warn("Failed to load Jira settings:", e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await store.set("jira_url", jiraUrl);
    await store.set("jira_pat", jiraPat);
    await store.save(); // Ensure persistence
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Jira Integration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Jira Data Center Integration
          </div>
          
          <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-500 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-500" />
            <p>
              If enabled, GitScribe will scan for issue keys (e.g., PROJ-123) in your commit logs and 
              fetch their details to enrich the context.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Server URL</label>
              <input 
                type="url" 
                placeholder="https://jira.company.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={jiraUrl}
                onChange={(e) => setJiraUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Personal Access Token (PAT)</label>
              <input 
                type="password" 
                placeholder="••••••••••••••••••••"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={jiraPat}
                onChange={(e) => setJiraPat(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-all active:scale-[0.98]"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

function Loader2({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
