use std::path::Path;
use context_core::{generate_context, call_ollama, read_file_content, list_git_refs, list_ollama_models};
use tauri::{AppHandle, Emitter, Window};

#[tauri::command]
fn load_file_cmd(file_path: String) -> Result<String, String> {
    read_file_content(Some(&file_path), "User Notes")
        .map_err(|e| e.to_string())
        .and_then(|opt| opt.ok_or_else(|| "File not found or empty".to_string()))
}

#[tauri::command]
fn get_repo_refs_cmd(repo_path: String) -> Result<Vec<String>, String> {
    list_git_refs(Some(Path::new(&repo_path)))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_ollama_models_cmd() -> Result<Vec<String>, String> {
    let url = "http://localhost:11434";
    list_ollama_models(url).await.map_err(|e| e.to_string())
}

#[tauri::command]
fn generate_preview_cmd(repo_path: String, start: String, end: String, notes: String) -> Result<String, String> {
    generate_context(&start, &end, Some(notes), Some(Path::new(&repo_path)))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn generate_ai_cmd(window: Window, repo_path: String, start: String, end: String, notes: String, model: String, system_prompt: Option<String>) -> Result<String, String> {
    let context = generate_context(&start, &end, Some(notes), Some(Path::new(&repo_path)))
        .map_err(|e| e.to_string())?;
    
    let url = "http://localhost:11434/api/generate";
    
    // Create a callback that emits events to the window
    let callback = move |token: &str| {
        let _ = window.emit("ai-token", token);
    };

    call_ollama(&model, url, &context, system_prompt.as_ref(), Some(callback))
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![generate_preview_cmd, generate_ai_cmd, load_file_cmd, get_repo_refs_cmd, get_ollama_models_cmd])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
