import styles from "./Sidebar.module.css";

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
    label: "Início"
  },
  {
    icon: <FaBook />,
    label: "Questões"
  },
  {
    icon: <FaClipboardList />,
    label: "Simulados"
  },
  {
    icon: <FaPen />,
    label: "Redações"
  },
  {
    icon: <FaCalendarAlt />,
    label: "Cronograma"
  },
  {
    icon: <FaTrophy />,
    label: "Ranking"
  },
  {
    icon: <FaChartLine />,
    label: "Desempenho"
  },
  {
    icon: <FaFolder />,
    label: "Materiais"
  },
  {
    icon: <FaCog />,
    label: "Configurações"
  }
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          <img
            src="/assets/logo.jpg"
            alt="Logo CapVest"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          <h2>CapVest</h2>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}></div>

          <div>
            <h4>João Silva</h4>
            <span>Estudante</span>
          </div>
        </div>

        <div className={styles.search}>
          <FaSearch />

          <input
            placeholder="Pesquisar..."
          />
        </div>

        <nav>
          {menu.map((item) => (
            <button key={item.label}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button className={styles.logout}>
        <FaSignOutAlt />
        Sair
      </button>
    </aside>
  );
}