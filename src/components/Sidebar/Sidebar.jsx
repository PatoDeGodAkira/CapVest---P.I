import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaBook, FaFolder, FaUser, FaSignOutAlt, FaSearch, FaTrophy, FaPenNib, FaCalendarAlt, FaChartLine, FaClipboardList } from "react-icons/fa";
import styles from "./Sidebar.module.css";

const menu = [
  { icon: <FaHome />, label: "Início", path: "/home" },
  { icon: <FaBook />, label: "Questões", path: "/questoes" },
  { icon: <FaClipboardList />, label: "Simulados", path: "/simulados" },
  { icon: <FaCalendarAlt />, label: "Cronograma", path: "/cronograma" },
  { icon: <FaPenNib />, label: "Redações", path: "/redacoes" },
  { icon: <FaChartLine />, label: "Desempenho", path: "/desempenho" },
  { icon: <FaClipboardList />, label: "Simulados", path: "/simulados" },
  { icon: <FaCalendarAlt />, label: "Cronograma", path: "/cronograma" },
  { icon: <FaPenNib />, label: "Redações", path: "/redacoes" },
  { icon: <FaFolder />, label: "Materiais", path: "/materiais" },
  { icon: <FaChartLine />, label: "Desempenho", path: "/desempenho" },
  { icon: <FaTrophy />, label: "Ranking", path: "/ranking" },
  { icon: <FaUser />, label: "Meu perfil", path: "/perfil" }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; } });
  useEffect(() => {
    const refreshUser = () => { try { setUser(JSON.parse(localStorage.getItem("user")) || null); } catch { setUser(null); } };
    window.addEventListener("capvest:user-updated", refreshUser);
    return () => window.removeEventListener("capvest:user-updated", refreshUser);
  }, []);
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };
  return <aside className={styles.sidebar}><div><NavLink to="/home" className={styles.logo}><img src="/assets/logo-capvest.svg" alt="Logo CapVest"/><h2>CapVest</h2></NavLink><NavLink to="/perfil" className={styles.profile}><div className={styles.avatar}><img src={user?.avatar_url || "/assets/avatar-default.svg"} alt=""/></div><div><h4>{user?.name || "Usuário"}</h4><span>Estudante</span></div></NavLink><div className={styles.search}><FaSearch/><input placeholder="Pesquisar..." onKeyDown={event=>{if(event.key==="Enter"&&event.currentTarget.value.trim())navigate(`/questoes?search=${encodeURIComponent(event.currentTarget.value.trim())}`)}}/></div><nav>{menu.map(item=><NavLink key={item.path} to={item.path} className={({isActive})=>`${styles.menuItem} ${isActive?styles.active:""}`}>{item.icon}<span>{item.label}</span></NavLink>)}</nav></div><button type="button" className={styles.logout} onClick={handleLogout}><FaSignOutAlt/><span>Sair</span></button></aside>;
}
