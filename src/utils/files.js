const cache = new Map();

/** Verifica se o arquivo realmente existe e é um PDF (o Vite devolve index.html para caminhos inexistentes). */
export function checkFile(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { method: "HEAD" })
        .then((res) => {
          const type = res.headers.get("content-type") || "";
          return res.ok && (type.includes("pdf") || type.includes("octet-stream"));
        })
        .catch(() => false)
    );
  }
  return cache.get(url);
}

export function downloadFile(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
