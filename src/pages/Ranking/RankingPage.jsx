import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getRanking } from "../../services/api";
import { FaCrown, FaMedal, FaSpinner } from "react-icons/fa";
import styles from "./RankingPage.module.css";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getRanking().then((data) => setRanking(data.ranking || [])).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  return <div className={styles.layout}><Sidebar /><main className={styles.main}><header className={styles.header}><span>COMUNIDADE CAPVEST</span><h1>Ranking de estudantes</h1><p>Uma classificação baseada no XP conquistado ao resolver questões. Cada estudante pode evoluir com a própria prática.</p></header>{loading ? <div className={styles.empty}><FaSpinner className={styles.spin} /> Carregando ranking...</div> : error ? <div className={styles.empty}>{error}</div> : ranking.length ? <section className={styles.list}>{ranking.map((item) => <article key={item.id} className={`${styles.item} ${item.id === currentUser?.id ? styles.me : ""}`}><strong className={styles.position}>{item.position <= 3 ? <FaMedal /> : `#${item.position}`}</strong><div className={styles.avatar}>{item.name?.slice(0,1)?.toUpperCase()}</div><div className={styles.person}><strong>{item.name}{item.id === currentUser?.id ? " (você)" : ""}</strong><span>@{item.username || "estudante"} · {item.questionsAnswered} questões</span></div><div className={styles.points}>{item.position === 1 && <FaCrown />}<strong>{item.xp.toLocaleString("pt-BR")} XP</strong></div></article>)}</section> : <div className={styles.empty}>O ranking será preenchido quando os estudantes começarem a resolver questões.</div>}</main></div>;
}
