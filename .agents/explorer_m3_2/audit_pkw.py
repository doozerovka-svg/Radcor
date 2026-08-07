import json
import re

with open('c:/Users/DenCrut/Documents/radcor.md/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = [p for p in data['products'] if p.get('category') == 'motor-oils-pkw']

print(f"Total PKW products: {len(products)}")

def check_emoji(text):
    if not text:
        return False
    # Check non-ascii emojis
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u26FF\u2700-\u27BF]')
    return bool(emoji_pattern.search(text))

def check_artifacts(text):
    if not text:
        return []
    artifacts = []
    if 'TODO' in text or 'FIXME' in text:
        artifacts.append('TODO/FIXME')
    if '<' in text or '>' in text:
        artifacts.append('HTML tags')
    if re.search(r'\*\*[^*]+\*\*', text): # markdown bold
        artifacts.append('Markdown syntax')
    if '\\n' in text:
        artifacts.append('Escaped \\n')
    if 'undefined' in text or 'null' in text:
        artifacts.append('undefined/null')
    return artifacts

audit_results = []

for idx, p in enumerate(products, 1):
    pid = p.get('id', '')
    title = p.get('title', '')
    desc_ru = p.get('description', '')
    desc_ro = p.get('description_ro', '')
    
    issues = []
    
    # 1. RU description checks
    if not desc_ru:
        issues.append('RU description is MISSING')
    elif len(desc_ru.strip()) < 15:
        issues.append(f'RU description too short / placeholder: "{desc_ru}"')
    
    if check_emoji(desc_ru):
        issues.append('RU description contains EMOJI')
        
    ru_art = check_artifacts(desc_ru)
    if ru_art:
        issues.append(f'RU description contains artifacts: {", ".join(ru_art)}')
        
    # 2. RO description checks
    if 'description_ro' not in p:
        issues.append('description_ro field MISSING')
    elif not desc_ro:
        issues.append('RO description is EMPTY/MISSING')
    elif desc_ro == desc_ru:
        issues.append('RO description is UNTRANSLATED (identical to RU)')
    elif len(desc_ro.strip()) < 15:
        issues.append(f'RO description too short / placeholder: "{desc_ro}"')
        
    if check_emoji(desc_ro):
        issues.append('RO description contains EMOJI')
        
    ro_art = check_artifacts(desc_ro)
    if ro_art:
        issues.append(f'RO description contains artifacts: {", ".join(ro_art)}')

    # 3. Title check for emoji
    if check_emoji(title):
        issues.append('Title contains EMOJI')

    audit_results.append({
        'index': idx,
        'id': pid,
        'title': title,
        'desc_ru': desc_ru,
        'desc_ro': desc_ro,
        'issues': issues
    })

print("\n=== AUDIT SUMMARY ===")
issues_count = 0
for r in audit_results:
    print(f"[{r['index']}] {r['id']} | {r['title']}")
    print(f"  RU: {r['desc_ru']}")
    print(f"  RO: {r['desc_ro']}")
    if r['issues']:
        issues_count += 1
        print(f"  ISSUES: {'; '.join(r['issues'])}")
    else:
        print("  ISSUES: None (OK)")
    print("-" * 50)

print(f"\nTotal items with issues: {issues_count} / {len(products)}")
