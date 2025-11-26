import argparse
import subprocess
import sys
import os

def parse_arguments():
    parser = argparse.ArgumentParser(description="Generate release context from git history.")
    parser.add_argument("--start", required=True, help="Start Commit Hash")
    parser.add_argument("--end", required=True, help="End Commit Hash")
    parser.add_argument("--notes", help="Path to Adhoc Notes Markdown file")
    parser.add_argument("--output", default="release_context.md", help="Output filename")
    return parser.parse_args()

def run_git_command(args):
    try:
        result = subprocess.run(
            args,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8'
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running git command: {' '.join(args)}
{e.stderr}", file=sys.stderr)
        sys.exit(1)

def read_notes(file_path):
    if not file_path:
        return "No adhoc notes provided."
    
    if not os.path.exists(file_path):
        print(f"Warning: Notes file '{file_path}' not found.", file=sys.stderr)
        return "No adhoc notes provided (File not found)."
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading notes file: {e}", file=sys.stderr)
        return f"Error reading notes file: {e}"

def get_git_log(start, end):
    # git log --pretty=format:"- %s" start..end
    cmd = ['git', 'log', '--pretty=format:- %s', f'{start}..{end}']
    return run_git_command(cmd)

def get_git_diff(start, end):
    # git diff start..end -- . ':(exclude)package-lock.json' ...
    excludes = [
        ':(exclude)package-lock.json',
        ':(exclude)yarn.lock',
        ':(exclude)*.png',
        ':(exclude)*.jpg',
        ':(exclude)*.jpeg',
        ':(exclude)*.gif',
        ':(exclude)*.svg',
        ':(exclude)*.ico',
        ':(exclude)__pycache__',
        ':(exclude)*.pyc',
        ':(exclude)node_modules',
        ':(exclude).git'
    ]
    
    cmd = ['git', 'diff', f'{start}..{end}', '--', '.'] + excludes
    return run_git_command(cmd)

def main():
    args = parse_arguments()
    
    print(f"Generating context from {args.start} to {args.end}...")
    
    # 1. Read Notes
    notes_content = read_notes(args.notes)
    
    # 2. Get Log
    log_content = get_git_log(args.start, args.end)
    
    # 3. Get Diff
    diff_content = get_git_diff(args.start, args.end)
    
    # 4. Assemble Output
    final_output = f"""# Release Context

## Strategic Context / Adhoc Notes
{notes_content}

## Commit History
{log_content}

## Code Changes
```diff
{diff_content}
```
"""
    
    # 5. Write File
    try:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(final_output)
        print(f"Successfully wrote context to {args.output}")
    except Exception as e:
        print(f"Error writing output file: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
