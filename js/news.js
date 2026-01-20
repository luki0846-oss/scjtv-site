function qs(sel) { return document.querySelector(sel); }
function esc(s){return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function date10(s){ return (s||"").slice(0,10); }

async function fetchNews() {
  const res = await fetch("/data/news.json", { cache: "no-store" });
  if (!res.ok) throw new Error("news.json 로드 실패");
  return res.json();
}

function cardHTML(item){
  const img = item.coverImage ? `/<span></span>` : "";
  return `
    <a class="news-card" href="/pages/detail.html?slug=${encodeURIComponent(item.slug)}">
      <div class="thumb">
        <img src="/${(item.coverImage||"").replace(/^\//,"")}" alt="">
      </div>
      <div class="meta">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.summary)}</p>
      </div>
    </a>
  `;
}

function miniHTML(item){
  return `
    <a class="news-mini" href="/pages/detail.html?slug=${encodeURIComponent(item.slug)}">
      <div class="thumb">
        <img src="/${(item.coverImage||"").replace(/^\//,"")}" alt="">
      </div>
      <div class="meta">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.summary)}</p>
      </div>
    </a>
  `;
}

(async function main(){
  const items = await fetchNews();

  // 규칙:
  // featured 1개 → 없으면 최신 1개
  const featured = items.find(x => x.category === "featured") || items[0];

  const latest = items.filter(x => x.category === "latest").slice(0, 4);
  const popular = items.filter(x => x.category === "popular").slice(0, 4);

  // 1) Featured
  const featureImg = qs("#featureImg");
  const featureTitle = qs("#featureTitle");
  const featureSummary = qs("#featureSummary");
  const featureLink = qs("#featureLink");

  if (featured && featureImg && featureTitle && featureSummary && featureLink) {
    featureImg.src = "/" + (featured.coverImage||"").replace(/^\//,"");
    featureTitle.textContent = featured.title || "";
    featureSummary.textContent = featured.summary || "";
    featureLink.href = `/pages/detail.html?slug=${encodeURIComponent(featured.slug)}`;
  }

  // 2) Latest Grid
  const latestGrid = qs("#latestGrid");
  if (latestGrid) latestGrid.innerHTML = latest.map(cardHTML).join("");

  // 3) Popular Grid
  const popularGrid = qs("#popularGrid");
  if (popularGrid) popularGrid.innerHTML = popular.map(miniHTML).join("");

  // 4) List
  const listEl = qs("#newsList");
  if (listEl) {
    listEl.innerHTML = items.slice(0, 12).map(item => `
      <a class="news-list-item" href="/pages/detail.html?slug=${encodeURIComponent(item.slug)}">
        <span class="t">${esc(item.title)}</span>
        <span class="d">${esc(date10(item.publishedAt))}</span>
      </a>
    `).join("");
  }
})().catch(console.error);
