import styles from "./TodayFocusCard.module.css";

import {
    FaBookOpen,
    FaCheckCircle,
    FaClock,
    FaPlay
} from "react-icons/fa";

export default function ContinueCard(){

    return(

        <section className={styles.card}>

            <div className={styles.header}>

                <div>

                    <h2>Plano de Estudos de Hoje</h2>

                    <p>
                        Continue sua rotina diária.
                    </p>

                </div>

                <span className={styles.time}>

                    <FaClock/>

                    2h 40min

                </span>

            </div>

            <div className={styles.progressArea}>

                <div className={styles.progressTop}>

                    <span>Progresso Diário</span>

                    <strong>40%</strong>

                </div>

                <div className={styles.progressBar}>

                    <div className={styles.progress}></div>

                </div>

            </div>

            <div className={styles.tasks}>

                <div className={styles.done}>

                    <FaCheckCircle/>

                    <div>

                        <strong>Matemática</strong>

                        <span>Funções Exponenciais</span>

                    </div>

                </div>

                <div className={styles.task}>

                    <FaBookOpen/>

                    <div>

                        <strong>Física</strong>

                        <span>Leis de Newton</span>

                    </div>

                </div>

                <div className={styles.task}>

                    <FaBookOpen/>

                    <div>

                        <strong>Redação</strong>

                        <span>Competência 3</span>

                    </div>

                </div>

                <div className={styles.task}>

                    <FaBookOpen/>

                    <div>

                        <strong>Química</strong>

                        <span>Estequiometria</span>

                    </div>

                </div>

            </div>

            <button className={styles.button}>

                <FaPlay/>

                Continuar Estudando

            </button>

        </section>

    );

}