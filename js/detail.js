function qs(sel){ return document.querySelector(sel); }

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// 테스트용 간단 마크다운 -> HTML (news.js와 동일 로직)
function mdToHtml(md) {
  const s = escapeHtml(md);

  let out = s
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  out = out.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>");

  out = out.replace(/^(?:- .*(?:\n|$))+?/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((l) => l.replace(/^- /, "").trim())
      .filter(Boolean);
    if (!items.length) return block;
    return "<ul>" + items.map((it) => `<li>${it}</li>`).join("") + "</ul>";
  });

  out = out
    .split(/\n{2,}/)
    .map((p) => {
      const t = p.trim();
      if (!t) return "";
      if (t.startsWith("<h") || t.startsWith("<ul") || t.startsWith("<blockquote")) return t;
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return out;
}

async function fetchNews() {
  const res = await fetch("/data/news.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load /data/news.json");
  return res.json();
}

function getSlug() {
  const params = new URLSearchParams(location.search);
  // slug 파라미터를 우선 사용
  const slug = params.get("slug");
  if (slug) return slug;

  // 혹시 type/id 형태를 쓰던 경우 대비(없어도 됨)
  const id = params.get("id");
  if (id) return id;

  return null;
}

function showError() {
  qs("#detailHeroWrap").hidden = true;
  qs("#detailHeroCap").hidden = true;
  qs("#detailSubWrap").hidden = true;
  qs("#detailSubCap").hidden = true;
  qs("#detailBody").innerHTML = "";
  qs("#detailTitle").textContent = "Not Found";
  qs("#detailMeta").textContent = "";
  qs("#detailError").hidden = false;
}

function setImage(imgEl, wrapEl, capEl, src, cap) {
  if (!src) {
    wrapEl.hidden = true;
    capEl.hidden = true;
    return;
  }
  wrapEl.hidden = false;
  imgEl.src = "/" + src.replace(/^\//, "");
  capEl.textContent = cap || "";
  capEl.hidden = !cap;
}

(async function main(){
  try {
    const slug = getSlug();
    if (!slug) return showError();

    const items = await fetchNews();
    const item = items.find(x => x.slug === slug);

    if (!item) return showError();

    qs("#detailError").hidden = true;

    qs("#detailTitle").textContent = item.title || "";
    const date = (item.publishedAt || "").slice(0,10);
    qs("#detailMeta").textContent = `${date} · ${item.author || ""}`;
    qs("#detailCategory").textContent = (item.category || "").toUpperCase();

    setImage(
      qs("#detailHeroImg"),
      qs("#detailHeroWrap"),
      qs("#detailHeroCap"),
      item.coverImage,
      item.coverCaption
    );

    qs("#detailBody").innerHTML = mdToHtml(item.body || "");

    setImage(
      qs("#detailSubImg"),
      qs("#detailSubWrap"),
      qs("#detailSubCap"),
      item.image2,
      item.image2Caption
    );

    // 타이틀 반영
    document.title = `SCJtv - ${item.title || "Detail"}`;

  } catch (e) {
    console.error(e);
    showError();
  }
})();
