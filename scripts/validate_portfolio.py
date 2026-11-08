from html.parser import HTMLParser
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(path for path in ROOT.glob("*.html") if path.name != "404.html")
REQUIRED_PAGES = (
    "index.html", "roadmap.html", "fluffy.html", "paw-art-studio.html",
    "phoenix-rp.html", "songid.html", "updates.html",
)
BASE_URL = "https://cr1staloriginal.github.io/"
errors = []

class PageParser(HTMLParser):
    def __init__(self, page):
        super().__init__(convert_charrefs=True)
        self.page = page
        self.ids = set()
        self.local_links = []
        self.assets = []
        self.title_seen = False
        self.description_seen = False
        self.canonical_seen = False
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                errors.append(f"{self.page}: duplicate id #{element_id}")
            self.ids.add(element_id)
        if tag == "meta" and attrs.get("name", "").lower() == "description":
            self.description_seen = bool(attrs.get("content", "").strip())
        if tag == "link" and attrs.get("rel", "").lower() == "canonical":
            href = attrs.get("href", "")
            self.canonical_seen = href.startswith(BASE_URL)
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

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title and data.strip():
            self.title_seen = True

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
    if not parser.title_seen:
        errors.append(f"{page.name}: missing page title")
    if not parser.description_seen:
        errors.append(f"{page.name}: missing meta description")
    if not parser.canonical_seen:
        errors.append(f"{page.name}: missing or invalid canonical URL")

for page, parser in parsers.items():
    for anchor in parser.local_links:
        if anchor and anchor not in parser.ids:
            errors.append(f"{page}: missing anchor #{anchor}")

for required in REQUIRED_PAGES:
    if not (ROOT / required).exists():
        errors.append(f"missing required page: {required}")

try:
    sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = {node.text for node in sitemap.findall("sm:url/sm:loc", namespace)}
    for page in REQUIRED_PAGES:
        expected = BASE_URL if page == "index.html" else BASE_URL + page
        if expected not in urls:
            errors.append(f"sitemap.xml: missing URL {expected}")
except Exception as exc:
    errors.append(f"sitemap.xml: invalid XML or missing file: {exc}")

robots = ROOT / "robots.txt"
if not robots.exists() or "Sitemap: " + BASE_URL + "sitemap.xml" not in robots.read_text(encoding="utf-8"):
    errors.append("robots.txt: missing sitemap declaration")

if errors:
    print("\n".join("ERROR: " + item for item in errors))
    sys.exit(1)
print(f"Portfolio validation passed: {len(HTML_FILES)} HTML pages, local assets, anchors, SEO metadata and sitemap checked.")
