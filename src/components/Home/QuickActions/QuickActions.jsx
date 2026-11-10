import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaFolderOpen, FaTrophy, FaUser, FaArrowRight, FaCalendarAlt, FaPenNib, FaChartLine, FaUsers } from "react-icons/fa";
import styles from "./QuickActions.module.css";

const actions = [
  { icon: <FaBookOpen />, title: "Questões", text: "Pesquise e responda questões reais.", path: "/questoes" },
  { icon: <FaCalendarAlt />, title: "Cronograma", text: "Organize suas próximas sessões de estudo.", path: "/cronograma" },
  { icon: <FaPenNib />, title: "Redações", text: "Escreva e guarde suas produções.", path: "/redacoes" },
  { icon: <FaChartLine />, title: "Desempenho", text: "Acompanhe seus resultados e evolução.", path: "/desempenho" },
  { icon: <FaFolderOpen />, title: "Provas e materiais", text: "Acesse documentos dos vestibulares.", path: "/materiais" },
  { icon: <FaTrophy />, title: "Ranking", text: "Acompanhe a classificação dos estudantes.", path: "/ranking" },
  { icon: <FaUser />, title: "Meu perfil", text: "Veja seu XP, nível e conquistas.", path: "/perfil" },
  { icon: <FaUsers />, title: "Comunidade", text: "Compartilhe sua rotina de estudos.", path: "/comunidade" }
];

export default function QuickActions() {
  const navigate = useNavigate();
  return <section><div className={styles.header}><h2>Acesso Rápido</h2><span>Continue sua preparação pelo CapVest.</span></div><div className={styles.grid}>{actions.map((item) => <button type="button" key={item.path} className={styles.card} onClick={() => navigate(item.path)}><div className={styles.icon}>{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p><div className={styles.arrow}><FaArrowRight /></div></button>)}</div></section>;
}
