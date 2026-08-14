import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";

import {
    FaSearch,
    FaFilter,
    FaBookOpen,
    FaCalendarAlt,
    FaGraduationCap,
    FaChevronDown,
    FaCheckCircle
} from "react-icons/fa";

import styles from "./QuestionsPage.module.css";

const questions = [
    {
        id: 1,
        vestibular: "UNICAMP",
        year: "2023",
        subject: "História",
        topic: "Revolução Francesa",
        difficulty: "Média",
        text: "A Revolução Francesa marcou profundamente a história política e social da Europa. Sobre esse processo histórico, assinale a alternativa correta.",
        alternatives: [
            "A Revolução Francesa manteve os privilégios da nobreza.",
            "O processo revolucionário contribuiu para o fim de privilégios feudais.",
            "A Revolução Francesa ocorreu durante a Idade Média.",
            "O movimento foi liderado exclusivamente pela aristocracia."
        ]
    },
    {
        id: 2,
        vestibular: "FUVEST",
        year: "2022",
        subject: "História",
        topic: "Revolução Francesa",
        difficulty: "Difícil",
        text: "Durante o processo revolucionário francês, diferentes grupos políticos disputaram espaço e influência. A respeito desse contexto, é correto afirmar que:",
        alternatives: [
            "Os jacobinos defendiam a manutenção integral do Antigo Regime.",
            "A burguesia não participou das transformações políticas.",
            "Os grupos revolucionários apresentavam diferentes projetos para a sociedade.",
            "A Revolução não produziu mudanças institucionais."
        ]
    },
    {
        id: 3,
        vestibular: "ENEM",
        year: "2021",
        subject: "História",
        topic: "Revolução Francesa",
        difficulty: "Fácil",
        text: "A Revolução Francesa é frequentemente associada aos ideais de liberdade, igualdade e fraternidade. Esses princípios estavam relacionados:",
        alternatives: [
            "À defesa dos privilégios estamentais.",
            "À manutenção do absolutismo.",
            "À contestação das estruturas sociais do Antigo Regime.",
            "À expansão dos direitos exclusivos da nobreza."
        ]
    }
];

export default function QuestionsPage() {

    const [searchParams, setSearchParams] = useSearchParams();

    const initialSearch = searchParams.get("search") || "";
    const initialVestibular = searchParams.get("vestibular") || "todos";

    const [search, setSearch] = useState(initialSearch);
    const [vestibular, setVestibular] = useState(
        initialVestibular.toUpperCase()
    );

    const [subject, setSubject] = useState("Todas");
    const [difficulty, setDifficulty] = useState("Todas");

    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const handleSearch = () => {

        const params = {};

        if (search.trim()) {
            params.search = search;
        }

        if (vestibular !== "TODOS") {
            params.vestibular = vestibular.toLowerCase();
        }

        setSearchParams(params);

    };

    const filteredQuestions = questions.filter((question) => {

        const matchesSearch =
            !search.trim() ||
            question.topic
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            question.subject
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            question.text
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesVestibular =
            vestibular === "TODOS" ||
            question.vestibular === vestibular;

        const matchesSubject =
            subject === "Todas" ||
            question.subject === subject;

        const matchesDifficulty =
            difficulty === "Todas" ||
            question.difficulty === difficulty;

        return (
            matchesSearch &&
            matchesVestibular &&
            matchesSubject &&
            matchesDifficulty
        );

    });

    return (

        <div className={styles.layout}>

            <Sidebar />

            <main className={styles.main}>

                {/* CABEÇALHO */}

                <header className={styles.header}>

                    <div>

                        <span className={styles.eyebrow}>
                            BANCO DE QUESTÕES
                        </span>

                        <h1>
                            Questões
                        </h1>

                        <p>
                            Encontre questões dos principais vestibulares
                            e pratique os assuntos que precisa dominar.
                        </p>

                    </div>

                    <div className={styles.headerIcon}>
                        <FaBookOpen />
                    </div>

                </header>


                {/* PESQUISA */}

                <section className={styles.searchSection}>

                    <div className={styles.searchBox}>

                        <FaSearch />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            onKeyDown={(event) => {

                                if (event.key === "Enter") {
                                    handleSearch();
                                }

                            }}
                            placeholder="Pesquise por matéria, assunto ou tema..."
                        />

                        <button onClick={handleSearch}>
                            Pesquisar
                        </button>

                    </div>

                    <div className={styles.quickFilters}>

                        {[
                            "TODOS",
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

                                    const params = {};

                                    if (search.trim()) {
                                        params.search = search;
                                    }

                                    if (item !== "TODOS") {
                                        params.vestibular =
                                            item.toLowerCase();
                                    }

                                    setSearchParams(params);

                                }}
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </section>


                {/* FILTROS */}

                <section className={styles.filters}>

                    <div className={styles.filterHeading}>

                        <div>

                            <FaFilter />

                            <strong>
                                Filtros
                            </strong>

                        </div>

                        <span>
                            {filteredQuestions.length} questões encontradas
                        </span>

                    </div>


                    <div className={styles.filterGrid}>

                        <label>

                            <span>
                                Matéria
                            </span>

                            <div className={styles.selectWrapper}>

                                <select
                                    value={subject}
                                    onChange={(event) =>
                                        setSubject(event.target.value)
                                    }
                                >
                                    <option>Todas</option>
                                    <option>História</option>
                                    <option>Matemática</option>
                                    <option>Física</option>
                                    <option>Química</option>
                                    <option>Biologia</option>
                                    <option>Português</option>
                                </select>

                                <FaChevronDown />

                            </div>

                        </label>


                        <label>

                            <span>
                                Dificuldade
                            </span>

                            <div className={styles.selectWrapper}>

                                <select
                                    value={difficulty}
                                    onChange={(event) =>
                                        setDifficulty(event.target.value)
                                    }
                                >
                                    <option>Todas</option>
                                    <option>Fácil</option>
                                    <option>Média</option>
                                    <option>Difícil</option>
                                </select>

                                <FaChevronDown />

                            </div>

                        </label>


                        <label>

                            <span>
                                Ano
                            </span>

                            <div className={styles.selectWrapper}>

                                <select>

                                    <option>Todos</option>
                                    <option>2025</option>
                                    <option>2024</option>
                                    <option>2023</option>
                                    <option>2022</option>
                                    <option>2021</option>

                                </select>

                                <FaChevronDown />

                            </div>

                        </label>

                    </div>

                </section>


                {/* RESULTADOS */}

                <section className={styles.results}>

                    <div className={styles.resultsHeader}>

                        <div>

                            <h2>
                                Questões disponíveis
                            </h2>

                            <p>
                                Pratique e acompanhe seu desempenho.
                            </p>

                        </div>

                        <div className={styles.resultsCount}>

                            <FaCheckCircle />

                            {filteredQuestions.length} encontradas

                        </div>

                    </div>


                    <div className={styles.questionList}>

                        {filteredQuestions.map((question) => (

                            <article
                                className={styles.questionCard}
                                key={question.id}
                            >

                                <div className={styles.questionTop}>

                                    <div className={styles.questionTags}>

                                        <span className={styles.vestibularTag}>
                                            {question.vestibular}
                                        </span>

                                        <span>
                                            {question.subject}
                                        </span>

                                        <span>
                                            {question.topic}
                                        </span>

                                    </div>

                                    <span
                                        className={`${styles.difficulty} ${
                                            question.difficulty === "Fácil"
                                                ? styles.easy
                                                : question.difficulty === "Difícil"
                                                    ? styles.hard
                                                    : styles.medium
                                        }`}
                                    >
                                        {question.difficulty}
                                    </span>

                                </div>


                                <div className={styles.questionMeta}>

                                    <span>

                                        <FaCalendarAlt />

                                        {question.year}

                                    </span>

                                    <span>

                                        <FaGraduationCap />

                                        {question.vestibular}

                                    </span>

                                </div>


                                <p className={styles.questionText}>
                                    {question.text}
                                </p>


                                <div className={styles.questionActions}>

                                    <button
                                        onClick={() =>
                                            setSelectedQuestion(question)
                                        }
                                    >
                                        Resolver questão
                                    </button>

                                    <button className={styles.secondaryButton}>
                                        Ver detalhes
                                    </button>

                                </div>

                            </article>

                        ))}


                        {filteredQuestions.length === 0 && (

                            <div className={styles.empty}>

                                <div>
                                    🔎
                                </div>

                                <h3>
                                    Nenhuma questão encontrada
                                </h3>

                                <p>
                                    Tente pesquisar outro assunto ou
                                    alterar os filtros.
                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* MODAL DA QUESTÃO */}

                {selectedQuestion && (

                    <div
                        className={styles.modalOverlay}
                        onClick={() => setSelectedQuestion(null)}
                    >

                        <div
                            className={styles.modal}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className={styles.modalHeader}>

                                <div>

                                    <span>
                                        {selectedQuestion.vestibular} • {
                                            selectedQuestion.year
                                        }
                                    </span>

                                    <h2>
                                        Questão
                                    </h2>

                                </div>

                                <button
                                    onClick={() =>
                                        setSelectedQuestion(null)
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className={styles.modalTags}>

                                <span>
                                    {selectedQuestion.subject}
                                </span>

                                <span>
                                    {selectedQuestion.topic}
                                </span>

                                <span>
                                    {selectedQuestion.difficulty}
                                </span>

                            </div>


                            <p className={styles.modalQuestion}>
                                {selectedQuestion.text}
                            </p>


                            <div className={styles.alternatives}>

                                {selectedQuestion.alternatives.map(
                                    (alternative, index) => (

                                        <button key={alternative}>

                                            <span>
                                                {
                                                    String.fromCharCode(
                                                        65 + index
                                                    )
                                                }
                                            </span>

                                            {alternative}

                                        </button>

                                    )
                                )}

                            </div>


                            <div className={styles.modalFooter}>

                                <span>
                                    Selecione uma alternativa para responder.
                                </span>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}