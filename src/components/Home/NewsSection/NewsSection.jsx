import { useEffect, useState } from "react";
import styles from "./NewsSection.module.css";
import { FaArrowRight, FaNewspaper, FaSyncAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function NewsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadNews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/news/`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar as notícias.");
      setItems(data.items || []);
      setUpdatedAt(data.updatedAt || null);
      if (data.warning) setError(data.warning);
    } catch (err) {
      setError(err.message || "Notícias indisponíveis no momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNews(); }, []);
  const dateLabel = updatedAt ? new Date(updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div><span className={styles.eyebrow}>FIQUE POR DENTRO</span><h2>Notícias dos vestibulares</h2><p>Atualizações recentes sobre ENEM, UNICAMP, FUVEST e processos seletivos.</p></div>
        <button className={styles.refresh} onClick={loadNews} disabled={loading}><FaSyncAlt className={loading ? styles.spinning : ""} /> Atualizar</button>
      </div>
      {error && <p className={styles.notice} role="status">{error}</p>}
      {loading && items.length === 0 ? <div className={styles.empty}>Buscando notícias recentes...</div> : items.length === 0 ? <div className={styles.empty}>Nenhuma notícia disponível agora. Tente atualizar em alguns instantes.</div> : (
        <div className={styles.grid}>
          {items.slice(0, 6).map((item) => (
            <article className={styles.card} key={item.id}>
              <div className={styles.cardTop}><span><FaNewspaper /> {item.category}</span><small>{item.publishedAt && !Number.isNaN(new Date(item.publishedAt).getTime()) ? new Date(item.publishedAt).toLocaleDateString("pt-BR") : "Recente"}</small></div>
              <div className={styles.content}><h3>{item.title}</h3><p>{item.source}</p><a href={item.link} target="_blank" rel="noreferrer">Ler notícia <FaArrowRight /></a></div>
            </article>
          ))}
        </div>
      )}
      <p className={styles.source}>Fonte: Google Notícias · {dateLabel ? `Feed atualizado em ${dateLabel}` : "As notícias são carregadas automaticamente"}. Ao abrir uma notícia, você será direcionado ao site de origem.</p>
    </section>
  );
}
