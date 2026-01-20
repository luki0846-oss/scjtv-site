const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const NEWS_DIR = path.join(ROOT, "content", "news");
const OUT_DIR = path.join(ROOT, "data");
const OUT_FILE = path.join(OUT_DIR, "news.json");

function parseFrontmatter(md) {
  const m = md.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!m) return { meta: {}, body: md.trim() };
  const fm = m[1];
  const body = (m[2] || "").trim();

  const meta = {};
  for (const line of fm.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf(":");
    if (idx === -1) continue;
    const key = t.slice(0, idx).trim();
    let val = t.slice(idx + 1).trim();
    val = val.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    meta[key] = val;
  }
  return { meta, body };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

ensureDir(OUT_DIR);

const files = listMdFiles(NEWS_DIR);

const items = files.map((file) => {
  const fullPath = path.join(NEWS_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { meta, body } = parseFrontmatter(raw);

  const slug = file.replace(/\.md$/, "");
  return {
    slug,
    title: meta.title || "",
    summary: meta.summary || "",
    category: meta.category || "latest",
    author: meta.author || "",
    publishedAt: meta.publishedAt || "",
    coverImage: meta.coverImage || "",
    coverCaption: meta.coverCaption || "",
    image2: meta.image2 || "",
    image2Caption: meta.image2Caption || "",
    body
  };
});

// 최신순 정렬(문자열 ISO 기준)
items.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

fs.writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), "utf8");
console.log(`Generated data/news.json (${items.length} items)`);
