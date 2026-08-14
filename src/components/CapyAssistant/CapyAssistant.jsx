import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaTimes,
    FaArrowRight,
    FaFilter,
    FaBookOpen
} from "react-icons/fa";

import styles from "./CapyAssistant.module.css";

export default function CapyAssistant() {

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [vestibular, setVestibular] = useState("Todos");

    const [searched, setSearched] = useState(false);

    const handleSearch = () => {

        if (!search.trim()) return;

        setSearched(true);

    };

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {
            handleSearch();
        }

    };

    const handleGoToQuestions = () => {

        const params = new URLSearchParams();

        params.set("search", search);

        if (vestibular !== "Todos") {
            params.set(
                "vestibular",
                vestibular.toLowerCase()
            );
        }

        navigate(`/questoes?${params.toString()}`);

    };

    return (

        <div className={styles.assistant}>

            {/* JANELA DO ASSISTENTE */}

            {open && (

                <div className={styles.panel}>

                    <div className={styles.panelHeader}>

                        <div className={styles.capyIcon}>
                            🦫
                        </div>

                        <div>

                            <h3>
                                Capy
                            </h3>

                            <span>
                                Assistente de questões
                            </span>

                        </div>

                        <button
                            className={styles.closeButton}
                            onClick={() => setOpen(false)}
                            aria-label="Fechar assistente"
                        >
                            <FaTimes />
                        </button>

                    </div>


                    <div className={styles.message}>

                        <div className={styles.messageCapy}>
                            🦫
                        </div>

                        <p>
                            Oi! Eu posso te ajudar a encontrar
                            questões para estudar.
                        </p>

                    </div>


                    <div className={styles.searchArea}>

                        <label>
                            O que você quer estudar?
                        </label>

                        <div className={styles.searchBox}>

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setSearched(false);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Ex.: Revolução Francesa"
                            />

                            {search && (

                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setSearched(false);
                                    }}
                                    className={styles.clearButton}
                                >
                                    <FaTimes />
                                </button>

                            )}

                        </div>

                    </div>


                    <div className={styles.filters}>

                        <div className={styles.filterTitle}>

                            <FaFilter />

                            <span>
                                Vestibular
                            </span>

                        </div>

                        <div className={styles.filterButtons}>

                            {[
                                "Todos",
                                "ENEM",
                                "UNICAMP",
                                "FUVEST"
                            ].map((item) => (

                                <button
                                    key={item}
                                    className={
                                        vestibular === item
                                            ? styles.activeFilter
                                            : ""
                                    }
                                    onClick={() => {
                                        setVestibular(item);
                                        setSearched(false);
                                    }}
                                >
                                    {item}
                                </button>

                            ))}

                        </div>

                    </div>


                    <button
                        className={styles.searchButton}
                        onClick={handleSearch}
                        disabled={!search.trim()}
                    >

                        <FaSearch />

                        Pesquisar questões

                    </button>


                    {searched && (

                        <div className={styles.results}>

                            <div className={styles.resultHeader}>

                                <div>

                                    <span>
                                        Resultado da pesquisa
                                    </span>

                                    <strong>
                                        {search}
                                    </strong>

                                </div>

                                <FaBookOpen />

                            </div>


                            <p className={styles.resultDescription}>

                                Encontramos questões relacionadas
                                ao tema pesquisado.

                            </p>


                            <div className={styles.resultInfo}>

                                <span>
                                    Vestibular:
                                </span>

                                <strong>
                                    {vestibular}
                                </strong>

                            </div>


                            <button
                                className={styles.questionsButton}
                                onClick={handleGoToQuestions}
                            >

                                Ver questões

                                <FaArrowRight />

                            </button>

                        </div>

                    )}

                    {!searched && (

                        <div className={styles.tip}>

                            <span>💡</span>

                            <p>
                                Você pode pesquisar por uma matéria,
                                assunto ou tema específico.
                            </p>

                        </div>

                    )}

                </div>

            )}


            {/* CAPIVARA */}

            <button
                className={`${styles.capyButton} ${
                    open ? styles.capyOpen : ""
                }`}
                onClick={() => setOpen(!open)}
                aria-label="Abrir assistente de questões"
            >

                <div className={styles.capyFace}>

                    <div className={styles.earLeft}></div>

                    <div className={styles.earRight}></div>

                    <div className={styles.eyes}>

                        <span></span>
                        <span></span>

                    </div>

                    <div className={styles.nose}></div>

                    <div className={styles.muzzle}></div>

                </div>

            </button>

        </div>

    );

}