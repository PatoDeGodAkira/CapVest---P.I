import { useNavigate } from "react-router-dom";
import styles from "./GoalCard.module.css";
import { FaGraduationCap, FaBullseye, FaBookOpen, FaArrowRight } from "react-icons/fa";

export default function GoalCard() {
  const navigate = useNavigate();
  return <section className={styles.card}>
    <div className={styles.header}><div className={styles.icon}><FaGraduationCap /></div><div><span className={styles.subtitle}>Preparação</span><h2>Seu objetivo começa aqui</h2><p>Escolha o vestibular que deseja treinar.</p></div></div>
    <div className={styles.stats}><div><FaBullseye /><div><small>Vestibulares disponíveis</small><strong>ENEM · UNICAMP · FUVEST</strong></div></div><div><FaBookOpen /><div><small>Acervo de provas</small><strong>Questões e documentos oficiais</strong></div></div></div>
    <button className={styles.button} onClick={() => navigate("/materiais")}><FaArrowRight /> Explorar biblioteca</button>
  </section>;
}
