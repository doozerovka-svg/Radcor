import requests
import json
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

base_url = 'https://mollubricants.md'

with open('product_links.json', 'r') as f:
    product_links = json.load(f)

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
})

data = {
    "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "products": []
}

print(f"Loaded {len(product_links)} URLs. Starting extraction...")

for i, url in enumerate(product_links):
    print(f"[{i+1}/{len(product_links)}] Fetching: {url}")
    try:
        res = session.get(url, timeout=10)
        psoup = BeautifulSoup(res.text, 'html.parser')
        
        # Name
        title_el = psoup.find('h1') or psoup.find('h2')
        name = title_el.get_text(strip=True) if title_el else "Unknown"
        
        # Breadcrumbs for category
        category = "Unknown"
        breadcrumbs = psoup.select('.breadcrumb li a')
        if len(breadcrumbs) >= 3:
            category = breadcrumbs[-1].get_text(strip=True)
            
        # Image
        image_url = ""
        img_el = psoup.select_one('.lub_product_image img')
        if img_el and img_el.has_attr('src'):
            image_url = urljoin(base_url, img_el['src'])
            
        # Description
        desc_el = psoup.select_one('.lub_product_nomination_wrapper')
        short_desc = desc_el.get_text(separator=' ', strip=True) if desc_el else ""
        
        full_desc_el = psoup.select_one('.lub_product_description_wrapper')
        full_desc = full_desc_el.get_text(separator=' ', strip=True) if full_desc_el else ""
        
        # Approvals / Specs
        approvals = []
        appr_box = psoup.select_one('.lub_table_perf_box')
        if appr_box:
            tds = appr_box.find_all('div')
            if not tds:
                tds = appr_box.find_all('td')
            for td in tds:
                t = td.get_text(strip=True)
                if t: approvals.append(t)
                
        # Typical characteristics
        characteristics = {}
        char_box = psoup.select_one('.lub_table_prop_box table')
        if char_box:
            rows = char_box.find_all('tr')
            for row in rows:
                th = row.find('th')
                td = row.find('td')
                if th and td:
                    characteristics[th.get_text(strip=True)] = td.get_text(strip=True)
                    
        data['products'].append({
            "name": name,
            "url": url,
            "category": category,
            "image_url": image_url,
            "short_description": short_desc,
            "full_description": full_desc,
            "approvals_and_performance": approvals,
            "characteristics": characteristics
        })
        time.sleep(0.1) # Be polite
    except Exception as e:
        print(f"Error extracting {url}: {e}")

output_file = 'mol_catalog_scraped.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    
print(f"Scraping complete! Saved {len(data['products'])} products to {output_file}")
