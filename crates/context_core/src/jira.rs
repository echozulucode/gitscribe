use serde::Deserialize;
use anyhow::Result;
use reqwest::Client;
use regex::Regex;
use std::collections::HashSet;

#[derive(Clone, Debug)]
pub struct JiraConfig {
    pub url: String,
    pub pat: String,
}

#[derive(Debug, Deserialize)]
struct JiraIssueFields {
    summary: String,
    status: JiraStatus,
    issuetype: JiraType,
}

#[derive(Debug, Deserialize)]
struct JiraStatus {
    name: String,
}

#[derive(Debug, Deserialize)]
struct JiraType {
    name: String,
}

#[derive(Debug, Deserialize)]
struct JiraApiResponse {
    key: String,
    fields: JiraIssueFields,
}

#[derive(Debug)]
pub struct JiraIssue {
    pub key: String,
    pub summary: String,
    pub status: String,
    pub issue_type: String,
}

pub fn extract_issue_keys(text: &str) -> Vec<String> {
    // Matches patterns like PROJ-123, ARC-404
    let re = Regex::new(r"\b[A-Z][A-Z0-9]+-\d+\b").unwrap();
    let mut keys = HashSet::new();
    
    for cap in re.captures_iter(text) {
        keys.insert(cap[0].to_string());
    }
    
    let mut sorted_keys: Vec<String> = keys.into_iter().collect();
    sorted_keys.sort();
    sorted_keys
}

pub async fn fetch_issue(client: &Client, config: &JiraConfig, key: &str) -> Result<Option<JiraIssue>> {
    let base_url = config.url.trim_end_matches('/');
    let url = format!("{}/rest/api/2/issue/{}", base_url, key);

    println!("Fetching Jira issue: {}", key);

    let res = client.get(&url)
        .header("Authorization", format!("Bearer {}", config.pat))
        .header("Accept", "application/json")
        .send()
        .await;

    match res {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<JiraApiResponse>().await {
                    Ok(api_resp) => Ok(Some(JiraIssue {
                        key: api_resp.key,
                        summary: api_resp.fields.summary,
                        status: api_resp.fields.status.name,
                        issue_type: api_resp.fields.issuetype.name,
                    })),
                    Err(e) => {
                        println!("Failed to parse Jira response for {}: {}", key, e);
                        Ok(None)
                    }
                }
            } else {
                println!("Jira request failed for {} (Status: {})", key, response.status());
                Ok(None)
            }
        },
        Err(e) => {
            println!("Jira connection error for {}: {}", key, e);
            Ok(None)
        }
    }
}
