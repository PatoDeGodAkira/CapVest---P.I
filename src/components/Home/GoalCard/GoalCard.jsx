import styles from "./GoalCard.module.css";

import {
    FaGraduationCap,
    FaBullseye,
    FaClock,
    FaArrowUp
} from "react-icons/fa";

export default function GoalCard(){

    return(

        <section className={styles.card}>

            <div className={styles.header}>

                <div className={styles.icon}>

                    <FaGraduationCap/>

                </div>

                <div>

                    <span className={styles.subtitle}>

                        Objetivo Principal

                    </span>

                    <h2>

                        Ciência da Computação

                    </h2>

                    <p>

                        UNICAMP • Vestibular 2027

                    </p>

                </div>

            </div>

            <div className={styles.progressArea}>

                <div className={styles.progressHeader}>

                    <span>Preparação</span>

                    <strong>63%</strong>

                </div>

                <div className={styles.progressBar}>

                    <div className={styles.fill}></div>

                </div>

            </div>

            <div className={styles.stats}>

                <div>

                    <FaBullseye/>

                    <div>

                        <small>Meta da Semana</small>

                        <strong>350 Questões</strong>

                    </div>

                </div>

                <div>

                    <FaClock/>

                    <div>

                        <small>Horas Estudadas</small>

                        <strong>26h</strong>

                    </div>

                </div>

            </div>

            <button className={styles.button}>

                <FaArrowUp/>

                Ver Plano Completo

            </button>

        </section>

    );

}