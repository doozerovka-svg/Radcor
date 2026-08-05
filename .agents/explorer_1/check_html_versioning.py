import os
import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

html_files = glob.glob('*.html')
print(f"Found {len(html_files)} HTML files: {html_files}\n")

script_link_regex = re.compile(r'<(?:script|link)[^>]*(?:src|href)=["\']([^"\']+)["\']', re.IGNORECASE)

for html_file in sorted(html_files):
    print(f"=== {html_file} ===")
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = script_link_regex.findall(content)
    for m in matches:
        if any(target in m for target in ['i18n.js', 'app.js', 'style.css', 'checkout.js']):
            print(f"  Asset link: {m}")
    print()
