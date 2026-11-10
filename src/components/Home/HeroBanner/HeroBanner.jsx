import { useNavigate } from "react-router-dom";
import styles from "./HeroBanner.module.css";
import { FaArrowRight, FaCalendarAlt, FaGraduationCap, FaBullseye } from "react-icons/fa";

export default function HeroBanner() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const userName = user?.name?.split(" ")[0] || "Estudante";
  return <section className={styles.hero}>
    <div className={styles.blur1}></div><div className={styles.blur2}></div>
    <div className={styles.left}>
      <span className={styles.badge}><FaGraduationCap /> Plataforma de Estudos</span>
      <h1>Olá, {userName}! 👋</h1>
      <p>Continue sua preparação no seu ritmo. Escolha uma prova, pratique questões reais e acompanhe sua evolução no CapVest.</p>
      <div className={styles.buttons}><button className={styles.primary} onClick={() => navigate("/questoes")}>Praticar questões <FaArrowRight /></button><button className={styles.secondary} onClick={() => navigate("/materiais")}><FaCalendarAlt /> Explorar provas</button></div>
    </div>
    <div className={styles.right}><div className={styles.goalCard}><div className={styles.goalHeader}><FaBullseye /><span>Seu próximo passo</span></div><h2>Uma questão por vez.</h2><h3>Estude com provas anteriores</h3><div className={styles.progressBar}><div className={styles.progress} style={{ width: "100%" }}></div></div><div className={styles.footer}><span>Pratique</span><span>Aprenda · Evolua</span></div></div></div>
  </section>;
}
