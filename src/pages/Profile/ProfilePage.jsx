import styles from "./ProfilePage.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";

import {
  FaMedal,
  FaBullseye,
  FaChartLine,
  FaBook,
  FaClock,
  FaFire,
  FaBrain,
  FaPenNib,
  FaGraduationCap,
  FaStar
} from "react-icons/fa";

export default function ProfilePage() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const userName = user?.name || "Usuário";
  const userUsername = user?.username || "usuario";
  const userAvatar =
    user?.avatar_url || "https://i.pravatar.cc/300";
  const userBio =
    user?.bio ||
    "Nenhuma montanha é alta demais para quem sobe um dia de cada vez.";

  const stats = [
    {
      title: "Questões Respondidas",
      value: "12.450",
      icon: <FaBook />
    },
    {
      title: "Precisão Geral",
      value: "82%",
      icon: <FaBullseye />
    },
    {
      title: "Horas Estudadas",
      value: "786h",
      icon: <FaClock />
    },
    {
      title: "Sequência",
      value: "128 dias",
      icon: <FaFire />
    },
    {
      title: "Simulados",
      value: "42",
      icon: <FaGraduationCap />
    },
    {
      title: "Redações",
      value: "19",
      icon: <FaPenNib />
    }
  ];

  const badges = [
    "Mestre da Matemática",
    "10 Mil Questões",
    "100 Dias Consecutivos",
    "Capivara Persistente",
    "Especialista em Simulados",
    "Maratonista dos Estudos"
  ];

  const subjects = [
    {
      name: "Matemática",
      progress: 94
    },
    {
      name: "Física",
      progress: 84
    },
    {
      name: "Química",
      progress: 76
    },
    {
      name: "Português",
      progress: 89
    },
    {
      name: "Biologia",
      progress: 70
    }
  ];

  const simulations = [
    {
      exam: "UNICAMP",
      score: "91%",
      date: "Ontem"
    },
    {
      exam: "ENEM",
      score: "87%",
      date: "3 dias"
    },
    {
      exam: "FUVEST",
      score: "82%",
      date: "1 semana"
    },
    {
      exam: "UNESP",
      score: "89%",
      date: "2 semanas"
    }
  ];

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.content}>
        <div className={styles.background}></div>

        <section className={styles.hero}>

          <div className={styles.banner}></div>

          <div className={styles.heroContent}>

            <img
              src={userAvatar}
              alt={userName}
              className={styles.avatar}
            />

            <div className={styles.heroInfo}>

              <span className={styles.level}>
                Capivara Persistente • Nível 18
              </span>

              <h1>
                {userName}
              </h1>

              <p className={styles.user}>
                @{userUsername}
              </p>

              <p className={styles.bio}>
                {userBio}
              </p>

              <div className={styles.tags}>

                <span>UNICAMP</span>

                <span>Ciência da Computação</span>

                <span>Vestibular 2027</span>

              </div>

            </div>

            <button className={styles.editButton}>
              Editar Perfil
            </button>

          </div>

        </section>

        <section className={styles.xpCard}>

          <div className={styles.xpTop}>

            <div>

              <h2>Experiência de Estudos</h2>

              <p>
                Você está entre os 8% estudantes mais ativos da plataforma.
              </p>

            </div>

            <strong>2350 XP</strong>

          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: "72%" }}
            ></div>
          </div>

          <span>
            Faltam 900 XP para alcançar o Nível 19
          </span>

        </section>

        <section className={styles.statsGrid}>

          {stats.map((item) => (

            <div
              key={item.title}
              className={styles.statCard}
            >

              <div className={styles.statIcon}>
                {item.icon}
              </div>

              <div>

                <span>{item.title}</span>

                <strong>{item.value}</strong>

              </div>

            </div>

          ))}

        </section>

        <section className={styles.doubleGrid}>

          <div className={styles.goalCard}>

            <div className={styles.cardHeader}>
              <FaBullseye />
              <h2>Objetivo Atual</h2>
            </div>

            <h3>
              Ciência da Computação
            </h3>

            <p>
              Universidade Estadual de Campinas
            </p>

            <div className={styles.goalProgress}>
              <div style={{ width: "63%" }}></div>
            </div>

            <span>63% concluído</span>

          </div>

          <div className={styles.chartCard}>

            <div className={styles.cardHeader}>
              <FaChartLine />
              <h2>Evolução</h2>
            </div>

            <div className={styles.fakeChart}>

              <div style={{ height: "55%" }}></div>
              <div style={{ height: "68%" }}></div>
              <div style={{ height: "74%" }}></div>
              <div style={{ height: "83%" }}></div>
              <div style={{ height: "72%" }}></div>
              <div style={{ height: "92%" }}></div>

            </div>

          </div>

        </section>

        <section className={styles.heatmapCard}>

          <div className={styles.cardHeader}>
            <FaBrain />
            <h2>Mapa de Estudos</h2>
          </div>

          <div className={styles.heatmap}>

            {Array.from({ length: 140 }).map((_, index) => (

              <div
                key={index}
                className={`${styles.square} ${
                  index % 5 === 0
                    ? styles.active
                    : ""
                }`}
              ></div>

            ))}

          </div>

        </section>

        <section className={styles.badgesCard}>

          <div className={styles.cardHeader}>
            <FaMedal />
            <h2>Conquistas</h2>
          </div>

          <div className={styles.badges}>

            {badges.map((badge) => (

              <div
                key={badge}
                className={styles.badge}
              >

                <FaStar />

                {badge}

              </div>

            ))}

          </div>

        </section>

        <section className={styles.bottomGrid}>

          <div className={styles.subjectCard}>

            <div className={styles.cardHeader}>
              <FaBook />
              <h2>Desempenho por Matéria</h2>
            </div>

            {subjects.map((subject) => (

              <div
                key={subject.name}
                className={styles.subject}
              >

                <div className={styles.subjectTop}>
                  <span>{subject.name}</span>
                  <span>{subject.progress}%</span>
                </div>

                <div className={styles.subjectBar}>
                  <div
                    style={{
                      width: `${subject.progress}%`
                    }}
                  ></div>
                </div>

              </div>

            ))}

          </div>

          <div className={styles.historyCard}>

            <div className={styles.cardHeader}>
              <FaGraduationCap />
              <h2>Últimos Simulados</h2>
            </div>

            <table>

              <thead>

                <tr>

                  <th>Prova</th>

                  <th>Nota</th>

                  <th>Data</th>

                </tr>

              </thead>

              <tbody>

                {simulations.map((sim) => (

                  <tr key={sim.exam}>

                    <td>{sim.exam}</td>

                    <td>{sim.score}</td>

                    <td>{sim.date}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>
    </div>
  );
}