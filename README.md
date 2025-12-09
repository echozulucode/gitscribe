# GitScribe

**GitScribe** is an intelligent release notes generator that bridges the gap between raw git history and customer-facing communication. It aggregates commit logs, code diffs, and strategic user notes, then leverages local AI (Ollama) to draft professional, structured release notes.

Available as a modern Desktop GUI and a high-performance CLI tool.

## 🚀 Features

- **Automated Context Aggregation:** Intelligently combines git history and diffs while excluding noise (lockfiles, assets).
- **AI-Powered Generation:** Connects directly to local LLMs (via Ollama) to write the notes for you.
- **Strategic Input:** Prioritizes your "Adhoc Notes" to ensure the narrative matches your product goals.
- **Jira Integration:** (Optional) Enriches context by fetching details (summaries, descriptions, comments) from linked Jira tickets found in commit messages.
- **Cross-Platform:** Runs on Windows, macOS, and Linux.

## 📦 Components

This repository is organized as a Rust Workspace containing:

1.  **Desktop App (`apps/gitscribe`):** A Tauri + React application for a visual, interactive workflow.
2.  **CLI Tool (`crates/gitscribe_cli`):** A binary for command-line usage and CI/CD automation.
3.  **Core Library (`crates/gitscribe_core`):** Shared logic for git operations, Jira fetching, and AI integration.

## 🛠️ Development & Setup

Follow these steps to get started after cloning the repository.

### Prerequisites
*   **Rust:** [Install Rust](https://www.rust-lang.org/tools/install) (latest stable).
*   **Node.js:** [Install Node.js](https://nodejs.org/) (v18+ recommended).
*   **Ollama:** [Install Ollama](https://ollama.com/) and ensure it is running (`ollama serve`).

### 1. Build the CLI

The CLI is a pure Rust binary. You can build it from the project root.

```bash
# Debug Build (Faster compilation)
cargo build -p gitscribe_cli

# Run Development Version
cargo run -p gitscribe_cli -- --help

# Production Build (Optimized)
cargo build --release -p gitscribe_cli
# Binary location: ./target/release/gitscribe_cli.exe (Windows) or ./target/release/gitscribe_cli (Unix)
```

### 2. Build the Desktop App (Tauri)

The Desktop App uses Tauri (Rust) for the backend and React/Vite (TypeScript) for the frontend.

```bash
# Navigate to the app directory
cd apps/gitscribe

# Install frontend dependencies
npm install

# Run in Development Mode (Hot Reloading)
# This starts the Vite dev server and the Tauri window simultaneously
npm run tauri dev

# Build for Production
# This creates the installer/bundle for your OS
npm run tauri build
```

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md):** Detailed instructions for GUI and CLI usage.
- **[Feature Specifications](docs/features/):** BDD feature files describing system behavior.
- **[Architecture Plans](docs/ai/):** High-level design and implementation notes.

## 🤝 Contributing

This project uses a **Docs-as-Code** approach.
- Feature requirements are defined in `docs/features/*.feature`.
- Please run tests before submitting PRs: `npm test` (Frontend) and `cargo test` (Backend).

## 📄 License

[MIT License](LICENSE)
