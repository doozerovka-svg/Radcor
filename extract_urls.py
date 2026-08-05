import re
import json

snapshot_path = r'C:\Users\DenCrut\.gemini\antigravity\brain\9e20bd32-df16-4720-a3af-3f60bd58aa8d\.system_generated\steps\884\output.txt'
with open(snapshot_path, 'r', encoding='utf-8') as f:
    text = f.read()

urls = re.findall(r'url=\"(https://mollubricants\.md/ru/smazochnye-materialy-i-avtohimija/avtomobili/[^\"]+)\"', text)

product_urls = set()
for url in urls:
    if 'mol-' in url or 'evox-' in url or '/adblue' in url:
        product_urls.add(url)

print(f'Extracted {len(product_urls)} product URLs from snapshot.')
with open('product_links.json', 'w') as f:
    json.dump(list(product_urls), f)
