import urllib.request
import re

art_numbers = ["61223", "42791", "42517", "42444", "42546", "42574"]

for art in art_numbers:
    url = f"https://carcommerce.pl/?s={art}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            # find img urls
            img_urls = re.findall(r'src="(https://carcommerce\.pl/wp-content/uploads/[^"]+\.(?:jpg|png|jpeg|webp))"', html)
            print(f"Art {art} -> Found images: {img_urls[:2]}")
    except Exception as e:
        print(f"Art {art} -> Error: {e}")
