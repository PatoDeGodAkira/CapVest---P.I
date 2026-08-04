import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import vestibulares from "../../data/vestibulares";

import styles from "./VestibularPage.module.css";

import {
    FaMapMarkerAlt,
    FaBookOpen,
    FaClipboardList,
    FaFileAlt,
    FaGraduationCap,
    FaHistory
} from "react-icons/fa";

export default function VestibularPage() {

    const { id } = useParams();

    const vestibular = vestibulares[id];

    if (!vestibular) {
        return (
            <h1 style={{ padding: "50px" }}>
                Vestibular não encontrado.
            </h1>
        );
    }

    return (

        <div className={styles.layout}>

            <Sidebar />

            <main className={styles.content}>

                {/* HERO */}

                <section
                    className={styles.hero}
                    style={{
                        backgroundImage: `url(${vestibular.banner})`
                    }}
                >

                    <div className={styles.overlay}></div>

                    <div className={styles.heroContent}>

                        <h1>{vestibular.nome}</h1>

                        <h2>{vestibular.subtitulo}</h2>

                    </div>

                </section>

                {/* SOBRE */}

                <section className={styles.about}>

                    <h2>Sobre</h2>

                    <p>

                        {vestibular.descricao}

                    </p>

                </section>

                {/* ESTATÍSTICAS */}

                <section className={styles.stats}>

                    {

                        vestibular.estatisticas.map((item) => (

                            <div
                                key={item.titulo}
                                className={styles.statCard}
                            >

                                <span>{item.titulo}</span>

                                <strong>{item.valor}</strong>

                            </div>

                        ))

                    }

                </section>

                {/* GALERIA */}

                <section className={styles.gallery}>

                    <div className={styles.sectionHeader}>

                        <h2>Galeria</h2>

                    </div>

                    <div className={styles.galleryGrid}>

                        {

                            vestibular.galeria.map((foto, index) => (

                                <img
                                    key={index}
                                    src={foto}
                                    alt=""
                                />

                            ))

                        }

                    </div>

                </section>

                {/* MATERIAIS */}

                <section className={styles.materials}>

                    <h2>

                        Materiais Oficiais

                    </h2>

                    <div className={styles.materialGrid}>

                        <div className={styles.materialCard}>

                            <FaClipboardList />

                            <h3>Editais</h3>

                            <p>

                                Todos os editais organizados por ano.

                            </p>

                        </div>

                        <div className={styles.materialCard}>

                            <FaFileAlt />

                            <h3>Provas</h3>

                            <p>

                                Primeira e Segunda fase.

                            </p>

                        </div>

                        <div className={styles.materialCard}>

                            <FaGraduationCap />

                            <h3>Gabaritos</h3>

                            <p>

                                Gabaritos oficiais.

                            </p>

                        </div>

                        <div className={styles.materialCard}>

                            <FaBookOpen />

                            <h3>Manuais</h3>

                            <p>

                                Guias do candidato.

                            </p>

                        </div>

                        <div className={styles.materialCard}>

                            <FaHistory />

                            <h3>Histórico</h3>

                            <p>

                                Linha do tempo do vestibular.

                            </p>

                        </div>

                    </div>

                </section>

                {/* TIMELINE */}

                <section className={styles.timeline}>

                    <h2>

                        Últimos Vestibulares

                    </h2>

                    <div className={styles.timelineList}>

                        {

                            [2027,2026,2025,2024,2023].map((ano)=> (

                                <div
                                    key={ano}
                                    className={styles.timelineCard}
                                >

                                    <FaMapMarkerAlt />

                                    <span>

                                        Vestibular {ano}

                                    </span>

                                </div>

                            ))

                        }

                    </div>

                </section>

            </main>

        </div>

    );

}