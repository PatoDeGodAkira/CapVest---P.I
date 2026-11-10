let cache = { expires: 0, items: [] };

function decode(value = "") {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function tag(item, name) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

exports.list = async (_req, res) => {
  if (Date.now() < cache.expires) return res.json({ items: cache.items, updatedAt: new Date(cache.expires - 15 * 60 * 1000).toISOString(), cached: true });
  const query = encodeURIComponent('(ENEM OR vestibular OR UNICAMP OR FUVEST) when:7d');
  const url = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  try {
    const response = await fetch(url, { headers: { "User-Agent": "CapVest/1.0 (vestibular news reader)" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Feed retornou HTTP ${response.status}`);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 12).map(([_, item], index) => {
      const title = tag(item, "title");
      const link = tag(item, "link");
      const source = tag(item, "source");
      const pubDate = tag(item, "pubDate");
      const categoryText = `${title} ${source}`.toLowerCase();
      const category = categoryText.includes("unicamp") || categoryText.includes("comvest") ? "UNICAMP" : categoryText.includes("fuvest") || categoryText.includes("usp") ? "FUVEST" : categoryText.includes("enem") || categoryText.includes("inep") ? "ENEM" : "VESTIBULARES";
      const parsedDate = pubDate ? new Date(pubDate) : null;
      return { id: `${index}-${Buffer.from(title).toString("base64url").slice(0, 16)}`, title, link, source: source || "Google Notícias", publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null, category };
    }).filter((item) => item.title && /^https?:\/\//i.test(item.link));
    cache = { items, expires: Date.now() + 15 * 60 * 1000 };
    return res.json({ items, updatedAt: new Date().toISOString(), cached: false });
  } catch (error) {
    if (cache.items.length) return res.json({ items: cache.items, updatedAt: new Date(cache.expires - 15 * 60 * 1000).toISOString(), cached: true, warning: "Não foi possível atualizar o feed agora." });
    return res.status(502).json({ error: "Não foi possível carregar as notícias agora. Tente novamente mais tarde.", detail: process.env.NODE_ENV === "development" ? error.message : undefined, items: [] });
  }
};
