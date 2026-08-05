import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for p in data:
    if p.get('category') == 'motor-oils-pkw' and p.get('brand') == 'MOL' and len(p.get('packs', [])) > 2:
        print(json.dumps(p, ensure_ascii=False, indent=2))
        break
