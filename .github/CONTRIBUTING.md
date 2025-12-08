# Contributing to Git Release Context Generator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/git-revision-history.git`
3. Add upstream remote: `git remote add upstream https://github.com/ORIGINAL_OWNER/git-revision-history.git`

## Development Setup

### Prerequisites
- Rust (latest stable) - Install from [rustup.rs](https://rustup.rs/)
- Node.js 20+ - For Tauri frontend
- Git

### Rust Workspace Setup
```bash
# Install dependencies and build
cargo build --workspace

# Run tests
cargo test --workspace

# Run clippy
cargo clippy --workspace -- -D warnings

# Format code
cargo fmt --all
```

### Tauri App Setup
```bash
cd apps/gitscribe

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build the app
npm run tauri build
```

### CLI Tool Setup
```bash
# Build the CLI
cargo build --package context_cli --release

# Run the CLI
./target/release/context_cli --help
```

## Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Write or update tests
4. Ensure all tests pass
5. Run linters and formatters
6. Commit with a descriptive message

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test updates
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

**Examples:**
```
feat(cli): add --verbose flag for detailed output
fix(core): resolve panic when parsing invalid git refs
docs: update installation instructions
```

## Testing

### Rust Tests
```bash
# Run all workspace tests
cargo test --workspace

# Run tests for specific crate
cargo test --package context_core

# Run tests with output
cargo test --workspace -- --nocapture
```

### Frontend Tests
```bash
cd apps/gitscribe

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### Integration Tests
```bash
# Test the full build pipeline
cargo build --workspace --release
cd apps/gitscribe && npm run tauri build
```

## Submitting Changes

1. Push your changes to your fork
2. Create a Pull Request against the `main` branch
3. Fill out the PR template completely
4. Wait for review and address any feedback
5. Once approved, your PR will be merged

### PR Checklist
- [ ] Tests pass locally
- [ ] Code is formatted (`cargo fmt`, `npm run format`)
- [ ] Lints pass (`cargo clippy`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

## Code Style

### Rust
- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `cargo fmt` for formatting
- Address all `cargo clippy` warnings
- Write documentation comments for public APIs
- Keep functions focused and small

### TypeScript/React
- Use TypeScript for all new code
- Follow React best practices
- Use functional components and hooks
- Keep components small and focused

### General
- Write clear, descriptive variable names
- Comment complex logic
- Keep lines under 100 characters when reasonable
- Write self-documenting code

## Project Structure

```
.
├── apps/
│   └── gitscribe/          # Tauri application
│       ├── src/            # React frontend
│       └── src-tauri/      # Rust backend
├── crates/
│   ├── context_core/       # Core library
│   └── context_cli/        # CLI tool
└── src/                    # Legacy Python implementation
```

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues and PRs first

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing! 🎉
