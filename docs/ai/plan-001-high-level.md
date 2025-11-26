### Part 1: High-Level Extraction Plan

To feed the AI effectively, you need a single "context file" that is clean and organized. You should not just dump raw terminal output; you need to structure it using Markdown headers so the AI knows where the **User Notes** end and the **Raw Code** begins.

**The Script Logic (Python):**

1.  **Define Inputs:** Accept `Start_Commit_Hash`, `End_Commit_Hash`, and `Adhoc_Notes_File`.
2.  **Initialize Output:** Create `release_context.md`.
3.  **Inject User Context:** Read the `Adhoc_Notes_File` and append it to `release_context.md` under a `## Strategic Context / Adhoc Notes` header.
4.  **Inject Commit Messages:** Run `git log` between the two hashes.
    - _Tip:_ Use a pretty format to strip out dates/authors if irrelevant, focusing on the message.
    - _Command:_ `git log --pretty=format:"- %s" start..end >> release_context.md`
5.  **Inject Diffs (The Heavy Lifting):** Run `git diff` between the hashes.
    - _Crucial Step:_ You must exclude "noise" files (lock files, assets, binary files) to prevent the AI from hallucinating on 5,000 lines of `package-lock.json`.
    - _Command:_ `git diff start..end -- . ':(exclude)package-lock.json' ':(exclude)*.png' >> release_context.md`
6.  **Final Polish:** Wrap the diff output in triple backticks (\`\`\`) in the Markdown file so the AI processes it as a code block.

---

### Part 2: The "Release Notes Generator" Prompt

Copy and paste the text below into your AI model (ChatGPT, Claude, Gemini). This prompt is engineered to filter out technical noise and produce customer-ready content.

**Subject:** Release Notes Generation Prompt

```markdown
# Role

You are an expert Technical Product Manager and Communications Lead. Your goal is to draft clean, professional, and customer-facing release notes based on raw technical data.

# Input Data

I will provide you with a single Markdown document containing three sections:

1. **Adhoc Notes:** specific points I want to emphasize or marketing language I want included.
2. **Commit Logs:** A list of git commit messages.
3. **The Diff:** The raw code changes between two versions.

# Instructions

Analyze the provided input and generate a release notes summary. You must adhere to the following rules:

1.  **Filter Internal Noise:** Ignore changes related to CI/CD pipelines, build configurations, refactoring, unit tests, or dependency updates (unless they strictly impact performance/security). Focus ONLY on what affects the end-user.
2.  **Translate to "User Benefit":** Do not describe _what_ changed in the code; describe _why_ it matters to the user.
    - _Bad:_ "Updated UserSchema to include preferred_name field."
    - _Good:_ "Users can now set a Preferred Name in their profile settings."
3.  **Prioritize Adhoc Notes:** If I have included specific instructions or high-level summaries in the "Adhoc Notes" section, these take precedence over the raw diffs. Use the diffs to flesh out the details of those notes.
4.  **Categorization:** Group the notes into these headers:
    - 🚀 **New Features** (Significant additions)
    - ✨ **Improvements** (Tweaks to existing features, performance upgrades)
    - 🐛 **Bug Fixes** (Corrections to broken behavior)
5.  **Tone:** Professional, concise, and encouraging. Avoid passive voice.

# Output Format

Please output the release notes in the following Markdown structure:

## [Release Version/Date]

### Executive Summary

(A 2-3 sentence summary of the main theme of this release).

### 🚀 New Features

- **[Feature Name]:** [Description of value]

### ✨ Improvements

- **[Improvement]:** [Description]

### 🐛 Bug Fixes

- [Description of fix]

---

**Data to Process:**

[PASTE YOUR GENERATED TEXT FILE CONTENT HERE]
```

---

### Part 3: Why this prompt works (Best Practices)

- **Role Definition:** Assigning the "Product Manager" persona prevents the AI from acting like a "Senior Developer." A developer writes "Refactored API endpoint"; a PM writes "Faster load times."
- **Negative Constraints:** Explicitly telling the AI to _ignore_ CI/CD and refactors is critical. Without this, your release notes will be cluttered with "Updated GitHub Actions workflow," which customers don't care about.
- **Hierarchy of Truth:** The prompt explicitly states that **Adhoc Notes \> Raw Code**. This allows you to guide the narrative manually while letting the AI do the grunt work of digging up the details from the code.
