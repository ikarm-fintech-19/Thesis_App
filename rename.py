import os
import re

directories = ['.']
exclude_dirs = ['node_modules', '.git', '.next', 'graphify-out', '.gemini']
extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py', '.xml', '.txt', '.html', '.css', '.scss', '.env']

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        
        # Replacements
        new_content = new_content.replace('Matax', 'Matax')
        new_content = new_content.replace('matax', 'matax')
        new_content = new_content.replace('Matax', 'Matax')
        new_content = new_content.replace('Matax', 'Matax')
        new_content = new_content.replace('matax', 'matax')
        new_content = new_content.replace('MATAX', 'MATAX')

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Failed to process {filepath}: {e}")

for d in directories:
    for root, dirs, files in os.walk(d):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                replace_in_file(filepath)

print("Done replacing.")
