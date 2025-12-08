# GitHub Actions - Quick Reference

## 🎯 The Essentials

This repository uses **2 simple workflows** that cover everything you need:

### 1. **CI Workflow** (`ci.yml`)
**When:** Every push and pull request  
**What:** Tests your code and builds the app  
**Time:** ~5-10 minutes

```bash
✓ Format check (cargo fmt)
✓ Lint check (cargo clippy)  
✓ Run tests (cargo test)
✓ Security audit (cargo audit)
✓ Build Tauri app on Linux, Windows, macOS
```

### 2. **Release Workflow** (`release.yml`)
**When:** You push a version tag (v1.0.0)  
**What:** Builds installers and creates a GitHub release  
**Time:** ~15-20 minutes

```bash
✓ Build .deb and .AppImage (Linux)
✓ Build .msi (Windows)
✓ Build .dmg (macOS)
✓ Create draft release with all installers
```

## 🚀 Usage

### Testing your code
```bash
git add .
git commit -m "feat: add new feature"
git push
# CI workflow runs automatically
```

### Creating a release
```bash
git tag v1.0.0
git push --tags
# Release workflow builds installers
# Check GitHub Releases for draft release
```

## 📊 Monitoring

- **View workflow runs:** `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Download artifacts:** Available on each CI run for testing
- **Release drafts:** Edit and publish in the Releases section

## 📁 Additional Files

- **`dependabot.yml`** - Auto-updates dependencies weekly
- **`CONTRIBUTING.md`** - How to contribute
- **`PULL_REQUEST_TEMPLATE.md`** - Standard PR format
- **`ISSUE_TEMPLATE/`** - Bug and feature request templates

## ❓ Why So Simple?

Many projects add workflows for coverage, E2E tests, PR linting, etc. But:
- **You can add those later** when you actually need them
- **Simpler = easier to maintain** and understand
- **These 2 workflows cover 90% of needs** for most Rust/Tauri projects

## 🔧 Need More?

Check out these optional additions:
- **Code Coverage:** `cargo-llvm-cov` + Codecov
- **E2E Tests:** Playwright workflow
- **PR Linting:** Conventional Commits validation
- **Scheduled Tests:** Nightly builds

See `workflows/README.md` for detailed documentation.

---

**Need help?** Open an issue or check `SETUP.md` for the full setup guide.
