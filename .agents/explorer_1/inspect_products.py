import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total products: {len(data)}")

categories = {}
brands = {}
viscosities = {}
volumes_set = set()
packs_set = set()
pkw_products = []
ibc_tote_products = []

for p in data:
    cat = p.get('category')
    categories[cat] = categories.get(cat, 0) + 1
    brand = p.get('brand')
    brands[brand] = brands.get(brand, 0) + 1
    vols = p.get('volumes', [])
    for v in vols:
        volumes_set.add(v)
    for pack in p.get('packs', []):
        packs_set.add((pack.get('volume_l'), pack.get('label'), pack.get('id')))
        vol_l = pack.get('volume_l', 0)
        label = pack.get('label', '')
        if vol_l > 500 or 'ibc' in str(label).lower() or 'еврокуб' in str(label).lower() or 'куб' in str(label).lower():
            ibc_tote_products.append((p.get('sku'), p.get('name'), cat, pack))
            
    for s in p.get('specs', []):
        if s.get('label') == 'Вязкость':
            visc = s.get('value')
            viscosities[visc] = viscosities.get(visc, 0) + 1
    if cat == 'motor-oils-pkw':
        pkw_products.append(p)

print("\n--- Categories ---")
print(json.dumps(categories, ensure_ascii=False, indent=2))

print("\n--- Brands ---")
print(json.dumps(brands, ensure_ascii=False, indent=2))

print("\n--- Viscosities ---")
print(json.dumps(viscosities, ensure_ascii=False, indent=2))

print("\n--- Unique Volumes array ---")
print(sorted(list(volumes_set)))

print("\n--- Unique Pack Definitions ---")
for item in sorted(packs_set, key=lambda x: (x[0] if x[0] is not None else 0)):
    print(item)

print(f"\n--- PKW Products count: {len(pkw_products)} ---")

# Let's inspect PKW brands, viscosities, and volume options
pkw_brands = {}
pkw_viscosities = {}
pkw_vols = set()
for p in pkw_products:
    b = p.get('brand')
    pkw_brands[b] = pkw_brands.get(b, 0) + 1
    for s in p.get('specs', []):
        if s.get('label') == 'Вязкость':
            v = s.get('value')
            pkw_viscosities[v] = pkw_viscosities.get(v, 0) + 1
    for v in p.get('volumes', []):
        pkw_vols.add(v)

print("\n--- PKW Brands ---")
print(json.dumps(pkw_brands, ensure_ascii=False, indent=2))

print("\n--- PKW Viscosities ---")
print(json.dumps(pkw_viscosities, ensure_ascii=False, indent=2))

print("\n--- PKW Volumes ---")
print(sorted(list(pkw_vols)))

print(f"\n--- Products with large volume/IBC/container ({len(ibc_tote_products)}) ---")
for item in ibc_tote_products:
    print(item)
