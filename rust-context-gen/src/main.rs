use clap::Parser;
use std::process::Command;
use std::fs;
use anyhow::{Result, Context};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Start Commit Hash
    #[arg(long)]
    start: String,

    /// End Commit Hash
    #[arg(long)]
    end: String,

    /// Path to Adhoc Notes Markdown file
    #[arg(long)]
    notes: Option<String>,

    /// Output filename
    #[arg(long, default_value = "release_context.md")]
    output: String,
}

fn run_git_command(args: &[&str]) -> Result<String> {
    let output = Command::new("git")
        .args(args)
        .output()
        .context(format!("Failed to execute git command: {:?}", args))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        anyhow::bail!(
            "Git command failed: {:?}\nStdout: {}\nStderr: {}",
            args,
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }
}

fn read_notes(file_path: Option<&String>) -> Result<String> {
    match file_path {
        Some(path) => {
            if fs::metadata(path).is_err() {
                eprintln!("Warning: Notes file '{}' not found.", path);
                Ok("No adhoc notes provided (File not found).".to_string())
            } else {
                fs::read_to_string(path).context(format!("Failed to read notes file: {}", path))
            }
        },
        None => Ok("No adhoc notes provided.".to_string()),
    }
}

fn get_git_log(start: &str, end: &str) -> Result<String> {
    let range = format!("{}..{}", start, end);
    run_git_command(&["log", "--pretty=format:- %s", &range])
}

fn get_git_diff(start: &str, end: &str) -> Result<String> {
    let range = format!("{}..{}", start, end);
    let mut cmd_args = vec![
        "diff",
        &range,
        "--",
        ".",
    ];

    let excludes = [
        ":(exclude)package-lock.json",
        ":(exclude)yarn.lock",
        ":(exclude)*.png",
        ":(exclude)*.jpg",
        ":(exclude)*.jpeg",
        ":(exclude)*.gif",
        ":(exclude)*.svg",
        ":(exclude)*.ico",
        ":(exclude)__pycache__",
        ":(exclude)*.pyc",
        ":(exclude)node_modules",
        ":(exclude).git",
    ];

    for exclude in excludes.iter() {
        cmd_args.push(exclude);
    }
    
    run_git_command(&cmd_args)
}

fn main() -> Result<()> {
    let args = Args::parse();

    println!("Generating context from {} to {}...", args.start, args.end);

    let notes_content = read_notes(args.notes.as_ref())?;
    let log_content = get_git_log(&args.start, &args.end)?;
    let diff_content = get_git_diff(&args.start, &args.end)?;

    let final_output = format!(
        r###"# Release Context

## Strategic Context / Adhoc Notes
{}\n
## Commit History
{}\n
## Code Changes
```diff
{}\n```"###,
        notes_content,
        log_content,
        diff_content
    );

    fs::write(&args.output, final_output)
        .context(format!("Failed to write output to {}", args.output))?;

    println!("Successfully wrote context to {}", args.output);

    Ok(())
}