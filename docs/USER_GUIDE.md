# GitScribe User Guide

Welcome to **GitScribe**, your AI-powered assistant for writing better release notes. This guide covers installation, configuration, and usage for both the Desktop GUI and the Command Line Interface.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Desktop Application](#2-desktop-application)
   - [Installation](#installation)
   - [Generating Notes](#generating-notes)
   - [Settings & Configuration](#settings--configuration)
3. [Command Line Interface (CLI)](#3-command-line-interface-cli)
   - [Basic Usage](#basic-usage)
   - [Advanced Options](#advanced-options)
4. [Integrations](#4-integrations)
   - [Ollama (AI)](#ollama-ai)
   - [Jira](#jira)

---

## 1. Prerequisites

GitScribe relies on **Git** to read your repository history and **Ollama** to perform the AI generation locally.

1.  **Git:** Ensure git is installed and accessible in your terminal.
    - Verify: `git --version`
2.  **Ollama:** Download from [ollama.com](https://ollama.com/).
    - Install a model (e.g., Llama 3): `ollama pull llama3`
    - Ensure it is running: `ollama serve` (or via the system tray icon).

---

## 2. Desktop Application

The Desktop App provides a "Zen" experience for crafting release notes without memorizing CLI flags.

### Installation

**Windows:**

1.  Navigate to the project `target/release/bundle/nsis/`.
2.  Run `GitScribe_0.1.0_x64-setup.exe`.
3.  Follow the on-screen prompts.

_(Note: MacOS and Linux builds are supported via `npm run tauri build` but pre-built binaries are not yet distributed)._

### Generating Notes

1.  **Open Repository:** Click the folder icon in the top-right or use `Ctrl+O`. Select the root directory of the git repository you want to analyze.
2.  **Select Range:**
    - **Start Reference:** The older version (e.g., `v1.0.0` or `main@yesterday`).
    - **End Reference:** The newer version (e.g., `v1.1.0` or `HEAD`).
3.  **Add Context:** In the large text area, type any "Adhoc Notes."
    - _Example:_ "Focus on the new Login UI performance improvements. Ignore the backend refactor."
4.  **Preview:** Click the **Preview** tab to see exactly what data (commits + diffs) will be sent to the AI.
5.  **Generate:** Click the **Generate** button. The AI will stream the release notes into the right-hand panel.

### Settings & Configuration

Access the Settings menu via the gear icon or `File > Settings`.

- **AI Model:** Select which local Ollama model to use (e.g., `llama3`, `mistral`).
- **Jira Integration:** Enable to fetch issue details. (See [Integrations](#4-integrations)).

---

## 3. Command Line Interface (CLI)

The CLI is ideal for CI/CD pipelines or power users who prefer the terminal.

### Installation (from source)

```bash
git clone <repo_url>
cd git-revision-history
cargo build --release -p gitscribe_cli
```

The binary will be located at `./target/release/gitscribe_cli`.

### Basic Usage

Generate a raw context file (no AI):

```bash
gitscribe_cli --start v1.0.0 --end v1.1.0 --output context.md
```

### Advanced Options

**Auto-Generate with AI:**

```bash
gitscribe_cli --start HEAD~10 --end HEAD --ollama-model llama3 --output release_notes.md
```

**Injecting System Prompt:**

You can customize the AI's persona by providing a prompt file:

```bash
gitscribe_cli --start v1.0 --end v1.1 --system-prompt docs/ai/release-notes-prompt.md --output full_prompt.md
```

**All Arguments:**

| Flag                    | Description                               | Default  |
| ----------------------- | ----------------------------------------- | -------- |
| `--start <REF>`         | Starting commit hash/tag (exclusive).     | Required |
| `--end <REF>`           | Ending commit hash/tag (inclusive).       | Required |
| `--notes <FILE>`        | Path to a markdown file with adhoc notes. | None     |
| `--ollama-model <NAME>` | Triggers AI generation using this model.  | None     |
| `--jira-url <URL>`      | Base URL for Jira integration.            | None     |
| `--jira-pat <TOKEN>`    | Personal Access Token for Jira.           | None     |

---

## 4. Integrations

### Ollama (AI)

GitScribe uses a standard HTTP client to talk to Ollama.

- **Default URL:** `http://localhost:11434`
- **Troubleshooting:** If connection fails, ensure `ollama serve` is running and accessible via your browser.

### Jira

GitScribe can automatically detect Jira issue keys (e.g., `PROJ-123`) in your commit messages and fetch their Summary, Status, and Type.

**Setup:**

1.  **CLI:** Pass `--jira-url` and `--jira-pat`.
2.  **GUI:** Configure in the Settings modal.

**Requirements:**

- Jira Data Center (Self-hosted) or Jira Cloud.
- A Personal Access Token (PAT) with read permissions on the issues.
