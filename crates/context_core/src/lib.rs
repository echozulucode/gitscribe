use std::process::Command;
use std::fs;
use std::path::Path;
use anyhow::{Result, Context, bail};
use serde_json::json;

pub fn run_git_command(args: &[&str], cwd: Option<&Path>) -> Result<String> {
    let mut cmd = Command::new("git");
    cmd.args(args);
    if let Some(path) = cwd {
        cmd.current_dir(path);
    }
    
    let output = cmd.output()
        .context(format!("Failed to execute git command: {:?}", args))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        bail!(
            "Git command failed: {:?}\nStdout: {}\nStderr: {}",
            args,
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }
}

pub fn read_file_content(file_path: Option<&String>, description: &str) -> Result<Option<String>> {
    match file_path {
        Some(path) => {
            if fs::metadata(path).is_err() {
                eprintln!("Warning: {} '{}' not found.", description, path);
                Ok(None)
            } else {
                let content = fs::read_to_string(path)
                    .context(format!("Failed to read {} file: {}", description, path))?;
                Ok(Some(content))
            }
        },
        None => Ok(None),
    }
}

pub fn get_git_log(start: &str, end: &str, cwd: Option<&Path>) -> Result<String> {
    let range = format!("{}..{}", start, end);
    run_git_command(&["log", "--pretty=format:- %s", &range], cwd)
}

pub fn get_git_diff(start: &str, end: &str, cwd: Option<&Path>) -> Result<String> {
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
    
    run_git_command(&cmd_args, cwd)
}

pub fn list_git_refs(cwd: Option<&Path>) -> Result<Vec<String>> {
    let output = run_git_command(&["for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/tags"], cwd)?;
    Ok(output.lines().map(|s| s.to_string()).collect())
}

pub fn generate_context(start: &str, end: &str, notes: Option<String>, cwd: Option<&Path>) -> Result<String> {
    let notes_content = notes.unwrap_or_else(|| "No adhoc notes provided.".to_string());
    let log_content = get_git_log(start, end, cwd)?;
    let diff_content = get_git_diff(start, end, cwd)?;

    Ok(format!(
        r###"# Release Context

## Strategic Context / Adhoc Notes
{}

## Commit History
{}

## Code Changes
```diff
{}
```"###,
        notes_content,
        log_content,
        diff_content
    ))
}

pub fn call_ollama(
    model: &str,
    url: &str,
    prompt: &str,
    system: Option<&String>
) -> Result<String> {
    let client = reqwest::blocking::Client::new();
    
    let mut payload = json!({
        "model": model,
        "stream": false,
        "prompt": prompt
    });

    if let Some(sys_msg) = system {
        payload["system"] = json!(sys_msg);
    }

    println!("Connecting to Ollama ({}) with model '{}'...", url, model);

    let res = client.post(url)
        .json(&payload)
        .send()
        .context("Failed to send request to Ollama")?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().unwrap_or_default();
        bail!("Ollama API error ({}): {}", status, text);
    }

    let response_json: serde_json::Value = res.json().context("Failed to parse Ollama JSON response")?;
    
    response_json["response"]
        .as_str()
        .map(|s| s.to_string())
        .context("Ollama response missing 'response' field")
}