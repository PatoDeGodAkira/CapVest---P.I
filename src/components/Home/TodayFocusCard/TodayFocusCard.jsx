import { useNavigate } from "react-router-dom";
import styles from "./TodayFocusCard.module.css";
import { FaBookOpen, FaCheckCircle, FaClock, FaPlay } from "react-icons/fa";

export default function ContinueCard() {
  const navigate = useNavigate();
  return <section className={styles.card}>
    <div className={styles.header}><div><h2>Seu próximo estudo</h2><p>Continue de onde quiser: escolha um tema ou uma prova.</p></div><span className={styles.time}><FaClock /> No seu ritmo</span></div>
    <div className={styles.tasks}><div className={styles.done}><FaCheckCircle /><div><strong>Banco de questões</strong><span>Encontre exercícios por assunto</span></div></div><div className={styles.task}><FaBookOpen /><div><strong>Provas anteriores</strong><span>Resolva provas dentro da plataforma</span></div></div><div className={styles.task}><FaBookOpen /><div><strong>Capy Assistente</strong><span>Pesquise questões por tema</span></div></div></div>
    <button className={styles.button} onClick={() => navigate("/questoes")}><FaPlay /> Começar a estudar</button>
  </section>;
}
