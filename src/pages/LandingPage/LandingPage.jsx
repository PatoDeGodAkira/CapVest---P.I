import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

import {
    FaArrowRight,
    FaBook,
    FaChartLine,
    FaClipboardCheck,
    FaCalendarAlt,
    FaPen,
    FaGraduationCap,
    FaUsers,
    FaBullseye,
    FaCheckCircle
} from "react-icons/fa";

export default function LandingPage() {

    const creators = [
        {
            name: "Elias",
            role: "Desenvolvimento",
            image: "/assets/elias.jpg"
        },
        {
            name: "Lucca",
            role: "Desenvolvimento",
            image: "/assets/lucca.jpg"
        },
        {
            name: "Yasmin",
            role: "Projeto e Desenvolvimento",
            image: "/assets/yasmin.jpg"
        },
        {
            name: "Arthur",
            role: "Projeto e Desenvolvimento",
            image: "/assets/arthur.jpg"
        }
    ];

    const features = [
        {
            icon: <FaBook />,
            title: "Questões",
            text: "Pratique com questões organizadas para reforçar seus conhecimentos."
        },
        {
            icon: <FaClipboardCheck />,
            title: "Simulados",
            text: "Teste seus conhecimentos e acompanhe sua evolução ao longo da preparação."
        },
        {
            icon: <FaChartLine />,
            title: "Desempenho",
            text: "Visualize seus resultados e descubra onde concentrar seus estudos."
        },
        {
            icon: <FaCalendarAlt />,
            title: "Cronograma",
            text: "Organize sua rotina e transforme seus objetivos em uma rotina de estudos."
        },
        {
            icon: <FaPen />,
            title: "Redações",
            text: "Pratique sua escrita e acompanhe sua evolução nas redações."
        },
        {
            icon: <FaBullseye />,
            title: "Metas",
            text: "Defina seus objetivos e acompanhe cada passo até chegar lá."
        }
    ];

    return (
        <div className={styles.page}>

            <header className={styles.header}>

                <Link
                    to="/"
                    className={styles.logo}
                >
                    <img
                        src="/assets/logo.jpg"
                        alt="CapVest"
                        onError={(event) => {
                            event.target.style.display = "none";
                        }}
                    />

                    <span>CapVest</span>
                </Link>

                <nav className={styles.nav}>

                    <a href="#sobre">
                        Sobre
                    </a>

                    <a href="#recursos">
                        Recursos
                    </a>

                    <a href="#criadores">
                        Criadores
                    </a>

                </nav>

                <Link
                    to="/login"
                    className={styles.headerButton}
                >
                    Entrar
                    <FaArrowRight />
                </Link>

            </header>


            <main>

                <section className={styles.hero}>

                    <div className={styles.heroBackground}></div>

                    <div className={styles.heroContent}>

                        <div className={styles.heroText}>

                            <span className={styles.eyebrow}>
                                <FaGraduationCap />
                                Sua jornada começa aqui
                            </span>

                            <h1>
                                Estudar para o vestibular
                                <strong> pode ser diferente.</strong>
                            </h1>

                            <p>
                                O CapVest reúne tudo o que você precisa
                                para organizar seus estudos, acompanhar
                                seu desempenho e chegar cada vez mais
                                perto da sua aprovação.
                            </p>

                            <div className={styles.heroButtons}>

                                <Link
                                    to="/login"
                                    className={styles.primaryButton}
                                >
                                    Começar agora
                                    <FaArrowRight />
                                </Link>

                                <a
                                    href="#sobre"
                                    className={styles.secondaryButton}
                                >
                                    Conhecer o CapVest
                                </a>

                            </div>

                            <div className={styles.heroInfo}>

                                <div>
                                    <FaCheckCircle />
                                    <span>Organização</span>
                                </div>

                                <div>
                                    <FaCheckCircle />
                                    <span>Acompanhamento</span>
                                </div>

                                <div>
                                    <FaCheckCircle />
                                    <span>Preparação</span>
                                </div>

                            </div>

                        </div>


                        <div className={styles.heroVisual}>

                            <div className={styles.blob}></div>

                            <div className={styles.capybaraGlow}></div>

                            <img
                                src="/assets/capybara-hero.png"
                                alt="Capivara mascote do CapVest"
                                className={styles.heroCapybara}
                                onError={(event) => {
                                    event.target.src =
                                        "https://images.unsplash.com/photo-1603483080228-04f2313d9f10?auto=format&fit=crop&w=900&q=80";
                                }}
                            />

                            <div className={styles.floatingCard}>
                                <div className={styles.floatingIcon}>
                                    <FaChartLine />
                                </div>

                                <div>
                                    <strong>
                                        Sua evolução
                                    </strong>

                                    <span>
                                        acompanhada de perto
                                    </span>
                                </div>
                            </div>

                            <div className={styles.floatingCardBottom}>

                                <FaBullseye />

                                <div>
                                    <strong>
                                        Meta definida
                                    </strong>

                                    <span>
                                        UNICAMP • 2027
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className={styles.scrollIndicator}>
                        <span></span>
                        Role para conhecer
                    </div>

                </section>


                <section
                    id="sobre"
                    className={styles.about}
                >

                    <div className={styles.sectionHeader}>

                        <span>
                            SOBRE O PROJETO
                        </span>

                        <h2>
                            O que é o CapVest?
                        </h2>

                        <p>
                            Uma plataforma criada para tornar a preparação
                            para os vestibulares mais organizada, clara e
                            acompanhável.
                        </p>

                    </div>

                    <div className={styles.aboutGrid}>

                        <div className={styles.aboutImage}>

                            <div className={styles.imageDecoration}></div>

                            <img
                                src="/assets/capybara-about.jpg"
                                alt="Capivara do CapVest"
                                onError={(event) => {
                                    event.target.src =
                                        "https://images.unsplash.com/photo-1603483080228-04f2313d9f10?auto=format&fit=crop&w=900&q=80";
                                }}
                            />

                            <div className={styles.capybaraBadge}>
                                🐹
                                <span>
                                    Estude no seu ritmo
                                </span>
                            </div>

                        </div>


                        <div className={styles.aboutText}>

                            <span className={styles.smallTitle}>
                                NOSSA IDEIA
                            </span>

                            <h3>
                                Menos confusão.
                                <br />
                                Mais evolução.
                            </h3>

                            <p>
                                O CapVest foi pensado como uma plataforma
                                de apoio aos estudantes que estão se
                                preparando para vestibulares e provas.
                            </p>

                            <p>
                                A proposta é centralizar ferramentas que
                                normalmente ficam espalhadas: questões,
                                simulados, redações, cronograma, metas e
                                acompanhamento de desempenho.
                            </p>

                            <div className={styles.aboutPoints}>

                                <div>
                                    <FaCheckCircle />
                                    <span>
                                        Centralização dos estudos
                                    </span>
                                </div>

                                <div>
                                    <FaCheckCircle />
                                    <span>
                                        Acompanhamento da evolução
                                    </span>
                                </div>

                                <div>
                                    <FaCheckCircle />
                                    <span>
                                        Organização da rotina
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                <section className={styles.validation}>

                    <div className={styles.validationContent}>

                        <div>

                            <span className={styles.smallTitle}>
                                POR QUE O PROJETO FAZ SENTIDO?
                            </span>

                            <h2>
                                Uma plataforma construída
                                em torno das necessidades
                                de quem estuda.
                            </h2>

                            <p>
                                A proposta do CapVest combina diferentes
                                ferramentas em um único ambiente, permitindo
                                que o estudante acompanhe não apenas seus
                                resultados, mas também seu processo.
                            </p>

                        </div>


                        <div className={styles.validationCards}>

                            <div className={styles.validationCard}>

                                <FaUsers />

                                <strong>
                                    Estudantes
                                </strong>

                                <span>
                                    Foco em uma experiência simples
                                    para quem está se preparando.
                                </span>

                            </div>

                            <div className={styles.validationCard}>

                                <FaBook />

                                <strong>
                                    Conteúdo
                                </strong>

                                <span>
                                    Questões e simulados organizados
                                    para facilitar a prática.
                                </span>

                            </div>

                            <div className={styles.validationCard}>

                                <FaChartLine />

                                <strong>
                                    Dados
                                </strong>

                                <span>
                                    Resultados transformados em
                                    informações sobre a evolução.
                                </span>

                            </div>

                            <div className={styles.validationCard}>

                                <FaBullseye />

                                <strong>
                                    Objetivos
                                </strong>

                                <span>
                                    Metas que ajudam o estudante a
                                    visualizar sua jornada.
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                <section
                    id="recursos"
                    className={styles.features}
                >

                    <div className={styles.sectionHeader}>

                        <span>
                            DENTRO DO CAPVEST
                        </span>

                        <h2>
                            Tudo em um só lugar.
                        </h2>

                        <p>
                            Ferramentas pensadas para acompanhar
                            diferentes etapas da sua preparação.
                        </p>

                    </div>


                    <div className={styles.featuresGrid}>

                        {features.map((feature) => (

                            <article
                                key={feature.title}
                                className={styles.featureCard}
                            >

                                <div className={styles.featureIcon}>
                                    {feature.icon}
                                </div>

                                <h3>
                                    {feature.title}
                                </h3>

                                <p>
                                    {feature.text}
                                </p>

                                <span className={styles.featureArrow}>
                                    <FaArrowRight />
                                </span>

                            </article>

                        ))}

                    </div>

                </section>


                <section
                    id="criadores"
                    className={styles.creators}
                >

                    <div className={styles.sectionHeader}>

                        <span>
                            QUEM ESTÁ POR TRÁS
                        </span>

                        <h2>
                            Quatro pessoas,
                            <br />
                            uma ideia e muitas capivaras.
                        </h2>

                        <p>
                            O CapVest nasceu de um projeto desenvolvido
                            por estudantes que decidiram transformar uma
                            ideia em uma experiência de estudos.
                        </p>

                    </div>


                    <div className={styles.creatorsGrid}>

                        {creators.map((creator) => (

                            <article
                                key={creator.name}
                                className={styles.creatorCard}
                            >

                                <div className={styles.creatorImageWrapper}>

                                    <img
                                        src={creator.image}
                                        alt={creator.name}
                                        className={styles.creatorImage}
                                        onError={(event) => {
                                            event.target.src =
                                                "https://i.pravatar.cc/500?img=12";
                                        }}
                                    />

                                    <div className={styles.creatorCapybara}>
                                        🐹
                                    </div>

                                </div>

                                <div className={styles.creatorInfo}>

                                    <span>
                                        {creator.role}
                                    </span>

                                    <h3>
                                        {creator.name}
                                    </h3>

                                </div>

                            </article>

                        ))}

                    </div>

                </section>


                <section className={styles.capybaraSection}>

                    <div className={styles.capybaraBackground}></div>

                    <div className={styles.capybaraContent}>

                        <span className={styles.smallTitle}>
                            E CLARO...
                        </span>

                        <h2>
                            Não seria CapVest
                            <br />
                            sem nossas capivaras.
                        </h2>

                        <p>
                            Porque estudar para o vestibular já é difícil
                            o suficiente. Pelo menos a companhia precisa
                            ser boa. 🐹
                        </p>

                        <Link
                            to="/login"
                            className={styles.capybaraButton}
                        >
                            Conhecer o CapVest
                            <FaArrowRight />
                        </Link>

                    </div>

                    <div className={styles.capybaraGallery}>

                        <img
                            src="/assets/capybara-1.jpg"
                            alt="Capivara"
                            onError={(event) => {
                                event.target.src =
                                    "https://images.unsplash.com/photo-1603483080228-04f2313d9f10?auto=format&fit=crop&w=600&q=80";
                            }}
                        />

                        <img
                            src="/assets/capybara-2.jpg"
                            alt="Capivara"
                            onError={(event) => {
                                event.target.src =
                                    "https://images.unsplash.com/photo-1603483080228-04f2313d9f10?auto=format&fit=crop&w=600&q=80";
                            }}
                        />

                        <img
                            src="/assets/capybara-3.jpg"
                            alt="Capivara"
                            onError={(event) => {
                                event.target.src =
                                    "https://images.unsplash.com/photo-1603483080228-04f2313d9f10?auto=format&fit=crop&w=600&q=80";
                            }}
                        />

                    </div>

                </section>


                <section className={styles.finalCta}>

                    <div>

                        <span>
                            SUA JORNADA COMEÇA AGORA
                        </span>

                        <h2>
                            Pronto para começar?
                        </h2>

                        <p>
                            Entre no CapVest e transforme sua preparação
                            em uma jornada acompanhada de perto.
                        </p>

                        <Link
                            to="/login"
                            className={styles.finalButton}
                        >
                            Começar minha jornada
                            <FaArrowRight />
                        </Link>

                    </div>

                    <div className={styles.finalCapybara}>
                        🐹
                    </div>

                </section>

            </main>


            <footer className={styles.footer}>

                <div className={styles.footerLogo}>

                    <img
                        src="/assets/logo.jpg"
                        alt="CapVest"
                        onError={(event) => {
                            event.target.style.display = "none";
                        }}
                    />

                    <strong>
                        CapVest
                    </strong>

                </div>

                <p>
                    Preparação, organização e evolução.
                </p>

                <span>
                    © 2026 CapVest. Projeto acadêmico.
                </span>

            </footer>

        </div>
    );
}