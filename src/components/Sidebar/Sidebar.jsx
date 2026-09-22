import { useState } from "react";
import styles from "./Sidebar.module.css";

import { NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaBook,
  FaClipboardList,
  FaPen,
  FaCalendarAlt,
  FaTrophy,
  FaChartLine,
  FaFolder,
  FaCog,
  FaSearch,
  FaSignOutAlt
} from "react-icons/fa";

const menu = [
  {
    icon: <FaHome />,
    label: "Início",
    path: "/home"
  },
  {
    icon: <FaBook />,
    label: "Questões",
    path: "/questoes"
  },
  {
    icon: <FaClipboardList />,
    label: "Simulados",
    path: "/simulados"
  },
  {
    icon: <FaPen />,
    label: "Redações",
    path: "/redacoes"
  },
  {
    icon: <FaCalendarAlt />,
    label: "Cronograma",
    path: "/cronograma"
  },
  {
    icon: <FaTrophy />,
    label: "Ranking",
    path: "/ranking"
  },
  {
    icon: <FaChartLine />,
    label: "Desempenho",
    path: "/desempenho"
  },
  {
    icon: <FaFolder />,
    label: "Materiais",
    path: "/materiais"
  },
  {
    icon: <FaCog />,
    label: "Configurações",
    path: "/configuracoes"
  }
];

export default function Sidebar() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <aside className={styles.sidebar}>
      <div>

        <NavLink
          to="/home"
          className={styles.logo}
        >
          <img
            src="/assets/logo.jpg"
            alt="Logo CapVest"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          <h2>CapVest</h2>
        </NavLink>

        <NavLink
          to="/perfil"
          className={styles.profile}
        >
          <div className={styles.avatar}></div>

          <div>
            <h4>
              {user?.name || "Usuário"}
            </h4>

            <span>
              Estudante
            </span>
          </div>
        </NavLink>

        <div className={styles.search}>
          <FaSearch />

          <input
            type="text"
            placeholder="Pesquisar..."
          />
        </div>

        <nav>
          {menu.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `${styles.menuItem} ${
                  isActive ? styles.active : ""
                }`
              }
            >
              {item.icon}

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

      </div>

      <button
        type="button"
        className={styles.logout}
        onClick={handleLogout}
      >
        <FaSignOutAlt />

        <span>Sair</span>
      </button>

    </aside>
  );
}