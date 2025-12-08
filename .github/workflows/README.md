# GitHub Actions Workflows

This directory contains CI/CD workflows for the Git Release Context Generator project.

## Workflows Overview

### 🔍 CI (`ci.yml`)
**Trigger:** Push to `main`/`develop`, Pull Requests

Runs on every push and PR to ensure code quality:
- **Rust Check & Test**: Runs formatting, clippy, tests, and builds on Linux, Windows, and macOS
- **Frontend Check**: TypeScript checks and frontend builds
- **Tauri Build Test**: Full Tauri application builds on all platforms
- **Security Audit**: Checks for known vulnerabilities in dependencies

**Key Features:**
- Multi-platform testing (Ubuntu, Windows, macOS)
- Rust caching for faster builds
- Artifact uploads for inspection
- Parallel job execution for speed

### 🚀 Release (`release.yml`)
**Trigger:** Git tags matching `v*.*.*`, Manual workflow dispatch

Automated release process:
- Creates GitHub releases
- Builds Tauri apps for all platforms (DMG, MSI, DEB, AppImage)
- Compiles CLI binaries for multiple architectures
- Publishes crates to crates.io (when configured)

**Artifacts:**
- Linux: `.deb`, `.AppImage`
- Windows: `.msi`, `.exe`
- macOS: `.dmg`, `.app` (Intel + Apple Silicon)
- CLI binaries for Linux, Windows, macOS (x64 + ARM)

**Configuration Needed:**
- Set `CARGO_TOKEN` secret for crates.io publishing

### 🎭 Playwright E2E (`playwright.yml`)
**Trigger:** Push/PR to `main`/`develop` affecting `apps/gitscribe/**`

End-to-end testing:
- Runs Playwright tests on Linux, Windows, and macOS
- Tests the complete Tauri application
- Uploads test reports and screenshots on failure

### 📦 Dependency Updates (`dependency-update.yml`)
**Trigger:** Weekly on Mondays at 9 AM UTC, Manual

Automated dependency management:
- Updates Rust dependencies (`cargo update`)
- Updates NPM dependencies (`npm update`)
- Creates PRs for review
- Runs basic checks to ensure updates don't break builds

### 📊 Code Coverage (`coverage.yml`)
**Trigger:** Push to `main`, Pull Requests

Generates code coverage reports:
- Uses `cargo-llvm-cov` for Rust coverage
- Uploads to Codecov (requires `CODECOV_TOKEN`)
- Provides coverage artifacts

### ✅ Lint PR (`lint-pr.yml`)
**Trigger:** Pull Request events

Ensures PR quality:
- Validates PR title follows Conventional Commits
- Checks commit message format
- Warns on large PRs (>500 lines)
- Fails on very large PRs (>1000 lines)

## Dependabot (`dependabot.yml`)

Automated dependency updates via GitHub Dependabot:
- Rust workspace dependencies
- Tauri-specific Rust dependencies
- NPM dependencies
- GitHub Actions versions

**Schedule:** Weekly on Mondays
**Configuration:** Update reviewer usernames in the file

## Setup Instructions

### Required Secrets

Add these secrets in GitHub repository settings:

1. **For Releases:**
   - `CARGO_TOKEN`: Token from crates.io for publishing Rust crates
   
2. **For Coverage:**
   - `CODECOV_TOKEN`: Token from codecov.io (optional)

### Repository Settings

1. **Branch Protection** (recommended):
   - Require PR reviews before merging
   - Require status checks: `Rust Check & Test`, `Frontend Check`
   - Require branches to be up to date

2. **Actions Permissions**:
   - Allow read and write permissions for workflows
   - Allow GitHub Actions to create PRs (for dependency updates)

### Customization

1. **Update Dependabot Reviewers:**
   - Edit `.github/dependabot.yml`
   - Replace `octocat` with your GitHub username

2. **Modify CI Triggers:**
   - Edit workflow files to change branches or paths

3. **Adjust Test Timeouts:**
   - Edit `timeout-minutes` in workflow jobs as needed

## Badge Integration

Add these badges to your README.md:

```markdown
[![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
[![Release](https://github.com/USERNAME/REPO/actions/workflows/release.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/release.yml)
[![Codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

## Best Practices

1. **Local Testing First:**
   - Run `cargo test --workspace` before pushing
   - Run `cargo clippy --workspace` to catch issues early
   - Format code with `cargo fmt --all`

2. **PR Workflow:**
   - Keep PRs focused and small
   - Ensure all CI checks pass
   - Write clear PR descriptions

3. **Releases:**
   - Follow semantic versioning (v1.2.3)
   - Update version numbers in Cargo.toml files
   - Tag releases: `git tag v1.2.3 && git push --tags`

## Troubleshooting

### CI Failures

**Rust Tests Fail:**
- Check logs for specific test failures
- Run tests locally: `cargo test --workspace`
- Ensure all platforms are tested if changes are platform-specific

**Clippy Warnings:**
- Run `cargo clippy --workspace -- -D warnings` locally
- Fix all warnings before pushing

**Build Failures:**
- Check for missing dependencies
- Verify Cargo.lock is committed
- Ensure workspace dependencies are correctly specified

### Release Issues

**Tauri Build Fails:**
- Verify all platform-specific dependencies are installed
- Check Tauri configuration in `src-tauri/tauri.conf.json`
- Test build locally before releasing

**Publishing to crates.io Fails:**
- Ensure `CARGO_TOKEN` is set correctly
- Verify crate names are available
- Check dependency versions are published

## Contributing

When adding new workflows:
1. Test locally with [act](https://github.com/nektos/act) if possible
2. Start with small, focused workflows
3. Document triggers and purposes
4. Add appropriate caching
5. Update this README

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tauri CI/CD Guide](https://tauri.app/v1/guides/building/cross-platform/)
- [Rust CI Best Practices](https://matklad.github.io/2021/09/04/fast-rust-builds.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
