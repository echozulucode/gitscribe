# GitHub Actions Workflows

This directory contains CI/CD workflows for the Git Release Context Generator project.

## Workflows Overview

### 🔍 CI (`ci.yml`)
**Trigger:** Push to `main`/`develop`, Pull Requests

The main workflow that runs on every push and PR:
- **Test Job**: Runs on Linux, Windows, and macOS
  - Checks Rust formatting (`cargo fmt`)
  - Runs Clippy lints (`cargo clippy`)
  - Runs all tests (`cargo test`)
  - Security audit with `cargo-audit` (Ubuntu only)
- **Tauri Job**: Builds the full Tauri app on all platforms
  - Installs platform-specific dependencies
  - Builds complete installers
  - Uploads artifacts for download

**Key Features:**
- Multi-platform testing for reliability
- Rust caching for fast builds (typically 2-5 minutes)
- Parallel execution of tests and builds
- Artifact uploads for testing installers before release

### 🚀 Release (`release.yml`)
**Trigger:** Git tags matching `v*.*.*` (e.g., v1.0.0)

Automated release process:
- Builds Tauri installers for all platforms
- Creates a draft GitHub release
- Uploads installers automatically

**Generated Artifacts:**
- Linux: `.deb` package, `.AppImage`
- Windows: `.msi` installer
- macOS: `.dmg` disk image

**Usage:**
```bash
git tag v1.0.0
git push --tags
```
The workflow runs automatically and creates a draft release for you to review and publish.

## Dependabot (`dependabot.yml`)

Automated dependency updates via GitHub Dependabot:
- Rust workspace dependencies
- Tauri-specific Rust dependencies
- NPM dependencies
- GitHub Actions versions

**Schedule:** Weekly on Mondays
**Configuration:** Update reviewer usernames in the file

## Setup Instructions

### Optional Configuration

No secrets are required for basic CI/CD functionality. The workflows work out of the box!

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
