import requests
import json
import time
import concurrent.futures
from bs4 import BeautifulSoup

BASE_URL = 'https://mollubricants.md'
JSON_ENDPOINT = f'{BASE_URL}/ru/index.php?option=com_mol_lub&view=json&segment_id=326'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

def fetch_product_list():
    res = requests.get(JSON_ENDPOINT, headers=headers, timeout=15)
    data = res.json()
    print(f'Fetched {len(data)} product entries from Joomla JSON endpoint.', flush=True)
    return data

def scrape_single_product(item):
    rel_url = item.get('url', '')
    if not rel_url:
        return None
    
    full_url = BASE_URL + rel_url if rel_url.startswith('/') else rel_url
    
    session = requests.Session()
    session.headers.update(headers)
    
    for attempt in range(3):
        try:
            res = session.get(full_url, timeout=12)
            if res.status_code != 200:
                time.sleep(0.5)
                continue
                
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Name
            title_el = soup.find('h1') or soup.find('h2')
            name = title_el.get_text(strip=True) if title_el else item.get('title', 'Unknown')
            
            # Category from breadcrumbs
            category = 'Промышленные смазочные материалы'
            breadcrumbs = soup.select('.breadcrumb li a')
            if len(breadcrumbs) >= 3:
                category = ' / '.join([b.get_text(strip=True) for b in breadcrumbs[2:]])
                
            # Image URL
            image_url = ''
            img_el = soup.select_one('.lub_product_image img')
            if img_el and img_el.has_attr('src'):
                src = img_el['src']
                image_url = BASE_URL + src if src.startswith('/') else src
                
            # Descriptions
            desc_el = soup.select_one('.lub_product_nomination_wrapper')
            short_desc = desc_el.get_text(separator=' ', strip=True) if desc_el else ''
            
            full_desc_el = soup.select_one('.lub_product_description_wrapper')
            full_desc = full_desc_el.get_text(separator=' ', strip=True) if full_desc_el else ''
            
            # Approvals & Performance Levels / OEM Authorizations
            approvals = []
            appr_box = soup.select_one('.lub_table_perf_box')
            if appr_box:
                # First check for individual div elements inside td
                divs = appr_box.find_all('div')
                if divs:
                    for d in divs:
                        t = d.get_text(strip=True)
                        if t and t not in approvals:
                            approvals.append(t)
                else:
                    tds = appr_box.find_all('td')
                    for td in tds:
                        t = td.get_text(strip=True)
                        if t and t not in approvals:
                            approvals.append(t)
                            
            # Typical Characteristics (Физико-химические свойства)
            characteristics = {}
            char_box = soup.select_one('.lub_table_prop_box table')
            if char_box:
                rows = char_box.find_all('tr')
                for row in rows:
                    th = row.find('th')
                    td = row.find('td')
                    if th and td:
                        k = th.get_text(strip=True)
                        v = td.get_text(strip=True)
                        if k and v:
                            characteristics[k] = v
                            
            return {
                'id': item.get('id'),
                'name': name,
                'url': full_url,
                'category': category,
                'image_url': image_url,
                'short_description': short_desc,
                'full_description': full_desc,
                'approvals_and_performance': approvals,
                'characteristics': characteristics
            }
        except Exception as e:
            time.sleep(0.5)
            
    print(f'Failed to scrape: {full_url}')
    return None

def main():
    items = fetch_product_list()
    results = []
    
    print(f'Starting concurrent scraping of {len(items)} products...', flush=True)
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        future_to_item = {executor.submit(scrape_single_product, item): item for item in items}
        completed = 0
        for future in concurrent.futures.as_completed(future_to_item):
            completed += 1
            res = future.result()
            if res:
                results.append(res)
            if completed % 50 == 0 or completed == len(items):
                print(f'Progress: {completed}/{len(items)} items processed ({len(results)} successful)', flush=True)
                
    results.sort(key=lambda x: x.get('id') or 0)
    
    output_data = {
        'scraped_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': BASE_URL + '/ru/smazochnye-materialy-i-avtohimija/promy-lennost/produkty/promyslennye-smazocnye-materialy',
        'total_products': len(results),
        'products': results
    }
    
    with open('mol_industrial_scraped.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    elapsed = time.time() - start_time
    print(f'Scraping finished in {elapsed:.1f}s! Saved {len(results)} products to mol_industrial_scraped.json', flush=True)

if __name__ == '__main__':
    main()
