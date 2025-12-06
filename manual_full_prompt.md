# Role

You are an expert Technical Product Manager and Strategic Communications Lead. Your goal is to draft clean, professional, and transparent release notes that balance user engagement with risk management. You are writing for a mixed audience of end-users and DevOps/System Administrators.

# Input Data

I will provide you with a single Markdown document containing three sections:

1. **Adhoc Notes:** Strategic context, marketing highlights, and specific instructions.
2. **Commit Logs:** A list of git commit messages.
3. **The Diff:** The raw code changes between two versions.

# Instructions

Analyze the provided input and generate a release notes summary. You must adhere to the following rules based on industry best practices:

1.  **Filter Internal Noise:** Ignore changes related to CI/CD pipelines, build configurations, refactoring, or "chore" commits unless they strictly impact performance/security.
2.  **Translate to "User Benefit":** Do not describe *what* changed in the code; describe *why* it matters.
    - *Bad:* "Fixed bug #402."
    - *Good:* "Fixed a crash that occurred when exporting large PDF files." (Focus on the symptom, not the code).
3.  **Prioritize Adhoc Notes:** Strategic context takes precedence. Use the diffs to validate and flesh out these high-level points.
4.  **Security & Risk:**
    - Identify any security fixes. If a CVE is mentioned, use the format `[CVE-YYYY-XXXX]`.
    - Highlight any **Breaking Changes** or **Deprecations** clearly.
5.  **Categorization:** Group notes into the headers defined below.
6.  **Tone:** Professional, objective, and concise. Avoid humor or excessive marketing fluff, especially in security/bug sections.

# Output Format

Please output the release notes in the following Markdown structure:

## [Release Version/Date]

**Severity:** [Critical/High/Medium/Low] (Infer based on the presence of security fixes or breaking changes)

### Executive Summary

(A 2-3 sentence narrative summary of the main theme and value of this release).

### New Features

- **[Feature Name]:** [Description of value]

### Improvements

- **[Improvement]:** [Description]

### Bug Fixes

- [Description of fix] (Issue #ID if available)

### Security Advisories

- [List vulnerabilities or "None" if applicable]

### Deprecations & Breaking Changes

- [List breaking changes or "None" if applicable]

### Downloads & Checksums

**Export Control Notice:** This software is subject to U.S. EAR. Diversion contrary to U.S. law is prohibited.

- **Source Code:** [Link to tag]

---

# Output Instruction

Save the generated release notes to a new file named `release_notes_v2.md` in the same directory as the input file.


---
**Data to Process:**

# Release Context

## Strategic Context / Adhoc Notes
No adhoc notes provided.

## Commit History
- added release notes best practices
- added initial rust application
- feat: add context generator script and plan

## Code Changes
```diff
diff --git a/.gitignore b/.gitignore
new file mode 100644
index 0000000..0e0041b
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,25 @@
+# Python
+__pycache__/
+*.pyc
+*.pyo
+*.pyd
+.Python
+env/
+venv/
+.env
+.venv
+pip-log.txt
+pip-delete-this-directory.txt
+
+# Rust
+target/
+**/*.rs.bk
+
+# OS Specific
+.DS_Store
+Thumbs.db
+
+# Generated Content
+release_context.md
+rust_release_context.md
+examples/
\ No newline at end of file
diff --git a/GEMINI.md b/GEMINI.md
new file mode 100644
index 0000000..46fd328
--- /dev/null
+++ b/GEMINI.md
@@ -0,0 +1,55 @@
+# GEMINI Context: Git Release Context Generator
+
+## Project Overview
+This project contains tools designed to aggregate git history, code diffs, and strategic notes into a single, structured Markdown file (`release_context.md`). This output is specifically formatted to be consumed by Large Language Models (LLMs) to generate high-quality, customer-facing release notes.
+
+There are two functionally identical implementations of the tool in this repository:
+1.  **Python:** A lightweight script (`src/generate_context.py`).
+2.  **Rust:** A compiled binary (`rust-context-gen/`).
+
+## Directory Structure
+*   `src/`: Contains the Python implementation.
+*   `rust-context-gen/`: Contains the Rust Cargo project.
+*   `docs/`: Documentation and high-level plans (including the target AI prompt in `docs/ai/plan-001-high-level.md`).
+*   `release_context.md`: (Generated) The output file containing aggregated context.
+
+## Building and Running
+
+### Python Version
+*   **Prerequisites:** Python 3.x, Git.
+*   **Run:**
+    ```bash
+    python src/generate_context.py --start <START_HASH> --end <END_HASH> [--notes <PATH_TO_NOTES>]
+    ```
+
+### Rust Version
+*   **Prerequisites:** Rust, Cargo, Git.
+*   **Build:**
+    ```bash
+    cd rust-context-gen
+    cargo build --release
+    ```
+*   **Run:**
+    ```bash
+    ./rust-context-gen/target/release/rust-context-gen --start <START_HASH> --end <END_HASH> [--notes <PATH_TO_NOTES>]
+    ```
+
+## Key Conventions & Implementation Details
+
+### Core Logic
+Both implementations follow the same logic to ensure parity:
+1.  **Input:** Takes start/end git hashes and an optional user notes file.
+2.  **Log:** Runs `git log --pretty=format:"- %s"`.
+3.  **Diff:** Runs `git diff` with strict path exclusions.
+4.  **Output:** Combines these into a Markdown file with specific headers.
+
+### Ignore Patterns
+The tools are hardcoded to exclude "noise" files from the diff to prevent context window bloat:
+*   Lockfiles (`package-lock.json`, `yarn.lock`)
+*   Images (`*.png`, `*.jpg`, `*.svg`, etc.)
+*   Python artifacts (`__pycache__`, `*.pyc`)
+*   Node modules & Git internals
+
+### Dependencies
+*   **Python:** Uses only standard library (`argparse`, `subprocess`, `sys`, `os`).
+*   **Rust:** Uses `clap` (v4.5.3) for argument parsing and `anyhow` (v1.0.100) for error handling.
diff --git a/README.md b/README.md
new file mode 100644
index 0000000..190d697
--- /dev/null
+++ b/README.md
@@ -0,0 +1,92 @@
+# Git Release Context Generator
+
+A CLI tool designed to aggregate git history, code diffs, and strategic user notes into a single, structured Markdown file (`release_context.md`). This output is optimized for consumption by AI models (LLMs) to generate high-quality, customer-facing release notes.
+
+## Features
+
+- **Commit Logs:** Extracts clean commit messages between two git references.
+- **Smart Diffs:** Includes code changes while automatically excluding "noise" files (lockfiles, binaries, assets).
+- **Adhoc Notes:** Injects high-level strategic context or marketing points provided by the user.
+- **AI-Ready:** Formats output with clear headers and code blocks for optimal LLM processing.
+
+## Implementations
+
+This repository contains two implementations of the tool:
+1. **Python** (Script-based, no compilation needed)
+2. **Rust** (Compiled binary, high performance)
+
+---
+
+### 🐍 Python Version
+
+#### Prerequisites
+- Python 3.x
+- Git installed and in PATH
+
+#### Usage
+Run the script directly from the project root:
+
+```bash
+python src/generate_context.py --start <START_HASH> --end <END_HASH> [OPTIONS]
+```
+
+**Example:**
+```bash
+python src/generate_context.py --start HEAD~5 --end HEAD --notes docs/strategic-notes.md
+```
+
+---
+
+### 🦀 Rust Version
+
+#### Prerequisites
+- Rust & Cargo (latest stable)
+- Git installed and in PATH
+
+#### Build & Run
+
+1. **Build the release binary:**
+   ```bash
+   cd rust-context-gen
+   cargo build --release
+   cd ..
+   ```
+
+2. **Run the binary:**
+   ```bash
+   ./rust-context-gen/target/release/rust-context-gen --start <START_HASH> --end <END_HASH> [OPTIONS]
+   ```
+
+---
+
+## CLI Arguments
+
+Both versions support the same arguments:
+
+| Argument | Required | Description | Default |
+|----------|:--------:|-------------|---------|
+| `--start` | Yes | The starting commit hash or tag (exclusive). | - |
+| `--end` | Yes | The ending commit hash or tag (inclusive). | - |
+| `--notes` | No | Path to a Markdown file containing adhoc/strategic notes. | None |
+| `--output` | No | The filename for the generated context. | `release_context.md` |
+
+## Output Format
+
+The generated file follows this structure:
+
+```markdown
+# Release Context
+
+## Strategic Context / Adhoc Notes
+(Content from your notes file)
+
+## Commit History
+- feat: added new login screen
+- fix: resolved database deadlock
+
+## Code Changes
+```diff
+diff --git a/src/main.rs b/src/main.rs
+...
+```
+```
diff --git a/docs/ai/plan-001-high-level.md b/docs/ai/plan-001-high-level.md
new file mode 100644
index 0000000..c63a3c5
--- /dev/null
+++ b/docs/ai/plan-001-high-level.md
@@ -0,0 +1,89 @@
+### Part 1: High-Level Extraction Plan
+
+To feed the AI effectively, you need a single "context file" that is clean and organized. You should not just dump raw terminal output; you need to structure it using Markdown headers so the AI knows where the **User Notes** end and the **Raw Code** begins.
+
+**The Script Logic (Python):**
+
+1.  **Define Inputs:** Accept `Start_Commit_Hash`, `End_Commit_Hash`, and `Adhoc_Notes_File`.
+2.  **Initialize Output:** Create `release_context.md`.
+3.  **Inject User Context:** Read the `Adhoc_Notes_File` and append it to `release_context.md` under a `## Strategic Context / Adhoc Notes` header.
+4.  **Inject Commit Messages:** Run `git log` between the two hashes.
+    - _Tip:_ Use a pretty format to strip out dates/authors if irrelevant, focusing on the message.
+    - _Command:_ `git log --pretty=format:"- %s" start..end >> release_context.md`
+5.  **Inject Diffs (The Heavy Lifting):** Run `git diff` between the hashes.
+    - _Crucial Step:_ You must exclude "noise" files (lock files, assets, binary files) to prevent the AI from hallucinating on 5,000 lines of `package-lock.json`.
+    - _Command:_ `git diff start..end -- . ':(exclude)package-lock.json' ':(exclude)*.png' >> release_context.md`
+6.  **Final Polish:** Wrap the diff output in triple backticks (\`\`\`) in the Markdown file so the AI processes it as a code block.
+
+---
+
+### Part 2: The "Release Notes Generator" Prompt
+
+Copy and paste the text below into your AI model (ChatGPT, Claude, Gemini). This prompt is engineered to filter out technical noise and produce customer-ready content.
+
+**Subject:** Release Notes Generation Prompt
+
+```markdown
+# Role
+
+You are an expert Technical Product Manager and Communications Lead. Your goal is to draft clean, professional, and customer-facing release notes based on raw technical data.
+
+# Input Data
+
+I will provide you with a single Markdown document containing three sections:
+
+1. **Adhoc Notes:** specific points I want to emphasize or marketing language I want included.
+2. **Commit Logs:** A list of git commit messages.
+3. **The Diff:** The raw code changes between two versions.
+
+# Instructions
+
+Analyze the provided input and generate a release notes summary. You must adhere to the following rules:
+
+1.  **Filter Internal Noise:** Ignore changes related to CI/CD pipelines, build configurations, refactoring, unit tests, or dependency updates (unless they strictly impact performance/security). Focus ONLY on what affects the end-user.
+2.  **Translate to "User Benefit":** Do not describe _what_ changed in the code; describe _why_ it matters to the user.
+    - _Bad:_ "Updated UserSchema to include preferred_name field."
+    - _Good:_ "Users can now set a Preferred Name in their profile settings."
+3.  **Prioritize Adhoc Notes:** If I have included specific instructions or high-level summaries in the "Adhoc Notes" section, these take precedence over the raw diffs. Use the diffs to flesh out the details of those notes.
+4.  **Categorization:** Group the notes into these headers:
+    - 🚀 **New Features** (Significant additions)
+    - ✨ **Improvements** (Tweaks to existing features, performance upgrades)
+    - 🐛 **Bug Fixes** (Corrections to broken behavior)
+5.  **Tone:** Professional, concise, and encouraging. Avoid passive voice.
+
+# Output Format
+
+Please output the release notes in the following Markdown structure:
+
+## [Release Version/Date]
+
+### Executive Summary
+
+(A 2-3 sentence summary of the main theme of this release).
+
+### 🚀 New Features
+
+- **[Feature Name]:** [Description of value]
+
+### ✨ Improvements
+
+- **[Improvement]:** [Description]
+
+### 🐛 Bug Fixes
+
+- [Description of fix]
+
+---
+
+**Data to Process:**
+
+[PASTE YOUR GENERATED TEXT FILE CONTENT HERE]
+```
+
+---
+
+### Part 3: Why this prompt works (Best Practices)
+
+- **Role Definition:** Assigning the "Product Manager" persona prevents the AI from acting like a "Senior Developer." A developer writes "Refactored API endpoint"; a PM writes "Faster load times."
+- **Negative Constraints:** Explicitly telling the AI to _ignore_ CI/CD and refactors is critical. Without this, your release notes will be cluttered with "Updated GitHub Actions workflow," which customers don't care about.
+- **Hierarchy of Truth:** The prompt explicitly states that **Adhoc Notes \> Raw Code**. This allows you to guide the narrative manually while letting the AI do the grunt work of digging up the details from the code.
diff --git a/docs/ai/plan-002-implementation-part1.md b/docs/ai/plan-002-implementation-part1.md
new file mode 100644
index 0000000..e7f4222
--- /dev/null
+++ b/docs/ai/plan-002-implementation-part1.md
@@ -0,0 +1,75 @@
+# Implementation Plan - Part 1: Context Generator Script
+
+This plan details the development of the Python script required to generate the `release_context.md` file, as outlined in `plan-001-high-level.md`.
+
+## 1. Objective
+Develop a CLI tool (`generate_context.py`) that aggregates git history, diffs, and user notes into a single Markdown file suitable for AI processing.
+
+## 2. Technical Requirements
+- **Language:** Python 3.x
+- **Dependencies:** Standard library (`argparse`, `subprocess`, `os`, `sys`). No external pip packages required to keep it lightweight.
+- **VCS:** Git (must be installed and accessible in PATH).
+
+## 3. Script Architecture (`src/generate_context.py`)
+
+### 3.1. Inputs (CLI Arguments)
+- `--start`: Start Commit Hash (required).
+- `--end`: End Commit Hash (required).
+- `--notes`: Path to Adhoc Notes Markdown file (optional, defaults to none).
+- `--output`: Output filename (optional, defaults to `release_context.md`).
+
+### 3.2. Core Functions
+1.  **`read_notes(file_path)`**: Reads the content of the adhoc notes file. Returns a placeholder message if the file doesn't exist or isn't provided.
+2.  **`get_git_log(start, end)`**: Executes `git log --pretty=format:"- %s" start..end`.
+3.  **`get_git_diff(start, end)`**: Executes `git diff start..end`.
+    - **Filtering:** Must implement exclusion logic for lock files and binary assets (e.g., `package-lock.json`, `yarn.lock`, `*.png`, `*.jpg`, `*.pyc`).
+4.  **`write_output(content, output_file)`**: Writes the aggregated string to the target file.
+
+### 3.3. Output Structure (`release_context.md`)
+```markdown
+# Release Context
+
+## Strategic Context / Adhoc Notes
+[Content from --notes file]
+
+## Commit History
+[Output from git log]
+
+## Code Changes
+```diff
+[Output from git diff]
+```
+```
+
+## 4. Implementation Steps
+
+### Step 1: Project Structure Setup
+- Create `src/` directory.
+- Create empty `src/__init__.py`.
+- Create `src/generate_context.py`.
+
+### Step 2: Argument Parsing & Skeleton
+- Implement `argparse` to handle `--start`, `--end`, `--notes`, and `--output`.
+- Add basic validation (check if git is installed).
+
+### Step 3: Git Operations
+- Implement `subprocess` calls for `git log` and `git diff`.
+- Hardcode the exclusion list initially:
+    - `package-lock.json`
+    - `yarn.lock`
+    - `*.png`
+    - `*.jpg`
+    - `*.svg`
+    - `__pycache__`
+
+### Step 4: File Assembly
+- Combine strings in the defined order.
+- Ensure the diff output is wrapped in triple backticks.
+
+### Step 5: Testing
+- Verify against the current repository's history.
+- Example run: `python src/generate_context.py --start HEAD~5 --end HEAD`
+
+## 5. Future Improvements (Out of Scope for MVP)
+- Configurable ignore patterns via a `.contextignore` file.
+- Support for multiple repositories.
diff --git a/docs/ai/release-notes-prompt.md b/docs/ai/release-notes-prompt.md
new file mode 100644
index 0000000..564731e
--- /dev/null
+++ b/docs/ai/release-notes-prompt.md
@@ -0,0 +1,70 @@
+# Role
+
+You are an expert Technical Product Manager and Strategic Communications Lead. Your goal is to draft clean, professional, and transparent release notes that balance user engagement with risk management. You are writing for a mixed audience of end-users and DevOps/System Administrators.
+
+# Input Data
+
+I will provide you with a single Markdown document containing three sections:
+
+1. **Adhoc Notes:** Strategic context, marketing highlights, and specific instructions.
+2. **Commit Logs:** A list of git commit messages.
+3. **The Diff:** The raw code changes between two versions.
+
+# Instructions
+
+Analyze the provided input and generate a release notes summary. You must adhere to the following rules based on industry best practices:
+
+1.  **Filter Internal Noise:** Ignore changes related to CI/CD pipelines, build configurations, refactoring, or "chore" commits unless they strictly impact performance/security.
+2.  **Translate to "User Benefit":** Do not describe *what* changed in the code; describe *why* it matters.
+    - *Bad:* "Fixed bug #402."
+    - *Good:* "Fixed a crash that occurred when exporting large PDF files." (Focus on the symptom, not the code).
+3.  **Prioritize Adhoc Notes:** Strategic context takes precedence. Use the diffs to validate and flesh out these high-level points.
+4.  **Security & Risk:**
+    - Identify any security fixes. If a CVE is mentioned, use the format `[CVE-YYYY-XXXX]`.
+    - Highlight any **Breaking Changes** or **Deprecations** clearly.
+5.  **Categorization:** Group notes into the headers defined below.
+6.  **Tone:** Professional, objective, and concise. Avoid humor or excessive marketing fluff, especially in security/bug sections.
+
+# Output Format
+
+Please output the release notes in the following Markdown structure:
+
+## [Release Version/Date]
+
+**Severity:** [Critical/High/Medium/Low] (Infer based on the presence of security fixes or breaking changes)
+
+### Executive Summary
+
+(A 2-3 sentence narrative summary of the main theme and value of this release).
+
+### New Features
+
+- **[Feature Name]:** [Description of value]
+
+### Improvements
+
+- **[Improvement]:** [Description]
+
+### Bug Fixes
+
+- [Description of fix] (Issue #ID if available)
+
+### Security Advisories
+
+- [List vulnerabilities or "None" if applicable]
+
+### Deprecations & Breaking Changes
+
+- [List breaking changes or "None" if applicable]
+
+### Downloads & Checksums
+
+**Export Control Notice:** This software is subject to U.S. EAR. Diversion contrary to U.S. law is prohibited.
+
+- **Source Code:** [Link to tag]
+
+---
+
+# Output Instruction
+
+Save the generated release notes to a new file named `release_notes_v2.md` in the same directory as the input file.
diff --git a/docs/research/release-notes-best-practices-research.md b/docs/research/release-notes-best-practices-research.md
new file mode 100644
index 0000000..e7a073f
--- /dev/null
+++ b/docs/research/release-notes-best-practices-research.md
@@ -0,0 +1,423 @@
+
+
+# **Strategic Release Engineering: A Comprehensive Framework for Public Software Documentation**
+
+## **1\. Executive Summary**
+
+The discipline of software release management has evolved from a purely operational task into a strategic communication function that directly influences user trust, product adoption, and legal compliance. As software architectures shift towards continuous delivery, microservices, and decentralized distribution (via containers and package managers), the "Release Note" has become the single source of truth connecting engineering output with user consumption.
+
+This research report provides an exhaustive analysis of best practices for public release notes, tailored for engineering organizations delivering complex software across desktop, web, mobile, and embedded Linux environments. The analysis synthesizes data from industry leaders—including HashiCorp, Atlassian, GitHub, and Notion—to establish a unified framework for release communications.
+
+Key findings indicate that the most effective release notes are not merely retrospective logs of changes but are prospective tools for user engagement and risk management.1 They serve dual masters: the technical consumer (SysAdmins, DevOps engineers) who requires precise data on deprecations and security vulnerabilities 3, and the end-user who seeks value and feature utility.4 Furthermore, the convergence of "Docs-as-Code" methodologies and Artificial Intelligence (AI) is redefining how these documents are produced, moving from manual drafting to automated, git-driven pipelines that ensure accuracy and reduce engineering toil.6
+
+The report establishes that transparency—even regarding bugs and security flaws—is the primary driver of long-term user retention.8 However, this transparency must be governed by strict legal protocols regarding export compliance and liability disclaimers, particularly for publicly downloadable binaries.9 The following sections detail the strategic, structural, and technical architectures necessary to implement a world-class release note strategy.
+
+---
+
+## **2\. Strategic Purpose and Goals**
+
+### **2.1 The Transparency Imperative and User Trust**
+
+The modern software consumer, whether an enterprise procurement officer or an individual mobile user, operates in a low-trust environment. Research highlights that data transparency is a top priority for consumers worldwide, with trust contingent upon an organization's willingness to be open about its operations.8 In the context of software releases, transparency manifests as the timely and accurate publication of release notes.
+
+When an update includes changes that directly affect users, prompt publication is not a courtesy but a requirement for maintaining the "social contract" between vendor and user.1 The absence of release notes, or the use of generic placeholders like "Bug fixes and improvements," breaks this contract. It signals to the user that their experience is secondary to the vendor's convenience, leading to ignored updates and eventual churn.11 Conversely, detailed notes that explain *why* a change was made build a narrative of momentum and care. Transparency builds trust, making users feel valued and invested in the product's roadmap.2
+
+This dynamic is particularly acute in the healthcare and safety-critical sectors. The "Open Notes" movement in healthcare records serves as a parallel: exposing the "system internals" (medical records) to the "users" (patients) was found to enhance trust, accountability, and autonomy.12 Applied to software, granting users insight into the "health" of the application—including honest admissions of bugs and known issues—fosters a similar sense of partnership and legitimacy.
+
+### **2.2 Market Dynamics: B2B vs. B2C Communication**
+
+The strategy for release notes cannot be uniform; it must adapt to the economic and psychological profile of the customer. The distinction between Business-to-Business (B2B) and Business-to-Consumer (B2C) markets dictates the tone, frequency, and granularity of the documentation.
+
+#### **2.2.1 B2B: Risk Management and ROI**
+
+In B2B environments (e.g., Enterprise SaaS, Embedded Linux infrastructure), the buyer and the user are often different entities, and the sales cycle is long and rational.13
+
+* **Rational Decision Making:** B2B buyers look at the long term. They need to understand how an update impacts stability, security, and return on investment (ROI). Release notes for this audience must be exhaustive and technical, focusing on "Backward Compatibility," "Deprecations," and "API Stability".15  
+* **Risk Aversion:** Enterprise system administrators prioritize stability over novelty. A release note that glosses over a breaking change can cause outages, leading to Service Level Agreement (SLA) breaches. Therefore, B2B notes function as risk assessment documents.3  
+* **Buying Committees:** Since purchasing decisions involve multiple stakeholders (security, finance, engineering), release notes must cater to these distinct personas—providing security metrics for the CISO (e.g., CVSS scores) and feature benefits for the Line of Business manager.14
+
+#### **2.2.2 B2C: Engagement and Delight**
+
+B2C transactions are characterized by shorter sales cycles, often driven by impulse or immediate need.15
+
+* **Emotional Connection:** B2C release notes should focus on "delight" and convenience. They are marketing opportunities designed to trigger an emotional response—excitement for a new feature or relief that a nuisance bug is gone.16  
+* **Impulse Adoption:** Consumers often update apps manually or check "What's New" feeds out of curiosity. The content must be punchy and visually engaging to capture fleeting attention spans.17  
+* **Single Persona:** The user is typically the buyer. The communication can be direct and personal (using "You" instead of "The Administrator").2
+
+### **2.3 Legal Considerations and Export Compliance**
+
+For engineering organizations distributing "Publicly downloadable binaries or container images," release notes are not just technical documents; they are legal instruments.
+
+#### **2.3.1 Export Control Regulations**
+
+Software, particularly that containing cryptographic functions, is subject to export control laws such as the U.S. Export Administration Regulations (EAR) managed by the Bureau of Industry and Security (BIS).
+
+* **Compliance Disclaimers:** Download pages and release notes for binaries must include an Export Compliance Disclaimer. This text warns users that the software cannot be diverted to embargoed nations (e.g., Cuba, Iran, North Korea) or denied parties.9  
+* **Diversion Risk:** Without explicit warnings in the release documentation, a vendor exposes themselves to liability if their software is used in prohibited jurisdictions. An effective Export Compliance Program (ECP) requires that these notifications be integrated into the distribution workflow.9
+
+#### **2.3.2 Warranty and Liability Limitations**
+
+Release notes often accompany the delivery of new code. To mitigate the risk of lawsuits arising from software failures, data corruption, or downtime caused by an update, standard "Warranty Disclaimers" should be linked or included.
+
+* **"As Is" Provision:** It is standard legal practice to state that the software is provided "as is," negating implied warranties of merchantability or fitness for a particular purpose.10  
+* **Liability Caps:** Disclaimers protect the organization from claims exceeding the cost of the software, specifically excluding consequential damages (e.g., lost profits due to a bad update).18
+
+---
+
+## **3\. Structural Architecture and Content Strategy**
+
+### **3.1 The Taxonomy of a Modern Release Note**
+
+An analysis of industry leaders like GitHub, Atlassian, and HashiCorp reveals a consensus on the structural anatomy of effective release notes. The structure must be predictable to allow users to parse information rapidly.3
+
+#### **3.1.1 The Header and Metadata**
+
+The entry point must establish context immediately.
+
+* **Version Identifier:** Semantic Version (e.g., v1.4.0) or Calendar Version (e.g., 2025.11).  
+* **Release Date:** Essential for audit trails and security compliance (ISO 8601 format recommended: YYYY-MM-DD).  
+* **Severity/Impact:** A clear indicator if the release is a "Security Hotfix," "Feature Release," or "Maintenance Update."
+
+#### **3.1.2 The Executive Summary (Highlights)**
+
+For major and minor releases, a 2-3 sentence narrative summary is crucial. This section addresses the "Why" of the release. It translates technical changes into business value.2
+
+* *Example:* "This release introduces the new Reporting Module, allowing teams to visualize deployment velocity. We have also addressed critical latency issues in the API gateway."
+
+#### **3.1.3 Categorized Change Log**
+
+The body of the note should be segmented by the nature of the change. This helps different user personas find relevant data.
+
+* **New Features:** Detailed descriptions of new capabilities. Best practice involves using screenshots or GIFs to demonstrate UI changes, as seen in Notion and GitHub updates.20  
+* **Enhancements:** Improvements to existing features (e.g., "Search is now 50% faster").  
+* **Bug Fixes:** A list of resolved issues. Each item should link to a public issue tracker (Jira ticket or GitHub Issue ID) if available, fostering transparency.22  
+* **Security Advisories:** A dedicated section for vulnerabilities, listing CVE IDs and CVSS scores. (See Section 7 for details).  
+* **Deprecations:** A critical section for developers. It must list APIs or features that will be removed in future versions, providing a migration path.24  
+* **Known Issues:** Transparently listing unresolved bugs builds trust and prevents support ticket flooding. It saves users from debugging issues the team is already aware of.25
+
+### **3.2 Referencing Artifacts: Docs and SBOMs**
+
+Modern release notes act as a hub, connecting the user to the broader ecosystem of the release.
+
+* **Software Bill of Materials (SBOM):** With the rise of supply chain attacks (e.g., SolarWinds), enterprise customers demand visibility into the components of the software they run. Following NIST SP 800-161r1 guidelines, release notes for binaries and containers should link to an SBOM (in SPDX or CycloneDX format).26 This allows security teams to ingest the release into their own risk management tools.  
+* **Documentation Links:** Instead of replicating full instructions in the note, deep-link to the updated version of the technical documentation (Docs-as-Code).  
+* **Git Diffs:** For open-source or developer-centric tools (e.g., Rust crates, Kubernetes), providing a comparison link (e.g., git compare v1.0...v1.1) is the ultimate form of transparency, allowing users to audit every line of code changed.27
+
+### **3.3 Industry Examples of Structure**
+
+| Company | Model | Structural Key | Insight |
+| :---- | :---- | :---- | :---- |
+| **GitHub** | Developer Platform | Tag-based filtering (e.g., "Actions," "Security") 19 | Allows users to curate their own view of the changelog. |
+| **HashiCorp** | Infrastructure | Strict FEATURES, BUG FIXES, DEPRECATIONS headers 3 | Optimized for sysadmins who need to parse risk quickly. |
+| **Notion** | SaaS Productivity | "What's New" visual storytelling 4 | Focuses on user education and feature adoption rather than technical diffs. |
+| **Rust** | Programming Language | RELEASES.md with "Language," "Compiler," "Libraries" sections 28 | categorization matches the architectural components of the software. |
+
+---
+
+## **4\. Versioning Paradigms**
+
+The version number acts as a shorthand for the scope and risk of a release.
+
+### **4.1 Semantic Versioning (SemVer)**
+
+SemVer (MAJOR.MINOR.PATCH) is the dominant standard for libraries, APIs, and B2B software.29
+
+* **Mechanism:**  
+  * **Major:** Incompatible API changes.  
+  * **Minor:** Backward-compatible functionality.  
+  * **Patch:** Backward-compatible bug fixes.  
+* **Implication for Notes:** Release note authors must strictly align the content with the version. A "Patch" release note should *never* contain new features, as this violates the user's expectation of a low-risk update. "Major" release notes must prioritize a "Migration Guide" to help users navigate breaking changes.29
+
+### **4.2 Calendar Versioning (CalVer)**
+
+CalVer uses the date of release (e.g., 2025.11 or v25.04).31
+
+* **Mechanism:** Ideal for SaaS products (Ubuntu, browser updates) where continuous deployment renders "breaking changes" less binary.  
+* **Implication for Notes:** This format emphasizes *freshness*. Release notes are often grouped by month ("November Updates"). It simplifies the narrative for non-technical users who relate better to "The November Update" than "v14.2.1".30
+
+### **4.3 Marketing Versioning**
+
+Many organizations employ a dual-track system: an internal technical build number (e.g., Build 10.4.553) and a public marketing version (e.g., Product X 2025).32
+
+* **Strategy:** The public release notes use the marketing version to discuss value and features, while the attached technical changelog (or "ReadMe" in the binary) references the build number. This satisfies both the marketing team's need for branding and the support team's need for precision.33
+
+---
+
+## **5\. Tone, Voice, and Readability**
+
+### **5.1 Public vs. Internal Tone**
+
+A common anti-pattern in release notes is the leakage of internal jargon. Notes generated directly from raw commit messages often contain phrases like "Refactored AbstractFactoryBean" or "Fix null pointer in doStuff()".
+
+* **The Anti-Pattern:** "Fixed bug \#402." This provides zero context or value to the user.34  
+* **The Best Practice:** "Fixed a crash that occurred when exporting large PDF files." This describes the *symptom* the user experienced, not the code that was broken.34  
+* **B2C Voice:** Modern B2C apps (e.g., Slack, Discord) use a conversational, witty tone. They use the second person ("You can now...") to build a relationship. "We squashed some bugs to make your experience smoother" is acceptable here.2  
+* **B2B Voice:** Enterprise software requires a professional, objective tone. Humor is risky; clarity is paramount. "Resolved a race condition in the authentication subsystem" is appropriate for a Kubernetes release note.35
+
+### **5.2 Localization and Global Accessibility**
+
+For global software, release notes must be accessible to non-English speakers.
+
+* **Localization (L10n):** Platforms like ServiceNow support translated release notes. The challenge is ensuring that technical terms (e.g., "Load Balancer") are translated correctly or kept in English where appropriate to avoid confusion.36  
+* **Cultural Nuance:** Dates should be formatted explicitly (YYYY-MM-DD) to avoid confusion between US (MM/DD) and International (DD/MM) formats.25
+
+---
+
+## **6\. Automation and the Docs-as-Code Workflow**
+
+To maintain high-velocity releases without sacrificing documentation quality, organizations are adopting "Docs-as-Code." This treats documentation as a software artifact—versioned, tested, and automated.7
+
+### **6.1 The Git-Based Truth Source**
+
+The commit history is the ground truth of what changed. By enforcing **Conventional Commits** (type(scope): message), developers categorize changes at the source.38
+
+* feat: Triggers a Minor version bump and adds to "Features" in notes.  
+* fix: Triggers a Patch version bump and adds to "Bug Fixes."  
+* chore/docs: Ignored by the release note generator.
+
+### **6.2 CI/CD Integration Architecture**
+
+Automation tools like semantic-release or GitHub Actions can orchestrate the entire process.39
+
+**Workflow Description:**
+
+1. **Commit:** Engineer commits code with conventional messaging.  
+2. **Linting:** CI pipeline checks commit message format.  
+3. **Merge:** Code merges to main.  
+4. **Extraction:** The release tool parses commits since the last Git tag.  
+5. **Generation:** A changelog is generated (Markdown) using a template.  
+6. **Injection:** The changelog is prepended to CHANGELOG.md in the repo.  
+7. **Publishing:** The content is pushed to the documentation site, GitHub Releases page, and RSS feed simultaneously.41
+
+### **6.3 Deep Research: Docs-as-Code Workflow Diagram**
+
+The following diagram illustrates the automated pipeline for generating and publishing release notes.
+
+Code snippet
+
+graph TD  
+    A \--\>|Commit (Conventional Commits)| B(Git Repository)  
+    B \--\>|Pull Request| C{CI Pipeline}  
+    C \--\>|Lint Commit Messages| D  
+    D \--\>|Merge to Main| E  
+    E \--\>|1. Analyze Commits (Semantic Release)| F  
+    F \--\>|2. Generate Changelog (AI/Template)| G  
+    G \--\>|3. Human Review (Technical Writer)| H  
+    H \--\>|4. Publish Artifacts| I  
+    H \--\>|4. Publish Docs| J  
+    H \--\>|4. Publish Feed| K  
+    H \--\>|4. Publish Widget| L
+
+---
+
+## **7\. AI-Assisted Documentation Workflows**
+
+The integration of Large Language Models (LLMs) allows for the transformation of terse commit messages into human-readable prose, bridging the gap between "Git log" and "Release Note".6
+
+### **7.1 Prompt Engineering for Release Notes**
+
+To avoid "hallucinations" (inventing features) or generic fluff, prompt engineering is critical.
+
+* **Persona:** Assign a role (e.g., "Technical Writer") to the AI.  
+* **Context:** Provide the diff or commit list.  
+* **Constraints:** Explicitly forbid the AI from mentioning internal refactors or "chore" commits.  
+* **Temperature:** Set low (0.1) to ensure deterministic, factual output.6
+
+### **7.2 AI Prompting Recipes**
+
+**Recipe 1: The "Summarizer" (Raw Commits to Draft)**
+
+Role: You are a Senior Product Manager.  
+Task: Summarize the following git commits into a release note.  
+Rules:
+
+1. Group by "Features" and "Bug Fixes".  
+2. Ignore commits starting with "chore", "ci", or "test".  
+3. Rewrite technical commit messages into user-benefit statements.  
+4. Use professional, concise language.  
+   Input: \[Insert Git Log\]
+
+**Recipe 2: The "Marketing Polish" (Draft to Highlights)**
+
+Role: You are a Marketing Copywriter.  
+Task: Take the technical release notes below and write a 3-sentence "What's New" summary for an in-app popup.  
+Tone: Exciting, brief, and using "You" to address the user.  
+Input:
+
+---
+
+## **8\. Distribution and Accessibility**
+
+### **8.1 Accessibility (WCAG Compliance)**
+
+Release notes are web content and must adhere to **WCAG 2.1 Level AA** standards to ensure they are accessible to users with disabilities.44
+
+* **Screen Readers:**  
+  * Use proper semantic headings (\<h2\> for sections), not just bold text (\*\*Features\*\*). This allows screen reader users to navigate by structure.46  
+  * Ensure in-app widgets manage "keyboard focus" correctly. When a release note modal opens, focus should move to the modal; when it closes, it should return to the trigger button.47  
+* **Visuals:** All images/GIFs of new features must have descriptive alt text.44  
+* **Contrast:** Ensure text color meets the 4.5:1 contrast ratio, especially for metadata like timestamps often hidden in light grey text.
+
+### **8.2 Distribution Channels**
+
+* **In-App Widgets:** For SaaS, this is the highest engagement channel. Tools (e.g., Beamer, Appcues) display a "red dot" notification, prompting users to read updates while in context.48  
+* **RSS and Appcasts:** For desktop software (macOS/Windows), the **Sparkle** Appcast format (an RSS extension) is the industry standard. It requires specific namespaces (xmlns:sparkle) and \<enclosure\> tags containing the binary URL and digital signature.50 This allows applications to auto-update.  
+* **Web & SEO:** Publishing notes as static HTML pages helps with SEO. Users searching for "Product X new features" will land on the changelog, driving organic traffic.5
+
+---
+
+## **9\. Security Disclosures and Crisis Communication**
+
+Security advisories are the most sensitive component of release notes. A misstep here can alert attackers before users have patched.
+
+### **9.1 Coordinated Vulnerability Disclosure (CVD)**
+
+CVD involves a structured timeline: reporting, analysis, mitigation, and finally, disclosure.52
+
+* **Embargo:** Release notes regarding security vulnerabilities are often drafted and "embargoed" (held back) until the patch is available.  
+* **Timeline:** The industry standard suggests a 45-90 day window between reporting and public disclosure.53
+
+### **9.2 CVE Listing Formats**
+
+When listing a security fix, use the **CVE (Common Vulnerabilities and Exposures)** identifier.
+
+* **Format:** \[CVE-2024-XXXX\] Fixed a buffer overflow in the input parser.  
+* **Anti-Pattern:** Do not include "Proof of Concept" (PoC) code or detailed steps to reproduce the exploit in the release note. This arms attackers.  
+* **Best Practice:** Link to a separate "Security Advisory" page that contains technical details for defenders (e.g., CVSS score, mitigation steps) without giving away the exploit script.54
+
+---
+
+## **10\. Industry Examples: Patterns and Anti-Patterns**
+
+### **10.1 High-Performance Patterns**
+
+* **Notion (SaaS):** Masters the "Narrative" release note. They group small updates into "The Quality of Life Update" rather than a dry list. This increases readability and emotional connection.4  
+* **HashiCorp (Enterprise):** The gold standard for technical precision. Their separation of upgrade\_notes (breaking changes) from bug\_fixes ensures that DevOps engineers can assess upgrade risk in seconds.3  
+* **GitHub (Platform):** Uses "Generated Release Notes" effectively by categorizing Pull Requests by labels (enhancement, bug). This allows them to handle massive volume while keeping the notes readable.21
+
+### **10.2 Anti-Patterns**
+
+* **"Various Bug Fixes":** Seen frequently in mobile app stores. It destroys user trust and gives no reason to update.11  
+* **The "Wall of Text":** Dumping a raw git log without categorization. Users cannot distinguish between a typo fix in the README and a critical database patch.  
+* **Marketing Fluff in Security Notes:** Using jokes or emojis when discussing a critical vulnerability. This undermines the seriousness of the security posture.
+
+---
+
+## **11\. Implementation Checklist**
+
+### **11.1 Pre-Release Checklist**
+
+* \[ \] **Categorization:** Are features, fixes, and security patches clearly separated?  
+* \[ \] **Legal:** Is the Export Compliance Disclaimer present for binary downloads?.9  
+* \[ \] **Security:** Are CVE IDs listed? Is the disclosure coordinated/embargoed?  
+* \[ \] **Docs Sync:** Do links point to the correct version of the user manual?  
+* \[ \] **Accessibility:** Is the web page keyboard navigable? Do images have alt text?.44  
+* \[ \] **Mobile:** Does the "What's New" text fit within App Store character limits (4000 chars, but first 3 lines are crucial)?.55
+
+---
+
+## **Appendix: Templates**
+
+### **A.1 Standard Release Note Template (Markdown)**
+
+# **\[Product Name\] v\[Major\].\[Minor\].\[Patch\]**
+
+Release Date: YYYY-MM-DD  
+Severity: \[Critical/High/Medium/Low\]
+
+## **🚀 Executive Summary**
+
+\[2-3 sentences describing the high-level value of this release.\]
+
+## **✨ New Features**
+
+* **Feature A:** Description of value.  
+* **Feature B:** Description of value.
+
+## **🐛 Bug Fixes**
+
+* Fixed a crash in the login flow (Issue \#123).  
+* Resolved rendering artifact in dark mode.
+
+## **🛡️ Security Advisories**
+
+* **Critical:** Fixed remote code execution vulnerability (). Update immediately.
+
+## **⚠️ Deprecations & Breaking Changes**
+
+* The v1/api endpoint is deprecated. Please migrate to v2 by.
+
+## **📦 Downloads & Checksums**
+
+**Export Control Notice:** This software is subject to U.S. EAR. Diversion contrary to U.S. law is prohibited.
+
+* **Linux (AMD64):** (SHA256: ...)  
+* **SBOM:**
+
+---
+
+**Conclusion**
+
+The release note is the nexus where engineering reality meets user perception. By adopting the frameworks detailed in this report—shifting to structured data, leveraging automation, respecting legal and security protocols, and writing with empathy for the user—engineering organizations can transform this artifact from a liability into a strategic asset. The future of release notes is automated, personalized, and deeply integrated into the software supply chain, ensuring that as software eats the world, it explains itself clearly.
+
+---
+
+**End of Report**
+
+#### **Works cited**
+
+1. What are Release Notes? Explanation & FAQs \- Beamer, accessed November 26, 2025, [https://www.getbeamer.com/blog/what-are-release-notes](https://www.getbeamer.com/blog/what-are-release-notes)  
+2. Should SaaS vendors provide detailed release notes whenever they make changes to their product? \- Quora, accessed November 26, 2025, [https://www.quora.com/Should-SaaS-vendors-provide-detailed-release-notes-whenever-they-make-changes-to-their-product](https://www.quora.com/Should-SaaS-vendors-provide-detailed-release-notes-whenever-they-make-changes-to-their-product)  
+3. Changelog Process \- Terraform AWS Provider \- Contributor Guide, accessed November 26, 2025, [https://hashicorp.github.io/terraform-provider-aws/changelog-process/](https://hashicorp.github.io/terraform-provider-aws/changelog-process/)  
+4. What's New \- Notion, accessed November 26, 2025, [https://www.notion.com/releases](https://www.notion.com/releases)  
+5. Changelog vs. Release Notes: Differences and Examples \- ReleaseNotes.io, accessed November 26, 2025, [https://blog.releasenotes.io/changelog-vs-release-notes/](https://blog.releasenotes.io/changelog-vs-release-notes/)  
+6. How to Automate Release Notes with AI: Complete GitHub Actions Tutorial \- Ascend.io, accessed November 26, 2025, [https://www.ascend.io/blog/how-we-built-an-ai-powered-release-notes-pipeline](https://www.ascend.io/blog/how-we-built-an-ai-powered-release-notes-pipeline)  
+7. Docs as Code \- Write the Docs, accessed November 26, 2025, [https://www.writethedocs.org/guide/docs-as-code.html](https://www.writethedocs.org/guide/docs-as-code.html)  
+8. Consumers say trust depends on transparency \- IAPP, accessed November 26, 2025, [https://iapp.org/news/a/consumers-say-trust-depends-on-transparency](https://iapp.org/news/a/consumers-say-trust-depends-on-transparency)  
+9. The Elements of an Effective Export Compliance Program \- Bureau of Industry and Security, accessed November 26, 2025, [https://www.bis.doc.gov/index.php/documents/pdfs/1641-ecp/file](https://www.bis.doc.gov/index.php/documents/pdfs/1641-ecp/file)  
+10. Sample Disclaimer Template & Guide \[Free Download\] \- Termly, accessed November 26, 2025, [https://termly.io/resources/templates/disclaimer-template/](https://termly.io/resources/templates/disclaimer-template/)  
+11. Release Notes Best Practices: How to Announce Product Changes \- Userpilot, accessed November 26, 2025, [https://userpilot.com/blog/release-notes-best-practices/](https://userpilot.com/blog/release-notes-best-practices/)  
+12. A Theoretical Twist on the Transparency of Open Notes: Qualitative Analysis of Health Care Professionals' Free-Text Answers \- NIH, accessed November 26, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC6785719/](https://pmc.ncbi.nlm.nih.gov/articles/PMC6785719/)  
+13. B2B vs B2C \- Differences, Definition, Examples, Strategies \- B2B Marketing World, accessed November 26, 2025, [https://www.b2bmarketingworld.com/definition/b2b-vs-b2c/](https://www.b2bmarketingworld.com/definition/b2b-vs-b2c/)  
+14. B2B Meaning Demystified: Key Differences from B2C in Sales Strategies, accessed November 26, 2025, [https://www.groweon.com/blog/b2b-meaning-demystified-key-differences-from-b2c-in-sales-strategies/](https://www.groweon.com/blog/b2b-meaning-demystified-key-differences-from-b2c-in-sales-strategies/)  
+15. B2B vs B2C Ecommerce: What's the Difference? \- Salesforce, accessed November 26, 2025, [https://www.salesforce.com/blog/b2b-vs-b2c-ecommerce-difference-2/](https://www.salesforce.com/blog/b2b-vs-b2c-ecommerce-difference-2/)  
+16. B2B vs B2C: Key Differences & Winning Strategies for 2026, accessed November 26, 2025, [https://www.centricdxb.com/insights/b2b-vs-b2c](https://www.centricdxb.com/insights/b2b-vs-b2c)  
+17. B2B vs B2C: What's the Difference? | CO- by US Chamber of Commerce, accessed November 26, 2025, [https://www.uschamber.com/co/start/strategy/b2b-vs-b2c](https://www.uschamber.com/co/start/strategy/b2b-vs-b2c)  
+18. Disclaimer Examples | 8+ Disclaimer Statements \- Termly, accessed November 26, 2025, [https://termly.io/resources/articles/disclaimer-examples/](https://termly.io/resources/articles/disclaimer-examples/)  
+19. GitHub Changelog \- The GitHub Blog, accessed November 26, 2025, [https://github.blog/changelog](https://github.blog/changelog)  
+20. Notion release notes · Actions · GitHub Marketplace, accessed November 26, 2025, [https://github.com/marketplace/actions/notion-release-notes](https://github.com/marketplace/actions/notion-release-notes)  
+21. What's new from GitHub Changelog? November 2021 recap, accessed November 26, 2025, [https://github.blog/news-insights/product-news/whats-new-from-github-changelog-november-2021-recap/](https://github.blog/news-insights/product-news/whats-new-from-github-changelog-november-2021-recap/)  
+22. Create release notes \- Atlassian Support, accessed November 26, 2025, [https://support.atlassian.com/jira-cloud-administration/docs/create-release-notes/](https://support.atlassian.com/jira-cloud-administration/docs/create-release-notes/)  
+23. What are the best practises to collect the release notes when having JIRA \- Bitbucket integration? \- Atlassian Community, accessed November 26, 2025, [https://community.atlassian.com/forums/Bitbucket-questions/What-are-the-best-practises-to-collect-the-release-notes-when/qaq-p/1804152](https://community.atlassian.com/forums/Bitbucket-questions/What-are-the-best-practises-to-collect-the-release-notes-when/qaq-p/1804152)  
+24. hashicorp-terraform/CHANGELOG.md at master \- GitHub, accessed November 26, 2025, [https://github.com/ebekker/hashicorp-terraform/blob/master/CHANGELOG.md](https://github.com/ebekker/hashicorp-terraform/blob/master/CHANGELOG.md)  
+25. Top 6 Release Notes Templates \- Notion, accessed November 26, 2025, [https://www.notion.com/templates/collections/top-6-release-notes-templates-in-notion](https://www.notion.com/templates/collections/top-6-release-notes-templates-in-notion)  
+26. Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations \- NIST Technical Series Publications, accessed November 26, 2025, [https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-161r1.pdf](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-161r1.pdf)  
+27. Changelog \- Kube-rs, accessed November 26, 2025, [https://kube.rs/changelog/](https://kube.rs/changelog/)  
+28. rust\_releases \- Rust \- Docs.rs, accessed November 26, 2025, [https://docs.rs/rust-releases](https://docs.rs/rust-releases)  
+29. There and back again: A software versioning story \- AboutCode, accessed November 26, 2025, [https://aboutcode.org/2022/software-versioning/](https://aboutcode.org/2022/software-versioning/)  
+30. Guide to software release versioning best practices \- LaunchDarkly, accessed November 26, 2025, [https://launchdarkly.com/blog/software-release-versioning/](https://launchdarkly.com/blog/software-release-versioning/)  
+31. Versioning \- Python Packaging User Guide, accessed November 26, 2025, [https://packaging.python.org/en/latest/discussions/versioning/](https://packaging.python.org/en/latest/discussions/versioning/)  
+32. Software versioning \- Wikipedia, accessed November 26, 2025, [https://en.wikipedia.org/wiki/Software\_versioning](https://en.wikipedia.org/wiki/Software_versioning)  
+33. Software Versioning Best Practices: Creating an Effective System \- Thales, accessed November 26, 2025, [https://cpl.thalesgroup.com/software-monetization/software-versioning-basics](https://cpl.thalesgroup.com/software-monetization/software-versioning-basics)  
+34. How to Write Release Notes Your Users Will Actually Read \- ProductPlan, accessed November 26, 2025, [https://www.productplan.com/learn/release-notes-best-practices/](https://www.productplan.com/learn/release-notes-best-practices/)  
+35. What's new in Red Hat OpenShift, accessed November 26, 2025, [https://www.redhat.com/en/whats-new-red-hat-openshift](https://www.redhat.com/en/whats-new-red-hat-openshift)  
+36. Vulnerability Response release notes \- ServiceNow, accessed November 26, 2025, [https://www.servicenow.com/docs/bundle/store-release-notes/page/release-notes/store/security-operations/store-secops-rn-vulnerability-response.html](https://www.servicenow.com/docs/bundle/store-release-notes/page/release-notes/store/security-operations/store-secops-rn-vulnerability-response.html)  
+37. Understanding Docs-as-code: A Simpler Way To Manage Technical Documentation., accessed November 26, 2025, [https://medium.com/@fohlabi/understanding-docs-as-code-a-simpler-way-to-manage-technical-documentation-1b21195e3b19](https://medium.com/@fohlabi/understanding-docs-as-code-a-simpler-way-to-manage-technical-documentation-1b21195e3b19)  
+38. Conventional Commits, accessed November 26, 2025, [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/)  
+39. conventional-changelog/conventional-changelog: Generate changelogs and release notes from a project's commit messages and metadata. \- GitHub, accessed November 26, 2025, [https://github.com/conventional-changelog/conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)  
+40. Automatically generated release notes \- GitHub Docs, accessed November 26, 2025, [https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)  
+41. CI/CD baseline architecture with Azure Pipelines \- Microsoft Learn, accessed November 26, 2025, [https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops](https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops)  
+42. Reduce project delays with a docs-as-code solution | Integration & Automation \- AWS, accessed November 26, 2025, [https://aws.amazon.com/blogs/infrastructure-and-automation/reduce-project-delays-with-docs-as-code-solution/](https://aws.amazon.com/blogs/infrastructure-and-automation/reduce-project-delays-with-docs-as-code-solution/)  
+43. GitSage: An AI Agent for Automated Release Notes \- Practical Engineer, accessed November 26, 2025, [https://practical-engineer.ai/gitsage-an-ai-agent-for-automated-release-notes/](https://practical-engineer.ai/gitsage-an-ai-agent-for-automated-release-notes/)  
+44. Designing for Web Accessibility – Tips for Getting Started \- W3C, accessed November 26, 2025, [https://www.w3.org/WAI/tips/designing/](https://www.w3.org/WAI/tips/designing/)  
+45. Fact Sheet: New Rule on the Accessibility of Web Content and Mobile Apps Provided by State and Local Governments | ADA.gov, accessed November 26, 2025, [https://www.ada.gov/resources/2024-03-08-web-rule/](https://www.ada.gov/resources/2024-03-08-web-rule/)  
+46. A Designer's Guide to Documenting Accessibility & User Interactions by Stéphanie Walter, accessed November 26, 2025, [https://stephaniewalter.design/blog/a-designers-guide-to-documenting-accessibility-user-interactions/](https://stephaniewalter.design/blog/a-designers-guide-to-documenting-accessibility-user-interactions/)  
+47. Accessibility release notes \- Docebo Help, accessed November 26, 2025, [https://help.docebo.com/hc/en-us/articles/5015523990034-Accessibility-release-notes](https://help.docebo.com/hc/en-us/articles/5015523990034-Accessibility-release-notes)  
+48. How To Write Release Notes (Best Practices \+ Examples And More) \- Changelogfy, accessed November 26, 2025, [https://changelogfy.com/blog/write-release-notes-best-practices/](https://changelogfy.com/blog/write-release-notes-best-practices/)  
+49. How to Write Release Notes: 23 Tips, Tools, and Examples, accessed November 26, 2025, [https://frill.co/blog/posts/how-to-write-release-notes](https://frill.co/blog/posts/how-to-write-release-notes)  
+50. SUAppcastItem Class Reference \- Sparkle Project, accessed November 26, 2025, [https://sparkle-project.org/documentation/api-reference/Classes/SUAppcastItem.html](https://sparkle-project.org/documentation/api-reference/Classes/SUAppcastItem.html)  
+51. Appcast/Sparkle XML Feed \- DBLSQD, accessed November 26, 2025, [https://www.dblsqd.com/docs/feeds/appcast](https://www.dblsqd.com/docs/feeds/appcast)  
+52. Coordinated Vulnerability Disclosure Program \- CISA, accessed November 26, 2025, [https://www.cisa.gov/resources-tools/programs/coordinated-vulnerability-disclosure-program](https://www.cisa.gov/resources-tools/programs/coordinated-vulnerability-disclosure-program)  
+53. Vulnerability Disclosure \- OWASP Cheat Sheet Series, accessed November 26, 2025, [https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability\_Disclosure\_Cheat\_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html)  
+54. How should we announce vulnerabilities in our application? \- Information Security Stack Exchange, accessed November 26, 2025, [https://security.stackexchange.com/questions/47617/how-should-we-announce-vulnerabilities-in-our-application](https://security.stackexchange.com/questions/47617/how-should-we-announce-vulnerabilities-in-our-application)  
+55. App Review Guidelines \- Apple Developer, accessed November 26, 2025, [https://developer.apple.com/app-store/review/guidelines/](https://developer.apple.com/app-store/review/guidelines/)
\ No newline at end of file
diff --git a/rust-context-gen/Cargo.lock b/rust-context-gen/Cargo.lock
new file mode 100644
index 0000000..cd29410
--- /dev/null
+++ b/rust-context-gen/Cargo.lock
@@ -0,0 +1,193 @@
+# This file is automatically @generated by Cargo.
+# It is not intended for manual editing.
+version = 4
+
+[[package]]
+name = "anstream"
+version = "0.6.21"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "43d5b281e737544384e969a5ccad3f1cdd24b48086a0fc1b2a5262a26b8f4f4a"
+dependencies = [
+ "anstyle",
+ "anstyle-parse",
+ "anstyle-query",
+ "anstyle-wincon",
+ "colorchoice",
+ "is_terminal_polyfill",
+ "utf8parse",
+]
+
+[[package]]
+name = "anstyle"
+version = "1.0.13"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "5192cca8006f1fd4f7237516f40fa183bb07f8fbdfedaa0036de5ea9b0b45e78"
+
+[[package]]
+name = "anstyle-parse"
+version = "0.2.7"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "4e7644824f0aa2c7b9384579234ef10eb7efb6a0deb83f9630a49594dd9c15c2"
+dependencies = [
+ "utf8parse",
+]
+
+[[package]]
+name = "anstyle-query"
+version = "1.1.5"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "40c48f72fd53cd289104fc64099abca73db4166ad86ea0b4341abe65af83dadc"
+dependencies = [
+ "windows-sys",
+]
+
+[[package]]
+name = "anstyle-wincon"
+version = "3.0.11"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "291e6a250ff86cd4a820112fb8898808a366d8f9f58ce16d1f538353ad55747d"
+dependencies = [
+ "anstyle",
+ "once_cell_polyfill",
+ "windows-sys",
+]
+
+[[package]]
+name = "anyhow"
+version = "1.0.100"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "a23eb6b1614318a8071c9b2521f36b424b2c83db5eb3a0fead4a6c0809af6e61"
+
+[[package]]
+name = "clap"
+version = "4.5.53"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "c9e340e012a1bf4935f5282ed1436d1489548e8f72308207ea5df0e23d2d03f8"
+dependencies = [
+ "clap_builder",
+ "clap_derive",
+]
+
+[[package]]
+name = "clap_builder"
+version = "4.5.53"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "d76b5d13eaa18c901fd2f7fca939fefe3a0727a953561fefdf3b2922b8569d00"
+dependencies = [
+ "anstream",
+ "anstyle",
+ "clap_lex",
+ "strsim",
+]
+
+[[package]]
+name = "clap_derive"
+version = "4.5.49"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "2a0b5487afeab2deb2ff4e03a807ad1a03ac532ff5a2cee5d86884440c7f7671"
+dependencies = [
+ "heck",
+ "proc-macro2",
+ "quote",
+ "syn",
+]
+
+[[package]]
+name = "clap_lex"
+version = "0.7.6"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "a1d728cc89cf3aee9ff92b05e62b19ee65a02b5702cff7d5a377e32c6ae29d8d"
+
+[[package]]
+name = "colorchoice"
+version = "1.0.4"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "b05b61dc5112cbb17e4b6cd61790d9845d13888356391624cbe7e41efeac1e75"
+
+[[package]]
+name = "heck"
+version = "0.5.0"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "2304e00983f87ffb38b55b444b5e3b60a884b5d30c0fca7d82fe33449bbe55ea"
+
+[[package]]
+name = "is_terminal_polyfill"
+version = "1.70.2"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "a6cb138bb79a146c1bd460005623e142ef0181e3d0219cb493e02f7d08a35695"
+
+[[package]]
+name = "once_cell_polyfill"
+version = "1.70.2"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "384b8ab6d37215f3c5301a95a4accb5d64aa607f1fcb26a11b5303878451b4fe"
+
+[[package]]
+name = "proc-macro2"
+version = "1.0.103"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "5ee95bc4ef87b8d5ba32e8b7714ccc834865276eab0aed5c9958d00ec45f49e8"
+dependencies = [
+ "unicode-ident",
+]
+
+[[package]]
+name = "quote"
+version = "1.0.42"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "a338cc41d27e6cc6dce6cefc13a0729dfbb81c262b1f519331575dd80ef3067f"
+dependencies = [
+ "proc-macro2",
+]
+
+[[package]]
+name = "rust-context-gen"
+version = "0.1.0"
+dependencies = [
+ "anyhow",
+ "clap",
+]
+
+[[package]]
+name = "strsim"
+version = "0.11.1"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "7da8b5736845d9f2fcb837ea5d9e2628564b3b043a70948a3f0b778838c5fb4f"
+
+[[package]]
+name = "syn"
+version = "2.0.111"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "390cc9a294ab71bdb1aa2e99d13be9c753cd2d7bd6560c77118597410c4d2e87"
+dependencies = [
+ "proc-macro2",
+ "quote",
+ "unicode-ident",
+]
+
+[[package]]
+name = "unicode-ident"
+version = "1.0.22"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "9312f7c4f6ff9069b165498234ce8be658059c6728633667c526e27dc2cf1df5"
+
+[[package]]
+name = "utf8parse"
+version = "0.2.2"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "06abde3611657adf66d383f00b093d7faecc7fa57071cce2578660c9f1010821"
+
+[[package]]
+name = "windows-link"
+version = "0.2.1"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "f0805222e57f7521d6a62e36fa9163bc891acd422f971defe97d64e70d0a4fe5"
+
+[[package]]
+name = "windows-sys"
+version = "0.61.2"
+source = "registry+https://github.com/rust-lang/crates.io-index"
+checksum = "ae137229bcbd6cdf0f7b80a31df61766145077ddf49416a728b02cb3921ff3fc"
+dependencies = [
+ "windows-link",
+]
diff --git a/rust-context-gen/Cargo.toml b/rust-context-gen/Cargo.toml
new file mode 100644
index 0000000..3ab8878
--- /dev/null
+++ b/rust-context-gen/Cargo.toml
@@ -0,0 +1,8 @@
+[package]
+name = "rust-context-gen"
+version = "0.1.0"
+edition = "2024"
+
+[dependencies]
+clap = { version = "4.5.3", features = ["derive"] }
+anyhow = "1.0.100"
diff --git a/rust-context-gen/src/main.rs b/rust-context-gen/src/main.rs
new file mode 100644
index 0000000..4be2f4a
--- /dev/null
+++ b/rust-context-gen/src/main.rs
@@ -0,0 +1,124 @@
+use clap::Parser;
+use std::process::Command;
+use std::fs;
+use anyhow::{Result, Context};
+
+#[derive(Parser, Debug)]
+#[command(author, version, about, long_about = None)]
+struct Args {
+    /// Start Commit Hash
+    #[arg(long)]
+    start: String,
+
+    /// End Commit Hash
+    #[arg(long)]
+    end: String,
+
+    /// Path to Adhoc Notes Markdown file
+    #[arg(long)]
+    notes: Option<String>,
+
+    /// Output filename
+    #[arg(long, default_value = "release_context.md")]
+    output: String,
+}
+
+fn run_git_command(args: &[&str]) -> Result<String> {
+    let output = Command::new("git")
+        .args(args)
+        .output()
+        .context(format!("Failed to execute git command: {:?}", args))?;
+
+    if output.status.success() {
+        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
+    } else {
+        anyhow::bail!(
+            "Git command failed: {:?}\nStdout: {}\nStderr: {}",
+            args,
+            String::from_utf8_lossy(&output.stdout),
+            String::from_utf8_lossy(&output.stderr)
+        );
+    }
+}
+
+fn read_notes(file_path: Option<&String>) -> Result<String> {
+    match file_path {
+        Some(path) => {
+            if fs::metadata(path).is_err() {
+                eprintln!("Warning: Notes file '{}' not found.", path);
+                Ok("No adhoc notes provided (File not found).".to_string())
+            } else {
+                fs::read_to_string(path).context(format!("Failed to read notes file: {}", path))
+            }
+        },
+        None => Ok("No adhoc notes provided.".to_string()),
+    }
+}
+
+fn get_git_log(start: &str, end: &str) -> Result<String> {
+    let range = format!("{}..{}", start, end);
+    run_git_command(&["log", "--pretty=format:- %s", &range])
+}
+
+fn get_git_diff(start: &str, end: &str) -> Result<String> {
+    let range = format!("{}..{}", start, end);
+    let mut cmd_args = vec![
+        "diff",
+        &range,
+        "--",
+        ".",
+    ];
+
+    let excludes = [
+        ":(exclude)package-lock.json",
+        ":(exclude)yarn.lock",
+        ":(exclude)*.png",
+        ":(exclude)*.jpg",
+        ":(exclude)*.jpeg",
+        ":(exclude)*.gif",
+        ":(exclude)*.svg",
+        ":(exclude)*.ico",
+        ":(exclude)__pycache__",
+        ":(exclude)*.pyc",
+        ":(exclude)node_modules",
+        ":(exclude).git",
+    ];
+
+    for exclude in excludes.iter() {
+        cmd_args.push(exclude);
+    }
+    
+    run_git_command(&cmd_args)
+}
+
+fn main() -> Result<()> {
+    let args = Args::parse();
+
+    println!("Generating context from {} to {}...", args.start, args.end);
+
+    let notes_content = read_notes(args.notes.as_ref())?;
+    let log_content = get_git_log(&args.start, &args.end)?;
+    let diff_content = get_git_diff(&args.start, &args.end)?;
+
+    let final_output = format!(
+        r###"# Release Context
+
+## Strategic Context / Adhoc Notes
+{}\n
+## Commit History
+{}\n
+## Code Changes
+```diff
+{}\n```"###,
+        notes_content,
+        log_content,
+        diff_content
+    );
+
+    fs::write(&args.output, final_output)
+        .context(format!("Failed to write output to {}", args.output))?;
+
+    println!("Successfully wrote context to {}", args.output);
+
+    Ok(())
+}
\ No newline at end of file
diff --git a/src/__init__.py b/src/__init__.py
new file mode 100644
index 0000000..e69de29
diff --git a/src/generate_context.py b/src/generate_context.py
new file mode 100644
index 0000000..dac9588
--- /dev/null
+++ b/src/generate_context.py
@@ -0,0 +1,108 @@
+import argparse
+import subprocess
+import sys
+import os
+
+def parse_arguments():
+    parser = argparse.ArgumentParser(description="Generate release context from git history.")
+    parser.add_argument("--start", required=True, help="Start Commit Hash")
+    parser.add_argument("--end", required=True, help="End Commit Hash")
+    parser.add_argument("--notes", help="Path to Adhoc Notes Markdown file")
+    parser.add_argument("--output", default="release_context.md", help="Output filename")
+    return parser.parse_args()
+
+def run_git_command(args):
+    try:
+        result = subprocess.run(
+            args,
+            check=True,
+            stdout=subprocess.PIPE,
+            stderr=subprocess.PIPE,
+            text=True,
+            encoding='utf-8'
+        )
+        return result.stdout.strip()
+    except subprocess.CalledProcessError as e:
+        print(f"Error running git command: {' '.join(args)}\n{e.stderr}", file=sys.stderr)
+        sys.exit(1)
+
+def read_notes(file_path):
+    if not file_path:
+        return "No adhoc notes provided."
+    
+    if not os.path.exists(file_path):
+        print(f"Warning: Notes file '{file_path}' not found.", file=sys.stderr)
+        return "No adhoc notes provided (File not found)."
+        
+    try:
+        with open(file_path, 'r', encoding='utf-8') as f:
+            return f.read()
+    except Exception as e:
+        print(f"Error reading notes file: {e}", file=sys.stderr)
+        return f"Error reading notes file: {e}"
+
+def get_git_log(start, end):
+    # git log --pretty=format:"- %s" start..end
+    cmd = ['git', 'log', '--pretty=format:- %s', f'{start}..{end}']
+    return run_git_command(cmd)
+
+def get_git_diff(start, end):
+    # git diff start..end -- . ':(exclude)package-lock.json' ...
+    excludes = [
+        ':(exclude)package-lock.json',
+        ':(exclude)yarn.lock',
+        ':(exclude)*.png',
+        ':(exclude)*.jpg',
+        ':(exclude)*.jpeg',
+        ':(exclude)*.gif',
+        ':(exclude)*.svg',
+        ':(exclude)*.ico',
+        ':(exclude)__pycache__',
+        ':(exclude)*.pyc',
+        ':(exclude)node_modules',
+        ':(exclude).git'
+    ]
+    
+    cmd = ['git', 'diff', f'{start}..{end}', '--', '.'] + excludes
+    return run_git_command(cmd)
+
+def main():
+    args = parse_arguments()
+    
+    print(f"Generating context from {args.start} to {args.end}...")
+    
+    # 1. Read Notes
+    notes_content = read_notes(args.notes)
+    
+    # 2. Get Log
+    log_content = get_git_log(args.start, args.end)
+    
+    # 3. Get Diff
+    diff_content = get_git_diff(args.start, args.end)
+    
+    # 4. Assemble Output
+    final_output = f"""# Release Context
+
+## Strategic Context / Adhoc Notes
+{notes_content}
+
+## Commit History
+{log_content}
+
+## Code Changes
+```diff
+{diff_content}
+```
+"""
+    
+    # 5. Write File
+    try:
+        with open(args.output, 'w', encoding='utf-8') as f:
+            f.write(final_output)
+        print(f"Successfully wrote context to {args.output}")
+    except Exception as e:
+        print(f"Error writing output file: {e}", file=sys.stderr)
+        sys.exit(1)
+
+if __name__ == "__main__":
+    main()
```