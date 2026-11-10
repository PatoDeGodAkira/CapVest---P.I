import { useEffect, useState } from "react";
import styles from "./RankingCard.module.css";
import { FaCrown, FaMedal } from "react-icons/fa";
import { getRanking } from "../../../services/api";

export default function RankingCard() {
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { getRanking().then((data) => setRanking(data.ranking || [])).catch((err) => setError(err.message)); }, []);
  return <section className={styles.card}>
    <div className={styles.header}><div><h2>Ranking geral</h2><p>Classificação calculada pelo XP conquistado na plataforma.</p></div><FaCrown className={styles.crown} /></div>
    {error ? <p>{error}</p> : ranking.length === 0 ? <p>O ranking aparecerá quando os estudantes começarem a praticar.</p> : <div className={styles.list}>{ranking.map((user) => <div key={user.id} className={styles.item}><div className={styles.left}><span className={styles.number}>#{user.position}</span><span>{user.name}</span></div><div className={styles.right}>{user.position <= 3 && <FaMedal className={styles.medal} />}<span>{user.xp.toLocaleString("pt-BR")} XP</span></div></div>)}</div>}
  </section>;
}
