# GitHub Actions Setup Guide

## 🎉 Setup Complete!

Your Rust Tauri application now has a comprehensive CI/CD pipeline with GitHub Actions.

## 📋 What's Been Added

### Workflows (`.github/workflows/`)

1. **`ci.yml`** - Continuous Integration
   - Rust formatting, linting, and testing
   - Frontend TypeScript checks and builds
   - Tauri application builds on Linux, Windows, and macOS
   - Security audits with cargo-audit
   - Runs on every push and PR

2. **`release.yml`** - Automated Releases
   - Builds Tauri installers for all platforms
   - Compiles CLI binaries for multiple architectures
   - Creates GitHub releases
   - Optional crates.io publishing
   - Triggered by version tags (v*.*.*)

3. **`playwright.yml`** - E2E Testing
   - Runs Playwright tests across platforms
   - Uploads test reports and screenshots
   - Runs when frontend code changes

4. **`coverage.yml`** - Code Coverage
   - Generates Rust code coverage reports
   - Uploads to Codecov (optional)
   - Tracks test coverage over time

5. **`dependency-update.yml`** - Dependency Management
   - Weekly automated dependency updates
   - Creates PRs for Rust and NPM updates
   - Runs basic checks before proposing updates

6. **`lint-pr.yml`** - PR Quality Checks
   - Validates PR titles (Conventional Commits)
   - Checks commit message format
   - Warns on large PRs

### Configuration Files

- **`dependabot.yml`** - Automated dependency updates via Dependabot
- **`.commitlintrc.json`** - Commit message validation rules
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`PULL_REQUEST_TEMPLATE.md`** - PR template
- **`ISSUE_TEMPLATE/`** - Issue templates for bugs and features

## 🚀 Quick Start

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. Verify in:
- Repository → Settings → Actions → General
- Set "Workflow permissions" to "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

### 2. Configure Secrets (Optional)

Add these in: Repository → Settings → Secrets and variables → Actions

#### For Releases to crates.io:
```
CARGO_TOKEN = <your-crates-io-token>
```
Get token from: https://crates.io/settings/tokens

#### For Code Coverage:
```
CODECOV_TOKEN = <your-codecov-token>
```
Get token from: https://codecov.io/ after connecting your repo

### 3. Update Configuration

**In `dependabot.yml`**, replace `octocat` with your GitHub username:
```yaml
reviewers:
  - "YOUR_USERNAME"  # Update this
```

**In issue template `config.yml`**, update URLs:
```yaml
url: https://github.com/YOUR_USERNAME/YOUR_REPO/discussions
url: https://github.com/YOUR_USERNAME/YOUR_REPO#readme
```

### 4. Test the Workflows

**Option A: Create a test branch**
```bash
git checkout -b test/ci-setup
git add .github/
git commit -m "ci: add GitHub Actions workflows"
git push origin test/ci-setup
```
Then create a PR to trigger all checks.

**Option B: Manual trigger**
- Go to Actions tab in GitHub
- Select "Dependency Updates" workflow
- Click "Run workflow"

### 5. Create Your First Release

```bash
# Update version in Cargo.toml files
# Commit changes
git add .
git commit -m "chore: bump version to v0.1.0"

# Tag the release
git tag v0.1.0
git push origin main --tags
```

This will trigger the release workflow and create installers!

## 📊 Monitoring

### Check Workflow Status
- Visit: `https://github.com/USERNAME/REPO/actions`
- View running and completed workflows
- Click on any workflow for detailed logs

### Add Status Badges

Add to your `README.md`:

```markdown
![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/USERNAME/REPO/actions/workflows/release.yml/badge.svg)
```

Replace `USERNAME` and `REPO` with your values.

## 🔧 Customization

### Adjust CI Triggers

Edit workflow files to change when they run:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]  # Add more branches
    paths:
      - 'apps/**'  # Only run on specific paths
```

### Modify Build Targets

In `release.yml`, add or remove platforms:

```yaml
strategy:
  matrix:
    platform: [ubuntu-22.04, windows-latest, macos-latest]
    # Add: ubuntu-20.04, windows-2019, etc.
```

### Change Test Requirements

In branch protection rules (Settings → Branches):
- Require specific checks before merging
- Require review from code owners
- Enable/disable force pushes

## 🏗️ Local Development

### Run Checks Locally

Before pushing:

```bash
# Rust checks
cargo fmt --all -- --check
cargo clippy --workspace -- -D warnings
cargo test --workspace

# Frontend checks
cd apps/gitscribe
npm run build
npm run test:e2e

# Build Tauri app
npm run tauri build
```

### Test with Act (Optional)

Run GitHub Actions locally:

```bash
# Install act: https://github.com/nektos/act
brew install act  # macOS
choco install act  # Windows

# Run CI workflow
act pull_request

# Run specific job
act -j rust-check
```

## 📦 Release Process

### Semantic Versioning

Follow [semver](https://semver.org/):
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features)
- `v1.1.1` - Patch release (bug fixes)

### Release Checklist

1. Update version in `Cargo.toml` files
2. Update `CHANGELOG.md` (if you have one)
3. Commit: `git commit -m "chore: bump version to vX.Y.Z"`
4. Tag: `git tag vX.Y.Z`
5. Push: `git push origin main --tags`
6. Monitor Actions tab for build progress
7. Edit release notes in GitHub once complete

## 🐛 Troubleshooting

### "Workflow not found" Error
- Ensure workflow files are in `.github/workflows/`
- Check YAML syntax (no tabs, correct indentation)
- Push to GitHub and wait 1-2 minutes

### CI Fails on Windows
- Check for line ending issues (CRLF vs LF)
- Use `.gitattributes` to normalize line endings
- Windows paths use backslashes

### E2E Tests Fail
- Ensure Playwright is installed: `cd apps/gitscribe && npx playwright install`
- Check if app builds successfully first
- Review test logs in Actions tab

### Release Build Fails
- Verify all dependencies are installed
- Check platform-specific requirements (WebView2, etc.)
- Test build locally first

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tauri v2 Guide](https://v2.tauri.app/start/)
- [Rust CI Best Practices](https://github.com/actions-rs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🎯 Next Steps

1. ✅ Push changes to GitHub
2. ✅ Create a test PR to verify CI
3. ✅ Set up branch protection rules
4. ✅ Add status badges to README
5. ✅ Create your first release
6. ✅ Set up Dependabot reviewers
7. ✅ Configure secrets (optional)

## 💡 Tips

- Start small: Ensure CI works before enabling all workflows
- Monitor Actions usage (2000 free minutes/month)
- Use caching to speed up builds
- Review Dependabot PRs promptly
- Keep workflows maintainable and documented

## 🤝 Contributing

See `CONTRIBUTING.md` for detailed contribution guidelines.

---

**Questions?** Open an issue or discussion on GitHub!

**Happy Building! 🚀**
