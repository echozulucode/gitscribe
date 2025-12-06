# Implementation Plan - Part 2: Workflow Integration

This plan expands the project to support two distinct workflows for consuming the generated context:
1.  **Manual Workflow:** Generating a single, concatenated "Prompt + Context" file for easy copy-pasting into any AI interface (ChatGPT, Claude, etc.).
2.  **Automated Workflow (Ollama):** Directly integrating with a local Ollama instance to generate release notes automatically.

## 1. Feature: Combined Prompt Generation (Manual Mode)

### Objective
Eliminate the need for the user to manually open the prompt file, copy it, open the context file, copy it, and paste them together.

### Technical Approach
- **New Argument:** Add `--system-prompt <PATH>` (or `-p`).
- **Logic:**
    1. If `--system-prompt` is provided, read the file content.
    2. Prepend this content to the generated Context string.
    3. Write the combined result to `--output`.
- **Default Behavior:** If not provided, behavior remains unchanged (outputs context only).

### Output Format
```markdown
[Content of --system-prompt]

---
**Data to Process:**

[Generated Release Context]
```

## 2. Feature: Ollama Integration (Auto Mode)

### Objective
Allow the user to generate finished release notes locally using an Ollama model (e.g., `llama3`, `mistral`) without leaving the CLI.

### Technical Approach
- **New Arguments:**
    - `--ollama-model <MODEL_NAME>`: Triggers the auto-generation mode (e.g., `llama3.2`).
    - `--ollama-url <URL>`: Optional, defaults to `http://localhost:11434/api/generate`.
- **Logic:**
    1. Generate the full context (including the system prompt if provided).
    2. Construct a JSON payload for the Ollama API.
    3. Send a POST request.
    4. Stream the response to a new file (e.g., `release_notes.md`) and/or stdout.

### Dependencies
- **Python:** Use standard `urllib` (keep it dependency-free).
- **Rust:** Add `reqwest` (blocking) and `serde_json`.

## 3. CLI Experience Design

The user will select the mode based on flags.

**Scenario A: Manual Copy-Paste**
```bash
# Generates 'full_prompt.md' containing instructions + data
python generate_context.py \
  --start HEAD~5 --end HEAD \
  --system-prompt docs/ai/release-notes-prompt.md \
  --output full_prompt.md
```

**Scenario B: Auto-Generate with Ollama**
```bash
# Generates 'release_notes.md' directly using Llama 3
python generate_context.py \
  --start HEAD~5 --end HEAD \
  --system-prompt docs/ai/release-notes-prompt.md \
  --ollama-model llama3 \
  --output release_notes.md
```

## 4. Implementation Tasks

### Task 4.1: Update Python Script (`src/generate_context.py`)
- [ ] Add `--system-prompt`, `--ollama-model`, `--ollama-url` arguments.
- [ ] Implement file concatenation logic.
- [ ] Implement `urllib` POST request to Ollama.
- [ ] Handle streaming response from Ollama.

### Task 4.2: Update Rust Crate (`rust-context-gen`)
- [ ] Add `reqwest` and `serde` to `Cargo.toml`.
- [ ] Update `Args` struct.
- [ ] Implement the HTTP client logic.

## 5. Future Considerations (MCP)
*Note: The user mentioned acting as an "MCP client". Currently, Ollama exposes a REST API. If the requirement shifts to strictly using the [Model Context Protocol](https://modelcontextprotocol.io), we would need to implement an MCP Host that connects to an MCP Server wrapping Ollama. For now, direct API integration is the most efficient path for a CLI tool.*
