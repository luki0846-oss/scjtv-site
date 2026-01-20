const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const NEWS_DIR = path.join(__dirname, "../content/news");
const OUT_DIR = path.join(__dirname, "../data");
const OUT_FILE = path.join(OUT_DIR, "news.json");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const files = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith(".md"));

const items = files.map(file => {
  const fullPath = path.join(NEWS_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug: file.replace(".md", ""),
    ...data,
    body: content.trim()
  };
});

// 최신순 정렬
items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

fs.writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), "utf-8");

console.log("✅ news.json generated");
