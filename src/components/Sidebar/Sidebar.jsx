import styles from "./Sidebar.module.css";

import { NavLink } from "react-router-dom";

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
  return (
    <aside className={styles.sidebar}>
      <div>

        {/* LOGO */}

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

        {/* PERFIL */}

        <NavLink
          to="/perfil"
          className={styles.profile}
        >
          <div className={styles.avatar}></div>

          <div>
            <h4>João Silva</h4>
            <span>Estudante</span>
          </div>
        </NavLink>

        {/* PESQUISA */}

        <div className={styles.search}>
          <FaSearch />

          <input
            type="text"
            placeholder="Pesquisar..."
          />
        </div>

        {/* MENU */}

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

      {/* SAIR */}

      <NavLink
        to="/"
        className={styles.logout}
      >
        <FaSignOutAlt />

        <span>Sair</span>

      </NavLink>

    </aside>
  );
}