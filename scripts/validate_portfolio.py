from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
errors = []

class PageParser(HTMLParser):
    def __init__(self, page):
        super().__init__(convert_charrefs=True)
        self.page = page
        self.ids = set()
        self.local_links = []
        self.assets = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                errors.append(f"{self.page}: duplicate id #{element_id}")
            self.ids.add(element_id)
        for key in ("href", "src"):
            value = attrs.get(key)
            if not value or value.startswith(("https://", "http://", "mailto:", "tel:", "data:", "javascript:")):
                continue
            if key == "href" and value.startswith("#"):
                self.local_links.append(value[1:])
            elif value.startswith("/"):
                self.assets.append(value.lstrip("/"))
            elif not value.startswith("#"):
                self.assets.append(value.split("#", 1)[0].split("?", 1)[0])

parsers = {}
for page in HTML_FILES:
    parser = PageParser(page.name)
    try:
        parser.feed(page.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{page.name}: HTML parsing failed: {exc}")
    parsers[page.name] = parser
    for asset in parser.assets:
        if asset and not (ROOT / asset).exists():
            errors.append(f"{page.name}: missing local asset {asset}")

for page, parser in parsers.items():
    for anchor in parser.local_links:
        if anchor and anchor not in parser.ids:
            errors.append(f"{page}: missing anchor #{anchor}")

for required in ("index.html", "roadmap.html", "fluffy.html", "paw-art-studio.html", "phoenix-rp.html", "songid.html", "updates.html"):
    if not (ROOT / required).exists():
        errors.append(f"missing required page: {required}")

if errors:
    print("\n".join("ERROR: " + item for item in errors))
    sys.exit(1)
print(f"Portfolio validation passed: {len(HTML_FILES)} HTML pages, local assets and anchors checked.")
