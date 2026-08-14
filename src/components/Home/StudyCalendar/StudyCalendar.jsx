import styles from "./StudyCalendar.module.css";

import {
    FaChevronLeft,
    FaChevronRight,
    FaCalendarCheck,
    FaBook
} from "react-icons/fa";

const week = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const days = Array.from({length:31},(_,i)=>i+1);

const events=[
    "Revisão de Matemática",
    "Simulado ENEM",
    "Entrega da Redação",
    "Vestibular UNICAMP"
];

export default function StudyCalendar(){

    return(

        <section className={styles.calendar}>

            <div className={styles.header}>

                <div>

                    <h2>Calendário de Estudos</h2>

                    <p>
                        Organize sua rotina e acompanhe seus eventos.
                    </p>

                </div>

                <div className={styles.navigation}>

                    <button>

                        <FaChevronLeft/>

                    </button>

                    <span>

                        Agosto • 2026

                    </span>

                    <button>

                        <FaChevronRight/>

                    </button>

                </div>

            </div>

            <div className={styles.content}>

                <div className={styles.month}>

                    <div className={styles.week}>

                        {

                            week.map(day=>

                                <span key={day}>

                                    {day}

                                </span>

                            )

                        }

                    </div>

                    <div className={styles.days}>

                        {

                            days.map(day=>

                                <div
                                    key={day}
                                    className={`${styles.day} ${day===8 || day===15 || day===21 ? styles.active : ""}`}
                                >

                                    {day}

                                </div>

                            )

                        }

                    </div>

                </div>

                <aside className={styles.events}>

                    <h3>

                        Próximos Eventos

                    </h3>

                    {

                        events.map((event,index)=>

                            <div
                                key={index}
                                className={styles.event}
                            >

                                <FaBook/>

                                <span>

                                    {event}

                                </span>

                            </div>

                        )

                    }

                </aside>

            </div>

            <div className={styles.footer}>

                <div>

                    <FaCalendarCheck/>

                    <span>

                        18 dias estudados neste mês

                    </span>

                </div>

                <strong>

                    62 horas estudadas

                </strong>

            </div>

        </section>

    );

}