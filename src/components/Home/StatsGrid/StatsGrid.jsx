import { useEffect, useState } from "react";
import styles from "./StatsGrid.module.css";
import { FaBookOpen, FaBullseye, FaFire, FaTrophy } from "react-icons/fa";
import { getProgress } from "../../../services/api";

export default function StatsGrid() {
  const [progress, setProgress] = useState(null);
  useEffect(() => { getProgress().then(setProgress).catch(() => setProgress(null)); }, []);
  const stats = [
    { icon: <FaBookOpen />, title: "Questões Respondidas", value: progress?.questionsAnswered ?? "—", progress: 0 },
    { icon: <FaBullseye />, title: "Precisão Média", value: progress ? `${progress.accuracy}%` : "—", progress: progress?.accuracy || 0 },
    { icon: <FaTrophy />, title: "Experiência", value: progress ? `${progress.xp} XP` : "—", progress: progress?.levelProgress || 0 },
    { icon: <FaFire />, title: "Sequência atual", value: progress ? `${progress.currentStreak} dias` : "—", progress: 0 }
  ];
  return <section className={styles.container}><div className={styles.header}><div><h2>Seu Desempenho</h2><p>Indicadores calculados a partir das suas atividades no CapVest.</p></div></div><div className={styles.grid}>{stats.map((item) => <div className={styles.card} key={item.title}><div className={styles.icon}>{item.icon}</div><span className={styles.title}>{item.title}</span><h3>{item.value}</h3><div className={styles.progress}><div className={styles.fill} style={{ width: `${item.progress}%` }} /></div></div>)}</div></section>;
}
