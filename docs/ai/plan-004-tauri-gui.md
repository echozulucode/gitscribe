# Implementation Plan - Part 3: Tauri GUI & Workspace Refactor

This plan outlines the evolution of the project from a simple CLI tool into a professional-grade Rust Workspace containing both the CLI and a new Minimalist GUI.

## 1. Objective

Develop a cross-platform desktop application (Windows/macOS/Linux) using **Tauri** and **React**. The GUI will prioritize a "Zen" user experienceâ€”clean, minimalist, and focusedâ€”inspired by the design languages of Jony Ive (Apple) and Ollama.

## 2. Design Philosophy

- **Aesthetic:** "Invisible Design." Extensive use of whitespace, system-native typography (San Francisco/Inter), and subtle borders. No clutter.
- **Interaction:**
  - **Linear Flow:** Select Repo -> Select Range -> Write Notes -> Generate.
  - **Visual Feedback:** Immediate preview of what will be sent to the AI.
- **Palette:** Monochrome (White/Slate/Black) with a single accent color for primary actions.

## 3. Architectural Restructuring (Rust Workspace)

To support both CLI and GUI without duplicating code, we must refactor the existing single-crate project into a Cargo Workspace.

### 3.1 New Directory Structure

```text
/ (Root)
├── Cargo.toml          (Workspace definition)
├── crates/
│   ├── gitscribe_core/   (Shared Logic: Git ops, Ollama client, file I/O)
│   └── gitscribe_cli/    (The existing CLI tool, now consuming 'core')
└── apps/
    └── context_gui/    (New Tauri Application)
```

### 3.2 Shared Library (`crates/gitscribe_core`)

- **Git Module:** `get_log`, `get_diff`, `list_tags`, `list_branches`.
- **Generator Module:** `assemble_context` (combines notes, logs, diffs).
- **AI Module:** `call_ollama`.

## 4. GUI Features & Layout

### 4.1 Main Window

- **Header (MenuBar):**
  - Left: Application Title (Minimal).
  - Right: "Open Repository" Button (Folder Icon).
- **Two-Column Layout:**
  - **Left Sidebar (Configuration):**
    - _Range Selection:_ Two clean dropdowns (Start / End Reference).
    - _AI Settings:_ Model Selector (e.g., `llama3`), System Prompt Picker.
    - _Adhoc Notes:_ A large, distraction-free text area for typing strategic context.
  - **Right Panel (Preview & Result):**
    - **Tab 1: Context Preview:** Read-only view of the generated Markdown (what the AI sees).
    - **Tab 2: Release Notes:** The final rendered output from Ollama.
- **Footer:**
  - Status Indicator (e.g., "Scanning repo...", "Generating...", "Done").
  - "Generate Release Notes" (Primary Action Button).

### 4.2 Interactive Flows

1.  **Repo Selection:** User clicks folder icon -> Native OS dialog opens -> User picks a folder.
    - _App Action:_ Validates it's a git repo, fetches tags/branches.
2.  **Live Context:** As user selects Start/End tags, the "Context Preview" tab updates (lazily/on-demand) to show the diff stats and commit log.
3.  **Generation:** User clicks "Generate". App shows a loading state (skeleton loader). AI streams response to the "Release Notes" tab.

## 5. Technology Stack

- **Core:** Rust (2021 Edition)
- **Frontend Framework:** React (Vite)
- **Styling:** Tailwind CSS (Utility-first, easy to maintain strict design tokens).
- **Components:** `shadcn/ui` (Radix Primitives) or custom minimal components to ensure accessibility and high-quality interactions.
- **Icons:** Lucide React.

## 6. Implementation Steps

### Phase 1: Workspace Refactor (Backend)

1.  Create `Cargo.toml` workspace at root.
2.  Extract logic from `rust-context-gen/src/main.rs` into `crates/gitscribe_core`.
3.  Rebuild `rust-context-gen` (renamed to `gitscribe_cli`) to use the new lib.
4.  Verify CLI functionality remains unchanged.

### Phase 2: Tauri Setup (Skeleton)

1.  Initialize Tauri app in `apps/context_gui`.
2.  Configure Tauri to allow local file access (for git repos) and HTTP (for Ollama).

### Phase 3: Frontend Implementation

1.  Setup React + Tailwind.
2.  Build the Layout Shell (Sidebar, Main Content).
3.  Implement "Repo Picker" calling Rust backend.
4.  Implement "Tag/Branch List" fetching.

### Phase 4: Core Features

1.  Wire up `generate_context` preview.
2.  Wire up `call_ollama` for final generation.
3.  Implement "Save to File" for the result.

## 7. Future Polish

- **Dark Mode:** Auto-detect system preference.
- **Streaming:** Stream Ollama response token-by-token for a "typing" effect.
