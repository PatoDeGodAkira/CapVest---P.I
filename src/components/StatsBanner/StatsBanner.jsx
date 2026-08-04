import styles from "./StatsBanner.module.css";

import {
    FaBookOpen,
    FaFileAlt,
    FaClipboardCheck,
    FaGraduationCap
} from "react-icons/fa";

export default function StatsBanner({ materials }) {

    const totals = materials.reduce(
        (acc, item) => {

            acc.documents += item.stats.documents;
            acc.provas += item.stats.provas;
            acc.editais += item.stats.editais;
            acc.gabaritos += item.stats.gabaritos;

            return acc;

        },
        {
            documents: 0,
            provas: 0,
            editais: 0,
            gabaritos: 0
        }
    );

    return (

        <section className={styles.banner}>

            <div className={styles.card}>

                <div className={styles.icon}>
                    <FaBookOpen />
                </div>

                <div>

                    <h2>{totals.documents}</h2>

                    <span>Documentos</span>

                </div>

            </div>

            <div className={styles.card}>

                <div className={styles.icon}>
                    <FaGraduationCap />
                </div>

                <div>

                    <h2>{totals.provas}</h2>

                    <span>Provas</span>

                </div>

            </div>

            <div className={styles.card}>

                <div className={styles.icon}>
                    <FaFileAlt />
                </div>

                <div>

                    <h2>{totals.editais}</h2>

                    <span>Editais</span>

                </div>

            </div>

            <div className={styles.card}>

                <div className={styles.icon}>
                    <FaClipboardCheck />
                </div>

                <div>

                    <h2>{totals.gabaritos}</h2>

                    <span>Gabaritos</span>

                </div>

            </div>

        </section>

    );

}