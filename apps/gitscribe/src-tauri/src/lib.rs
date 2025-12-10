use gitscribe_core::jira::JiraConfig;
use gitscribe_core::{
    call_ollama, generate_context, list_git_refs, list_ollama_models, read_file_content,
};
use std::fs;
use std::path::Path;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Window};

const DEFAULT_PROMPT: &str = r##"# Role & Objective
You are an expert **Technical Product Manager** and **Strategic Communications Lead**.
Your mission is to transform raw technical input (adhoc notes, commit logs, diffs) into **world-class Release Notes** written for end users. Your writing must highlight product value, usability improvements, feature benefits, and resolved issues in clear human-friendly language.

Your output must be truthful, concise, and formatted using the template below with no deviations.

---

# Audience Focus — End Users Only

Write for everyday users who care about:

- What’s new?
- What got better?
- What problems are now fixed?
- Why should they update?

Avoid internal terminology, engineering detail, and operational risk language unless necessary for clarity.

---

# Input You Will Receive

1. **Adhoc Notes** — product vision, strategic messaging anchors (*highest priority*).
2. **Commit Logs** — chronological history of changes.
3. **Code Diff** — raw modifications used to validate behavior and user impact.

If Adhoc Notes conflict with commit/diff details, prioritize Adhoc Notes and use commits/diffs only for evidence and detail expansion.

---

# Mandatory Output Behaviors

### 1. Translate Technical Changes Into End-User Benefit
Everything included must answer the user's question: **"Why does this matter to me?"**

- ❌ "Refactored AuthenticationFactory."
- ❌ "Fix for issue #402"
- ✔ "Fixed a login failure affecting some users with MFA enabled (Issue #402)."

If no user value exists → exclude the item.

---

### 2. Noise Filtering — Exclude All Non-User-Facing Work

Do **not** mention:

- Whitespace, formatting, spelling changes
- Comment-only or rename-only commits
- Internal refactors with no user experience impact
- CI/CD, build scripts, test files, packaging changes

When uncertain → omit rather than speculate.

---

### 3. Interpreting Diffs (When Intent Is Unclear)

Use diffs to infer *behavior*, not code detail.

Look for changes that may indicate:

- Crashes fixed
- UI/UX behavior changes
- Input validation or error handling improvements
- Faster performance or smoother interactions
- More reliable workflows

Do not invent impact or performance metrics. If unsure, describe conservatively or exclude.

---

### 4. Security Mentions (Only If User-Relevant)

If a change clearly affects security in a way that users should know (e.g., patched vulnerability, improved data protection), include it.

Format CVEs as `[CVE-YYYY-XXXX]`.

Do not include exploit details, PoC code, or speculation.

---

### 5. Tone & Style Requirements

- Professional, clear, friendly, value-focused.
- No jargon unless unavoidable — prioritize plain language.
- Use active voice: *You can now…*, *This update makes it easier to…*
- Never exaggerate or fabricate details not present in the input.

---

# Output Template (Use Exactly As Written)

If any section has no content, write: **"None in this release."**

```markdown
# [Product Name] [Version]

**Release Date:** [YYYY-MM-DD]

## Executive Summary
[2–4 sentence high-level overview of what this release delivers and why it matters.]

## New Features
- **[Feature Name]** — [Describe the value to users. Use "You can now…" when appropriate.]

## Improvements
- **[Area/Workflow/Experience]** — [Describe enhancement in user-benefit terms.]

## Bug Fixes
- **[Issue/Component/Symptom]** — [Describe the resolved problem in user-language.] (Issue #[ID])

## Security Notes (User-Relevant Only)
- [CVE-ID or "None"]: [Short explanation of user impact — no technical exploit details.]

## Deprecations / Removed Functionality
- [List removed or changed features only if relevant to user behavior.]
- If none → **"None in this release."**
```
"##;

fn ensure_templates_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let app_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let templates_dir = app_dir.join("templates");

    if !templates_dir.exists() {
        fs::create_dir_all(&templates_dir).map_err(|e| e.to_string())?;
    }

    // Ensure default template exists
    let default_path = templates_dir.join("default.md");
    if !default_path.exists() {
        fs::write(&default_path, DEFAULT_PROMPT).map_err(|e| e.to_string())?;
    }

    Ok(templates_dir)
}

fn open_templates_folder(app: &AppHandle) {
    if let Ok(path) = ensure_templates_dir(app) {
        let _ = open::that(path);
    }
}

#[tauri::command]
fn list_templates_cmd(app: AppHandle) -> Result<Vec<String>, String> {
    let dir = ensure_templates_dir(&app)?;
    let mut templates = Vec::new();

    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.ends_with(".md") || name.ends_with(".txt") {
                    templates.push(name.to_string());
                }
            }
        }
    }
    Ok(templates)
}

#[tauri::command]
fn load_template_cmd(app: AppHandle, filename: String) -> Result<String, String> {
    let dir = ensure_templates_dir(&app)?;
    let path = dir.join(filename);
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_file_cmd(file_path: String) -> Result<String, String> {
    read_file_content(Some(&file_path), "User Notes")
        .map_err(|e| e.to_string())
        .and_then(|opt| opt.ok_or_else(|| "File not found or empty".to_string()))
}

#[tauri::command]
fn get_repo_refs_cmd(repo_path: String) -> Result<Vec<String>, String> {
    list_git_refs(Some(Path::new(&repo_path))).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_ollama_models_cmd() -> Result<Vec<String>, String> {
    let url = "http://localhost:11434";
    list_ollama_models(url).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn generate_preview_cmd(
    repo_path: String,
    start: String,
    end: String,
    notes: String,
    jira_url: Option<String>,
    jira_pat: Option<String>,
) -> Result<String, String> {
    let jira_config = if let (Some(url), Some(pat)) = (jira_url, jira_pat) {
        if !url.is_empty() && !pat.is_empty() {
            Some(JiraConfig { url, pat })
        } else {
            None
        }
    } else {
        None
    };

    generate_context(
        &start,
        &end,
        Some(notes),
        Some(Path::new(&repo_path)),
        jira_config,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
async fn generate_ai_cmd(
    window: Window,
    repo_path: String,
    start: String,
    end: String,
    notes: String,
    model: String,
    system_prompt: Option<String>,
    jira_url: Option<String>,
    jira_pat: Option<String>,
) -> Result<String, String> {
    let jira_config = if let (Some(url), Some(pat)) = (jira_url, jira_pat) {
        if !url.is_empty() && !pat.is_empty() {
            Some(JiraConfig { url, pat })
        } else {
            None
        }
    } else {
        None
    };

    let context = generate_context(
        &start,
        &end,
        Some(notes),
        Some(Path::new(&repo_path)),
        jira_config,
    )
    .await
    .map_err(|e| e.to_string())?;

    let url = "http://localhost:11434/api/generate";

    // Create a callback that emits events to the window
    let callback = move |token: &str| {
        let _ = window.emit("ai-token", token);
    };

    call_ollama(
        &model,
        url,
        &context,
        system_prompt.as_ref(),
        Some(callback),
    )
    .await
    .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();

            // File Menu
            let open_repo = MenuItem::with_id(
                handle,
                "menu-open-repo",
                "&Open Repository...",
                true,
                Some("CmdOrCtrl+O"),
            )?;
            let open_templates = MenuItem::with_id(
                handle,
                "menu-open-templates",
                "Open &Templates Folder",
                true,
                None::<&str>,
            )?;
            // Separator (predefined menu item)
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(handle, "quit", "&Quit", true, Some("CmdOrCtrl+Q"))?;
            let file_menu = Submenu::with_items(
                handle,
                "File",
                true,
                &[
                    &open_repo,
                    &open_templates,
                    &sep as &_, // separator
                    &quit,
                ],
            )?;

            // Edit Menu
            let edit_menu = Submenu::with_items(
                handle,
                "Edit",
                true,
                &[
                    &MenuItem::with_id(handle, "undo", "Undo", true, Some("CmdOrCtrl+Z"))?,
                    &MenuItem::with_id(handle, "redo", "Redo", true, Some("CmdOrCtrl+Shift+Z"))?,
                    &MenuItem::with_id(handle, "cut", "Cut", true, Some("CmdOrCtrl+X"))?,
                    &MenuItem::with_id(handle, "copy", "Copy", true, Some("CmdOrCtrl+C"))?,
                    &MenuItem::with_id(handle, "paste", "Paste", true, Some("CmdOrCtrl+V"))?,
                    &MenuItem::with_id(
                        handle,
                        "select_all",
                        "Select All",
                        true,
                        Some("CmdOrCtrl+A"),
                    )?,
                ],
            )?;

            // Help Menu
            let about = MenuItem::with_id(handle, "about", "About GitScribe", true, None::<&str>)?;
            let help_menu = Submenu::with_items(handle, "Help", true, &[&about])?;

            let menu = Menu::with_items(handle, &[&file_menu, &edit_menu, &help_menu])?;
            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "menu-open-templates" => {
                open_templates_folder(app);
            }
            "menu-open-repo" => {
                let _ = app.emit("request-open-repo", ());
            }
            "quit" => {
                std::process::exit(0);
            }
            "about" => {
                let _ = app.emit("request-show-about", ());
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            generate_preview_cmd,
            generate_ai_cmd,
            load_file_cmd,
            get_repo_refs_cmd,
            get_ollama_models_cmd,
            list_templates_cmd,
            load_template_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
