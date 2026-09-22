import styles from "./HeroBanner.module.css";

import {
    FaArrowRight,
    FaCalendarAlt,
    FaGraduationCap,
    FaBullseye
} from "react-icons/fa";

export default function HeroBanner() {

    let user = null;

    try {
        user = JSON.parse(
            localStorage.getItem("user")
        );
    } catch {
        user = null;
    }

    const userName = user?.name || "Estudante";

    return (

        <section className={styles.hero}>

            <div className={styles.blur1}></div>
            <div className={styles.blur2}></div>

            <div className={styles.left}>

                <span className={styles.badge}>

                    <FaGraduationCap />

                    Plataforma de Estudos

                </span>

                <h1>

                    Bom dia, {userName} 👋

                </h1>

                <p>

                    Continue firme! Cada questão respondida hoje
                    é mais um passo rumo à sua aprovação em
                    <strong> Ciência da Computação - UNICAMP.</strong>

                </p>

                <div className={styles.buttons}>

                    <button className={styles.primary}>

                        Continuar Estudos

                        <FaArrowRight />

                    </button>

                    <button className={styles.secondary}>

                        <FaCalendarAlt />

                        Ver Cronograma

                    </button>

                </div>

            </div>

            <div className={styles.right}>

                <div className={styles.goalCard}>

                    <div className={styles.goalHeader}>

                        <FaBullseye />

                        <span>Meta Principal</span>

                    </div>

                    <h2>

                        UNICAMP

                    </h2>

                    <h3>

                        Ciência da Computação

                    </h3>

                    <div className={styles.progressBar}>

                        <div className={styles.progress}></div>

                    </div>

                    <div className={styles.footer}>

                        <span>64%</span>

                        <span>Vestibular 2027</span>

                    </div>

                </div>

            </div>

        </section>

    );
}