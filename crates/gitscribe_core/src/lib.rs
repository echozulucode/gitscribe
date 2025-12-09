use anyhow::{bail, Context, Result};
use futures::StreamExt;
use serde_json::json;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::time::Duration;

pub mod jira;

pub fn run_git_command(args: &[&str], cwd: Option<&Path>) -> Result<String> {
    let mut cmd = Command::new("git");
    cmd.args(args);
    if let Some(path) = cwd {
        cmd.current_dir(path);
    }

    let output = cmd
        .output()
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
        }
        None => Ok(None),
    }
}

pub fn get_git_log(start: &str, end: &str, cwd: Option<&Path>) -> Result<String> {
    let range = format!("{}..{}", start, end);
    run_git_command(&["log", "--pretty=format:- %s", &range], cwd)
}

pub fn get_git_diff(start: &str, end: &str, cwd: Option<&Path>) -> Result<String> {
    let range = format!("{}..{}", start, end);
    let mut cmd_args = vec!["diff", &range, "--", "."];

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
    let output = run_git_command(
        &[
            "for-each-ref",
            "--format=%(refname:short)",
            "refs/heads",
            "refs/tags",
        ],
        cwd,
    )?;
    Ok(output.lines().map(|s| s.to_string()).collect())
}

pub async fn generate_context(
    start: &str,
    end: &str,
    notes: Option<String>,
    cwd: Option<&Path>,
    jira_config: Option<jira::JiraConfig>,
) -> Result<String> {
    let notes_content = notes.unwrap_or_else(|| "No adhoc notes provided.".to_string());
    let log_content = get_git_log(start, end, cwd)?;
    let diff_content = get_git_diff(start, end, cwd)?;

    let mut jira_section = String::new();

    if let Some(config) = jira_config {
        let keys = jira::extract_issue_keys(&log_content);
        if !keys.is_empty() {
            let client = reqwest::Client::new();

            let fetches = futures::stream::iter(keys)
                .map(|key| {
                    let client = &client;
                    let config = &config;
                    async move { jira::fetch_issue(client, config, &key).await }
                })
                .buffer_unordered(5) // Concurrency limit
                .collect::<Vec<_>>()
                .await;

            let mut issue_sections = String::new();
            for res in fetches {
                if let Ok(Some(issue)) = res {
                    let comments_text = if issue.comments.is_empty() {
                        "No comments.".to_string()
                    } else {
                        issue
                            .comments
                            .iter()
                            .map(|c| format!("- {}", c.replace('\n', "\n  ")))
                            .collect::<Vec<_>>()
                            .join("\n")
                    };

                    issue_sections.push_str(&format!(
                        "### {} {}\n**Type:** {} | **Status:** {}\n\n**Description:**\n{}\n\n**Comments:**\n{}\n\n---\n",
                        issue.key,
                        issue.summary,
                        issue.issue_type,
                        issue.status,
                        issue.description.as_deref().unwrap_or("No description provided."),
                        comments_text
                    ));
                }
            }

            if !issue_sections.is_empty() {
                jira_section = format!("\n## Linked Jira Issues\n\n{}", issue_sections);
            }
        }
    }

    Ok(format!(
        r###"# Release Context

## Strategic Context / Adhoc Notes
{}
{}
## Commit History
{}

## Code Changes
```diff
{}
```"###,
        notes_content, jira_section, log_content, diff_content
    ))
}

pub async fn call_ollama<F>(
    model: &str,
    url: &str,
    prompt: &str,
    system: Option<&String>,
    callback: Option<F>,
) -> Result<String>
where
    F: Fn(&str) + Send + Sync + 'static,
{
    // Increase timeout to 5 minutes (300s) for large models
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(300))
        .build()
        .context("Failed to build HTTP client")?;

    let stream = callback.is_some();

    let mut payload = json!({
        "model": model,
        "stream": stream,
        "prompt": prompt
    });

    if let Some(sys_msg) = system {
        payload["system"] = json!(sys_msg);
    }

    println!(
        "Connecting to Ollama ({}) with model '{}' (Streaming: {})...",
        url, model, stream
    );

    let res = client
        .post(url)
        .json(&payload)
        .send()
        .await
        .context("Failed to send request to Ollama")?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        bail!("Ollama API error ({}): {}", status, text);
    }

    if let Some(cb) = callback {
        // Streaming Mode
        let mut full_response = String::new();
        let mut stream = res.bytes_stream();

        while let Some(item) = stream.next().await {
            let chunk = item.context("Error reading stream chunk")?;
            let chunk_str = String::from_utf8_lossy(&chunk);

            // Parse JSON chunk (Ollama sends multiple JSON objects in stream)
            // Often partial chunks arrive, but reqwest bytes_stream usually gives full chunks or we need to buffer line by line.
            // Ollama stream format is one JSON object per line.
            for line in chunk_str.split('\n') {
                if line.trim().is_empty() {
                    continue;
                }
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                    if let Some(token) = json["response"].as_str() {
                        full_response.push_str(token);
                        cb(token);
                    }
                    if json["done"].as_bool().unwrap_or(false) {
                        break;
                    }
                }
            }
        }
        Ok(full_response)
    } else {
        // Non-Streaming Mode
        let response_json: serde_json::Value = res
            .json()
            .await
            .context("Failed to parse Ollama JSON response")?;
        response_json["response"]
            .as_str()
            .map(|s| s.to_string())
            .context("Ollama response missing 'response' field")
    }
}

pub async fn list_ollama_models(base_url: &str) -> Result<Vec<String>> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/tags", base_url.trim_end_matches('/'));

    let res = client
        .get(&url)
        .send()
        .await
        .context("Failed to connect to Ollama. Is it running?")?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        bail!("Ollama API error ({}): {}", status, text);
    }

    let response_json: serde_json::Value = res
        .json()
        .await
        .context("Failed to parse Ollama JSON response")?;

    let models = response_json["models"]
        .as_array()
        .context("Invalid response: 'models' field missing or not an array")?
        .iter()
        .filter_map(|m| m["name"].as_str().map(|s| s.to_string()))
        .collect();

    Ok(models)
}
