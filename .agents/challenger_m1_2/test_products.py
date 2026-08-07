import json
import re
import sys

PRODUCTS_FILE = r"c:\Users\DenCrut\Documents\radcor.md\products.json"

VALID_CATEGORIES = {
    "motor-oils-pkw",
    "motor-oils-lkw",
    "moto-oils",
    "transmission-oils",
    "hydraulic-oils",
    "greases",
    "industrial-lubricants",
    "coolants",
    "brake-fluids",
    "auto-chemistry",
    "accessories",
    "auto-lamps"
}

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags (iOS)
    "\U00002702-\U000027B0"
    "\U000024C2-\U0000F251"
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\U00002600-\U000026FF"  # Misc symbols
    "]+", flags=re.UNICODE
)

DISCONTINUED_ITEMS = [
    "Yuko Super Hybrid 0W-16", "Yuko Syntetic 0W-16", "MOL Dynamic Gold Ultra 0W-16",
    "Yuko Syntetic 0W-20", "MOL Dynamic Gold 0W-20", "MOL Dynamic Gold 0W-20 VAG", "MOL Dynamic Synt RN17FE 0W-20",
    "Yuko Syntetic 0W-30", "MOL Dynamic Gold 0W-30", "MOL Dynamic Star 0W-30",
    "Yuko Syntetic 5W-20", "MOL Dynamic Gold HUN 5W-30", "MOL Dynamic Synt 5W-30",
    "MOL Dynamic Gold 5W-40", "Yuko Vega Synt 5W-40", "MOL Dynamic Synt RN 5W-40", "MOL Dynamic Essence DPF 5W-40", "MOL Essence Multi Gaz 5W-40",
    "Yuko Semisynt 10W-30", "Yuko Synetic 10W-30", "MOL Dynamic Synt 10W-30", "MOL Dynamic Transit 10W-30",
    "MOL 15W-40", "Yuko Classic 20W-50", "MOL Dynamic Race R5"
]

def run_tests():
    errors = []
    warnings = []

    print("--- STARTING PRODUCTS.JSON EMPIRICAL STRESS TEST ---")
    
    # 1. Parsing test
    try:
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"[PASS] JSON parsed successfully. Total items: {len(data)}")
    except Exception as e:
        print(f"[FAIL] JSON parse error: {e}")
        return False, [f"JSON parse error: {e}"], []

    if not isinstance(data, list):
        errors.append("Top-level JSON structure is not a list!")
        return False, errors, warnings

    # 2. Check IDs, SKUs, and required fields
    seen_ids = set()
    seen_skus = set()
    pkw_items = []
    
    for idx, item in enumerate(data):
        item_ref = f"Index {idx} (id: {item.get('id', 'MISSING')})"
        
        # Check required fields
        req_fields = ["id", "sku", "name", "category", "brand", "volumes", "packs", "specs"]
        for rf in req_fields:
            if rf not in item or item[rf] is None:
                errors.append(f"{item_ref}: Missing required field '{rf}'")

        # Check unique id and sku
        item_id = item.get("id")
        if item_id:
            if item_id in seen_ids:
                errors.append(f"Duplicate product ID found: {item_id}")
            seen_ids.add(item_id)
            
        item_sku = item.get("sku")
        if item_sku:
            if item_sku in seen_skus:
                errors.append(f"Duplicate product SKU found: {item_sku}")
            seen_skus.add(item_sku)

        # Check category
        cat = item.get("category")
        if cat not in VALID_CATEGORIES:
            errors.append(f"{item_ref}: Invalid category '{cat}'")

        if cat == "motor-oils-pkw":
            pkw_items.append(item)

        # Check types of volumes, packs, specs
        vols = item.get("volumes")
        if not isinstance(vols, list):
            errors.append(f"{item_ref}: 'volumes' field must be a list, got {type(vols)}")
        else:
            for v in vols:
                if not isinstance(v, (int, float)):
                    errors.append(f"{item_ref}: volume element '{v}' is not numeric")

        packs = item.get("packs")
        if not isinstance(packs, list):
            errors.append(f"{item_ref}: 'packs' field must be a list, got {type(packs)}")
        else:
            for p in packs:
                if not isinstance(p, dict):
                    errors.append(f"{item_ref}: pack entry is not a dict: {p}")
                else:
                    if "volume_l" not in p or "label" not in p:
                        errors.append(f"{item_ref}: pack entry missing volume_l or label: {p}")

        specs = item.get("specs")
        if not isinstance(specs, list):
            errors.append(f"{item_ref}: 'specs' field must be a list, got {type(specs)}")
        else:
            for s in specs:
                if not isinstance(s, dict):
                    errors.append(f"{item_ref}: spec entry is not a dict: {s}")
                else:
                    if "label" not in s or "value" not in s:
                        errors.append(f"{item_ref}: spec entry missing label or value: {s}")

        # Check for emojis in all string values recursively
        def check_emoji(val, path):
            if isinstance(val, str):
                if EMOJI_PATTERN.search(val):
                    errors.append(f"{item_ref}: Emoji detected in field '{path}': {val}")
            elif isinstance(val, dict):
                for k, v in val.items():
                    check_emoji(v, f"{path}.{k}")
            elif isinstance(val, list):
                for i, v in enumerate(val):
                    check_emoji(v, f"{path}[{i}]")

        check_emoji(item, "product")

    # 3. Check MOL Arol 2T categorization
    arol_item = next((item for item in data if item.get("id") == "MOL-1042" or "Arol 2T" in item.get("name", "")), None)
    if not arol_item:
        errors.append("MOL Arol 2T (MOL-1042) not found in products.json!")
    else:
        if arol_item.get("category") != "moto-oils":
            errors.append(f"MOL Arol 2T category is '{arol_item.get('category')}', expected 'moto-oils'")
        else:
            print("[PASS] MOL Arol 2T is correctly assigned to 'moto-oils'")

    # 4. Check Discontinued Items Removal
    for item in data:
        name = item.get("name", "")
        for disc in DISCONTINUED_ITEMS:
            if name.strip().lower() == disc.strip().lower():
                errors.append(f"Discontinued product still present in catalog: '{name}'")

    # 5. Check PKW items count requirement (33 active PKW models)
    print(f"Total motor-oils-pkw products count: {len(pkw_items)}")
    if len(pkw_items) != 33:
        warnings.append(f"Count of 'motor-oils-pkw' is {len(pkw_items)}, expected exactly 33 active items.")
    else:
        print("[PASS] Exactly 33 motor-oils-pkw items found.")

    # Print summary
    print("\n--- TEST SUMMARY ---")
    print(f"Total Errors: {len(errors)}")
    print(f"Total Warnings: {len(warnings)}")

    if errors:
        print("\nERRORS DETECTED:")
        for err in errors:
            print(f"  - {err}")
    if warnings:
        print("\nWARNINGS DETECTED:")
        for w in warnings:
            print(f"  - {w}")

    return len(errors) == 0, errors, warnings

if __name__ == "__main__":
    success, errors, warnings = run_tests()
    if not success:
        sys.exit(1)
    sys.exit(0)
