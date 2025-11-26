# Implementation Plan - Part 1: Context Generator Script

This plan details the development of the Python script required to generate the `release_context.md` file, as outlined in `plan-001-high-level.md`.

## 1. Objective
Develop a CLI tool (`generate_context.py`) that aggregates git history, diffs, and user notes into a single Markdown file suitable for AI processing.

## 2. Technical Requirements
- **Language:** Python 3.x
- **Dependencies:** Standard library (`argparse`, `subprocess`, `os`, `sys`). No external pip packages required to keep it lightweight.
- **VCS:** Git (must be installed and accessible in PATH).

## 3. Script Architecture (`src/generate_context.py`)

### 3.1. Inputs (CLI Arguments)
- `--start`: Start Commit Hash (required).
- `--end`: End Commit Hash (required).
- `--notes`: Path to Adhoc Notes Markdown file (optional, defaults to none).
- `--output`: Output filename (optional, defaults to `release_context.md`).

### 3.2. Core Functions
1.  **`read_notes(file_path)`**: Reads the content of the adhoc notes file. Returns a placeholder message if the file doesn't exist or isn't provided.
2.  **`get_git_log(start, end)`**: Executes `git log --pretty=format:"- %s" start..end`.
3.  **`get_git_diff(start, end)`**: Executes `git diff start..end`.
    - **Filtering:** Must implement exclusion logic for lock files and binary assets (e.g., `package-lock.json`, `yarn.lock`, `*.png`, `*.jpg`, `*.pyc`).
4.  **`write_output(content, output_file)`**: Writes the aggregated string to the target file.

### 3.3. Output Structure (`release_context.md`)
```markdown
# Release Context

## Strategic Context / Adhoc Notes
[Content from --notes file]

## Commit History
[Output from git log]

## Code Changes
```diff
[Output from git diff]
```
```

## 4. Implementation Steps

### Step 1: Project Structure Setup
- Create `src/` directory.
- Create empty `src/__init__.py`.
- Create `src/generate_context.py`.

### Step 2: Argument Parsing & Skeleton
- Implement `argparse` to handle `--start`, `--end`, `--notes`, and `--output`.
- Add basic validation (check if git is installed).

### Step 3: Git Operations
- Implement `subprocess` calls for `git log` and `git diff`.
- Hardcode the exclusion list initially:
    - `package-lock.json`
    - `yarn.lock`
    - `*.png`
    - `*.jpg`
    - `*.svg`
    - `__pycache__`

### Step 4: File Assembly
- Combine strings in the defined order.
- Ensure the diff output is wrapped in triple backticks.

### Step 5: Testing
- Verify against the current repository's history.
- Example run: `python src/generate_context.py --start HEAD~5 --end HEAD`

## 5. Future Improvements (Out of Scope for MVP)
- Configurable ignore patterns via a `.contextignore` file.
- Support for multiple repositories.
