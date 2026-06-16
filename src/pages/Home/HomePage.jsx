import styles from "./HomePage.module.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import Calendar from "../../components/Calendar/Calendar";

import {
  notices,
  news,
  activities,
  events
} from "../../data/mockData";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.grid}>
          <DashboardCard title="Avisos">
            {notices.map((item) => (
              <div key={item}>
                {item}
              </div>
            ))}
          </DashboardCard>

          <DashboardCard title="Atividades Pendentes">
            <div className={styles.bigNumber}>
              {activities}
            </div>

            <p>
              Atividades aguardando conclusão
            </p>
          </DashboardCard>

          <DashboardCard title="Notícias e Vestibulares">
            {news.map((item) => (
              <div key={item.title}>
                <strong>
                  {item.title}
                </strong>

                <small>
                  {item.category}
                </small>
              </div>
            ))}
          </DashboardCard>

          <DashboardCard title="Acesso Rápido">
            <div className={styles.quickGrid}>
              <button>
                Resolver Questões
              </button>

              <button>
                Fazer Simulado
              </button>

              <button>
                Enviar Redação
              </button>

              <button>
                Ver Desempenho
              </button>

              <button>
                Ranking Geral
              </button>

              <button>
                Cronograma
              </button>
            </div>
          </DashboardCard>

          <div
            className={styles.calendarCard}
          >
            <DashboardCard title="Calendário de Estudos">
              <Calendar />

              <div className={styles.events}>
                {events.map((event) => (
                  <div key={event.title}>
                    <strong>
                      Dia {event.day}
                    </strong>

                    <span>
                      {event.title}
                    </span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}