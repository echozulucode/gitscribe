# Implementation Plan - Part 6: Jira Data Center Integration

This plan outlines the addition of optional Jira Data Center support to enrich the generated release context with issue details (Summary, Status, Type) found in commit messages.

## 1. Objective
Automatically detect Jira issue keys (e.g., `PROJ-123`) in commit logs, fetch their details from a specified Jira Data Center instance using a Personal Access Token (PAT), and append this information to the context for the LLM.

## 2. Core Logic (`crates/context_core`)

### 2.1 New Module: `jira.rs`
*   **Dependency:** `regex` to find patterns like `[A-Z]{2,}-\d+`.
*   **Structs:**
    *   `JiraConfig { url: String, pat: String }`
    *   `JiraIssue { key: String, summary: String, status: String, issue_type: String }`
*   **Functions:**
    *   `extract_issue_keys(text: &str) -> Vec<String>`: Scans commit logs for unique keys.
    *   `fetch_issue(client: &Client, config: &JiraConfig, key: &str) -> Result<Option<JiraIssue>>`:
        *   Performs `GET {url}/rest/api/2/issue/{key}`.
        *   Auth Header: `Bearer {pat}`.
        *   Returns `None` (and logs debug warning) if 404 or error, ensuring the main flow doesn't break.

### 2.2 Update `generate_context`
*   Modify function signature to accept `Option<JiraConfig>`.
*   **Logic Flow:**
    1.  Generate Git Log & Diff (existing).
    2.  If `JiraConfig` is provided:
        *   Extract keys from Git Log.
        *   Fetch details for each key (concurrently using `futures::stream::iter`).
        *   Format the results into a Markdown section:
            ```markdown
            ## Linked Jira Issues
            | Key | Type | Status | Summary |
            |-----|------|--------|---------|
            | PROJ-123 | Bug | In Progress | Fix login crash |
            ```
    3.  Append this section to the final output string.

## 3. User Interface (`apps/gitscribe`)

### 3.1 Settings Dialog
*   **Entry Point:** Click the "Settings" header or a new "Configure" button in the sidebar.
*   **Component:** A Modal dialog (using standard React state/Tailwind).
*   **Fields:**
    *   Toggle: "Enable Jira Integration"
    *   Input: "Server URL" (e.g., `https://jira.company.com`)
    *   Input: "Personal Access Token" (Type: `password`)
*   **Persistence:** Save these values to `settings.dat` via `LazyStore`.
    *   *Note:* While `tauri-plugin-store` saves to the user's AppData folder, strictly sensitive PATs ideally use OS Keychains. For this iteration, we will use the store but mask the input in the UI.

### 3.2 Generation Flow
*   Update `App.tsx` to read the Jira settings from the store before calling `generate_preview_cmd` or `generate_ai_cmd`.
*   Pass these values to the Rust backend commands.

## 4. Backend Commands (`src-tauri/src/lib.rs`)

*   Update `generate_preview_cmd` and `generate_ai_cmd` to accept optional `jira_url` and `jira_pat` arguments.
*   Construct `JiraConfig` if arguments are present and pass to `context_core`.

## 5. CLI Updates
*   Add arguments `--jira-url` and `--jira-pat` to the CLI tool to maintain parity.

## 6. Execution Steps
1.  **Core:** Implement `jira.rs` and extraction logic.
2.  **Integration:** Wire it into `generate_context`.
3.  **Backend:** Update Tauri commands to accept credentials.
4.  **Frontend:** Build the Settings Modal and wiring.
