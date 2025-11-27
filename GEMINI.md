# GEMINI Context: Git Release Context Generator

## Project Overview
This project contains tools designed to aggregate git history, code diffs, and strategic notes into a single, structured Markdown file (`release_context.md`). This output is specifically formatted to be consumed by Large Language Models (LLMs) to generate high-quality, customer-facing release notes.

There are two functionally identical implementations of the tool in this repository:
1.  **Python:** A lightweight script (`src/generate_context.py`).
2.  **Rust:** A compiled binary (`rust-context-gen/`).

## Directory Structure
*   `src/`: Contains the Python implementation.
*   `rust-context-gen/`: Contains the Rust Cargo project.
*   `docs/`: Documentation and high-level plans (including the target AI prompt in `docs/ai/plan-001-high-level.md`).
*   `release_context.md`: (Generated) The output file containing aggregated context.

## Building and Running

### Python Version
*   **Prerequisites:** Python 3.x, Git.
*   **Run:**
    ```bash
    python src/generate_context.py --start <START_HASH> --end <END_HASH> [--notes <PATH_TO_NOTES>]
    ```

### Rust Version
*   **Prerequisites:** Rust, Cargo, Git.
*   **Build:**
    ```bash
    cd rust-context-gen
    cargo build --release
    ```
*   **Run:**
    ```bash
    ./rust-context-gen/target/release/rust-context-gen --start <START_HASH> --end <END_HASH> [--notes <PATH_TO_NOTES>]
    ```

## Key Conventions & Implementation Details

### Core Logic
Both implementations follow the same logic to ensure parity:
1.  **Input:** Takes start/end git hashes and an optional user notes file.
2.  **Log:** Runs `git log --pretty=format:"- %s"`.
3.  **Diff:** Runs `git diff` with strict path exclusions.
4.  **Output:** Combines these into a Markdown file with specific headers.

### Ignore Patterns
The tools are hardcoded to exclude "noise" files from the diff to prevent context window bloat:
*   Lockfiles (`package-lock.json`, `yarn.lock`)
*   Images (`*.png`, `*.jpg`, `*.svg`, etc.)
*   Python artifacts (`__pycache__`, `*.pyc`)
*   Node modules & Git internals

### Dependencies
*   **Python:** Uses only standard library (`argparse`, `subprocess`, `sys`, `os`).
*   **Rust:** Uses `clap` (v4.5.3) for argument parsing and `anyhow` (v1.0.100) for error handling.
