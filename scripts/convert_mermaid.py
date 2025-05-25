#!/usr/bin/env python3
"""
Script to convert Mermaid code blocks to div format for GitHub Pages compatibility.
Converts ```mermaid ... ``` to <div class="mermaid"> ... </div>
"""

import os
import re
import glob

def convert_mermaid_blocks(content):
    """Convert Mermaid code blocks to div format"""
    
    # Pattern to match ```mermaid blocks
    pattern = r'```mermaid\n(.*?)\n```'
    
    def replace_block(match):
        diagram_content = match.group(1)
        return f'<div class="mermaid">\n{diagram_content}\n</div>'
    
    # Use DOTALL flag to match across newlines
    converted = re.sub(pattern, replace_block, content, flags=re.DOTALL)
    
    return converted

def process_file(file_path):
    """Process a single markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has Mermaid blocks
        if '```mermaid' not in content:
            return False
        
        converted_content = convert_mermaid_blocks(content)
        
        # Only write if content changed
        if converted_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(converted_content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all markdown files in docs directory"""
    
    # Find all markdown files in docs directory
    docs_dir = "docs"
    if not os.path.exists(docs_dir):
        print(f"Directory {docs_dir} not found!")
        return
    
    # Pattern to find all .md files in docs and subdirectories
    pattern = os.path.join(docs_dir, "**", "*.md")
    markdown_files = glob.glob(pattern, recursive=True)
    
    converted_files = []
    
    print("Converting Mermaid code blocks to div format...")
    print("-" * 50)
    
    for file_path in markdown_files:
        print(f"Processing: {file_path}")
        if process_file(file_path):
            converted_files.append(file_path)
            print(f"  ✅ Converted Mermaid blocks")
        else:
            print(f"  ⏭️  No Mermaid blocks found or no changes needed")
    
    print("-" * 50)
    print(f"Summary:")
    print(f"  📁 Total files processed: {len(markdown_files)}")
    print(f"  ✅ Files converted: {len(converted_files)}")
    
    if converted_files:
        print(f"\nConverted files:")
        for file_path in converted_files:
            print(f"  - {file_path}")

if __name__ == "__main__":
    main() 