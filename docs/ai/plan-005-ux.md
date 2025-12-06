# Implementation Plan - Part 5: UX Polish & Rebranding

This plan focuses on finalizing the **GitScribe** identity, improving user accessibility to configuration, and adding standard desktop application features.

## 1. Rebranding & Refactoring
**Objective:** Eliminate the legacy `context_gui`/`CommitIQ` identifiers to fully adopt **GitScribe**.

### Tasks
*   **Rename Directory:** Move `apps/context_gui` to `apps/gitscribe`.
*   **Update Configuration:**
    *   `Cargo.toml` (Workspace members).
    *   `apps/gitscribe/package.json` (Name: `gitscribe`).
    *   `apps/gitscribe/src-tauri/Cargo.toml` (Name: `gitscribe`, Lib name: `gitscribe_lib`).
    *   `apps/gitscribe/src-tauri/tauri.conf.json` (Product Name: `GitScribe`, Identifier: `io.gitscribe.app`).
*   **Code References:** Update Rust imports/namespaces from `context_gui` to `gitscribe`.

## 2. Native Menu & System Integration
**Objective:** Provide standard access points for global application actions and help.

### Tasks
*   **Native Menu Bar:** Implement a standard Tauri menu.
    *   **File:**
        *   `Open Repository...` (Ctrl+O)
        *   `Open Templates Folder` (New Feature)
        *   `Separator`
        *   `Exit`
    *   **Edit:** Standard Copy/Paste/Cut.
    *   **Help:**
        *   `About GitScribe`
*   **"Open Templates Folder":** A command that launches the OS file explorer (Finder/Explorer/Nautilus) to the `app_data/templates` directory.
*   **"About" Dialog:** A clean modal or native message box showing Version (v0.1.0), Description, and Copyright.

## 3. UX Improvements & Persistence
**Objective:** Reduce friction for returning users.

### Tasks
*   **Persisted State:** Use `tauri-plugin-store` (or `localStorage`) to remember:
    *   Last opened repository path.
    *   Last selected Ollama model.
    *   Last selected prompt template.
    *   *Benefit:* User doesn't have to re-select everything on restart.
*   **Keyboard Shortcuts:**
    *   `Ctrl+Enter` (or `Cmd+Enter`) to trigger "Generate".
*   **Error Boundaries:** graceful handling if the Templates folder is deleted manually by the user.

## 4. Execution Steps

1.  **Refactor:** Perform the directory move and config updates first to ensure the build stabilizes under the new name.
2.  **Menu Logic:** Implement the Rust backend for the Menu and "Open Folder" logic.
3.  **Frontend Wiring:** Connect the Menu events to Frontend actions (if necessary) or handle them purely in Rust (for "Open Folder").
4.  **Persistence:** Add the logic to `App.tsx` to save/load settings.