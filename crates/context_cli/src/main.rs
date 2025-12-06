use clap::Parser;
use std::fs;
use anyhow::{Result, Context};
use context_core::{read_file_content, generate_context, call_ollama};

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

    /// Output filename (default: release_context.md or release_notes.md if ollama is used)
    #[arg(long)]
    output: Option<String>,

    /// Path to a System Prompt file (e.g., release-notes-prompt.md)
    /// If provided, this is prepended to the context.
    #[arg(long)]
    system_prompt: Option<String>,

    /// Ollama Model name (e.g., "llama3", "mistral").
    /// If provided, the tool will generate release notes using this model.
    #[arg(long)]
    ollama_model: Option<String>,

    /// Ollama API URL
    #[arg(long, default_value = "http://localhost:11434/api/generate")]
    ollama_url: String,
}

fn main() -> Result<()> {
    let args = Args::parse();

    println!("Generating context from {} to {}...", args.start, args.end);

    // 1. Read Input Files
    let notes_content = read_file_content(args.notes.as_ref(), "Notes")?;
    let system_prompt_content = read_file_content(args.system_prompt.as_ref(), "System Prompt")?;

    // 2. Generate Core Context
    let context = generate_context(&args.start, &args.end, notes_content)?;

    // 3. Determine Mode (Ollama vs Manual)
    if let Some(model) = args.ollama_model {
        // --- AUTO MODE (Ollama) ---
        println!("Mode: Auto-Generate (Ollama)");
        
        let final_output = call_ollama(
            &model, 
            &args.ollama_url, 
            &context, 
            system_prompt_content.as_ref()
        )?;
        
        let output_path = args.output.unwrap_or_else(|| "release_notes.md".to_string());
        fs::write(&output_path, final_output)
            .context(format!("Failed to write output to {}", output_path))?;
            
        println!("Successfully generated release notes: {}", output_path);

    } else {
        // --- MANUAL MODE ---
        println!("Mode: Context Generation (Manual)");
        
        let final_content = if let Some(prompt) = system_prompt_content {
            format!("{}\n\n---\n**Data to Process:**\n\n{}", prompt, context)
        } else {
            context
        };

        let output_path = args.output.unwrap_or_else(|| "release_context.md".to_string());
        fs::write(&output_path, final_content)
            .context(format!("Failed to write output to {}", output_path))?;

        println!("Successfully wrote context to {}", output_path);
    }

    Ok(())
}