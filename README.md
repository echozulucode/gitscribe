# Git Release Context Generator

A CLI tool designed to aggregate git history, code diffs, and strategic user notes into a single, structured Markdown file (`release_context.md`). This output is optimized for consumption by AI models (LLMs) to generate high-quality, customer-facing release notes.

## Features

- **Commit Logs:** Extracts clean commit messages between two git references.
- **Smart Diffs:** Includes code changes while automatically excluding "noise" files (lockfiles, binaries, assets).
- **Adhoc Notes:** Injects high-level strategic context or marketing points provided by the user.
- **AI-Ready:** Formats output with clear headers and code blocks for optimal LLM processing.

## Implementations

This repository contains two implementations of the tool:
1. **Python** (Script-based, no compilation needed)
2. **Rust** (Compiled binary, high performance)

---

### 🐍 Python Version

#### Prerequisites
- Python 3.x
- Git installed and in PATH

#### Usage
Run the script directly from the project root:

```bash
python src/generate_context.py --start <START_HASH> --end <END_HASH> [OPTIONS]
```

**Example:**
```bash
python src/generate_context.py --start HEAD~5 --end HEAD --notes docs/strategic-notes.md
```

---

### 🦀 Rust Version

#### Prerequisites
- Rust & Cargo (latest stable)
- Git installed and in PATH

#### Build & Run

1. **Build the release binary:**
   ```bash
   cd rust-context-gen
   cargo build --release
   cd ..
   ```

2. **Run the binary:**
   ```bash
   ./rust-context-gen/target/release/rust-context-gen --start <START_HASH> --end <END_HASH> [OPTIONS]
   ```

### Advanced Features (Rust Only)

The Rust implementation supports direct integration with AI workflows.

#### 1. Manual Prompt Injection
Automatically prepend a system prompt (e.g., your "Role" and "Instructions") to the generated context. This creates a single file ready to copy-paste into ChatGPT or Claude.

```bash
./rust-context-gen ... --system-prompt docs/ai/release-notes-prompt.md --output full_prompt.md
```

#### 2. Ollama Integration (Auto-Generate)
Directly generate release notes using a local Ollama instance.

```bash
./rust-context-gen ... --ollama-model llama3 --system-prompt docs/ai/release-notes-prompt.md --output release_notes.md
```

---

## CLI Arguments

| Argument | Required | Description | Default | Supported In |
|----------|:--------:|-------------|---------|:------------:|
| `--start` | Yes | Starting commit hash (exclusive). | - | Both |
| `--end` | Yes | Ending commit hash (inclusive). | - | Both |
| `--notes` | No | Path to adhoc notes file. | None | Both |
| `--output` | No | Output filename. | `release_context.md` | Both |
| `--system-prompt` | No | Prepend a prompt file to the context. | None | **Rust** |
| `--ollama-model` | No | Trigger auto-generation using this model name. | None | **Rust** |
| `--ollama-url` | No | Custom Ollama API URL. | `http://localhost:11434...` | **Rust** |

## Output Format

The generated file follows this structure:

```markdown
# Release Context

## Strategic Context / Adhoc Notes
(Content from your notes file)

## Commit History
- feat: added new login screen
- fix: resolved database deadlock

## Code Changes
```diff
diff --git a/src/main.rs b/src/main.rs
...
```
```
