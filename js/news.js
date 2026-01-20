async function loadNews() {
  const res = await fetch("/data/news.json");
  if (!res.ok) throw new Error("Failed to load news.json");
  const items = await res.json();

  // 최신 뉴스 4개
  const latest = items.filter(x => x.category === "latest").slice(0, 4);
  // 인기 뉴스 4개
  const popular = items.filter(x => x.category === "popular").slice(0, 4);
  // 상단 피처 1개
  const featured = items.find(x => x.category === "featured") || items[0];

  const qs = (sel) => document.querySelector(sel);

  // 상단 피처
  if (featured && qs("#featureTitle")) {
    qs("#featureTitle").textContent = featured.title || "";
    qs("#featureSummary").textContent = featured.summary || "";
    qs("#featureLink").href = `/pages/detail.html?type=news&slug=${featured.slug}`;
    qs("#featureImg").src = featured.coverImage || "";
  }

  const renderGrid = (el, list) => {
    if (!el) return;
    el.innerHTML = list.map(item => `
      <a class="news-card" href="/pages/detail.html?type=news&slug=${item.slug}">
        <div class="thumb">
          <img src="/${item.coverImage}" alt="">
        </div>
        <div class="meta">
          <h3>${item.title || ""}</h3>
          <p>${item.summary || ""}</p>
        </div>
      </a>
    `).join("");
  };

  renderGrid(qs("#latestGrid"), latest);
  renderGrid(qs("#popularGrid"), popular);

  // 리스트(최신순)
  const listEl = qs("#newsList");
  if (listEl) {
    listEl.innerHTML = items.slice(0, 8).map(item => `
      <a class="news-list-item" href="/pages/detail.html?type=news&slug=${item.slug}">
        <span class="t">${item.title}</span>
        <span class="d">${(item.publishedAt || "").slice(0,10)}</span>
      </a>
    `).join("");
  }
}

loadNews().catch(console.error);
