# Implementation Plan - Part 7: Installer & Distribution

This plan outlines the steps to package **GitScribe** into a redistributable installer for Windows (and potentially other platforms).

## 1. Objective
Create a standalone installer (MSI or NSIS for Windows) that users can download and install. This ensures the application is self-contained and doesn't require the user to have Rust or Node.js installed.

## 2. Configuration (`tauri.conf.json`)

### 2.1 Bundle Settings
*   **Identifier:** Ensure `io.gitscribe.app` is set.
*   **Version:** Verify version is correct (e.g., `0.1.0`).
*   **Targets:** Configure `bundle` -> `targets` to include `msi` or `nsis` (NSIS is generally preferred for modern Windows apps).
*   **Resources:** Ensure any sidecar binaries (like `git` or `ollama` if we were bundling them, though we rely on system PATH currently) are handled. *Note: We assume the user has Git installed.*

### 2.2 Icons
*   Verify standard icon paths exist in `src-tauri/icons`.

## 3. GitHub Actions (CI/CD)
To automate this, we will create a GitHub Action workflow.

*   **Trigger:** On push to `main` or tag creation (`v*`).
*   **Steps:**
    1.  Checkout code.
    2.  Install Rust (stable).
    3.  Install Node.js.
    4.  Install dependencies (`npm install`).
    5.  Run `npm run tauri build`.
    6.  Upload artifacts (setup file) to GitHub Release.

## 4. Local Build Process
For immediate testing:
*   Command: `npm run tauri build`.
*   Output: `apps/gitscribe/src-tauri/target/release/bundle/nsis/GitScribe_0.1.0_x64-setup.exe`.

## 5. Execution Steps
1.  **Config:** Update `tauri.conf.json` for production bundling.
2.  **Build:** Run the build command locally to generate the installer.
3.  **Verify:** Test the installer on the local machine.
