import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaBookOpen, FaClock, FaFileAlt, FaInfoCircle, FaSpinner, FaMagic } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import { createSimulation, getExamCatalog } from "../../services/api";
import styles from "./SimuladosPage.module.css";

const VESTIBULARES = [
  { id: "fuvest", label: "FUVEST", description: "Questões do acervo de provas FUVEST" },
  { id: "enem", label: "ENEM", description: "Disponível quando houver questões ENEM indexadas" },
  { id: "unicamp", label: "UNICAMP", description: "Disponível quando houver questões UNICAMP indexadas" }
];

export default function SimuladosPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [vestibular, setVestibular] = useState("fuvest");
  const [questionCount, setQuestionCount] = useState("20");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("todos");
  const [durationMinutes, setDurationMinutes] = useState("120");

  useEffect(() => {
    getExamCatalog().then(setCatalog).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const inventory = useMemo(() => catalog?.vestibulares?.find((item) => item.id === vestibular), [catalog, vestibular]);
  const years = useMemo(() => [...new Set((catalog?.questionsByYear || []).filter((item) => item.vestibularId === vestibular).map((item) => item.year))].sort((a,b) => b-a), [catalog, vestibular]);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setCreating(true);
    try {
      const result = await createSimulation({ vestibular, questionCount: Number(questionCount), type, year: year === "todos" ? null : Number(year), durationMinutes: Number(durationMinutes) });
      navigate(`/simulados/${result.id}`);
    } catch (err) { setError(err.message); }
    finally { setCreating(false); }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>TREINE COM QUESTÕES REAIS</span>
            <h1>Monte seu simulado</h1>
            <p>Escolha o vestibular, personalize a sessão e pratique com uma seleção aleatória do banco de questões do CapVest.</p>
            <div className={styles.heroMeta}><span><FaBookOpen /> Acervo existente</span><span><FaMagic /> Seleção aleatória</span><span><FaClock /> Tempo configurável</span></div>
          </div>
          <div className={styles.heroArt}><img src="/assets/capybara-hero-png.webp" alt="Capivara mascote do CapVest" /></div>
        </header>

        {error && <div className={styles.error} role="alert">{error}</div>}
        <div className={styles.contentGrid}>
          <form className={styles.panel} onSubmit={handleCreate}>
            <div className={styles.panelHeading}><div><span>CONFIGURAÇÃO</span><h2>Personalize sua prova</h2></div><div className={styles.headingIcon}><FaFileAlt /></div></div>
            <label className={styles.fieldLabel}>Vestibular</label>
            <div className={styles.vestibularGrid}>
              {VESTIBULARES.map((item) => {
                const total = catalog?.vestibulares?.find((entry) => entry.id === item.id)?.total || 0;
                return <button type="button" key={item.id} disabled={loading || total === 0} onClick={() => { setVestibular(item.id); setYear("todos"); }} className={`${styles.vestibularOption} ${vestibular === item.id ? styles.selected : ""}`}>
                  <strong>{item.label}</strong><span>{total.toLocaleString("pt-BR")} questões no banco</span>{total === 0 && <small>Sem questões indexadas</small>}
                </button>;
              })}
            </div>
            <div className={styles.formGrid}>
              <label>Quantidade de questões<select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}>{[10,20,30,45,60,90].map((n) => <option value={n} key={n}>{n} questões</option>)}</select></label>
              <label>Tipo de questão<select value={type} onChange={(e) => setType(e.target.value)}><option value="all">Todas (objetivas e dissertativas)</option><option value="multiple-choice">Somente objetivas</option><option value="open">Somente dissertativas</option></select></label>
              <label>Ano da prova<select value={year} onChange={(e) => setYear(e.target.value)}><option value="todos">Todos os anos</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Tempo disponível<select value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}><option value="0">Sem cronômetro</option><option value="60">1 hora</option><option value="90">1h30</option><option value="120">2 horas</option><option value="180">3 horas</option><option value="240">4 horas</option></select></label>
            </div>
            <div className={styles.inventoryNote}><FaInfoCircle /><span>{loading ? "Consultando o banco de questões..." : inventory ? `${inventory.total.toLocaleString("pt-BR")} questões numeradas no acervo. No índice atual, ${catalog?.questionTypes?.multipleChoiceWithKey || 0} objetivas têm gabarito identificado e ${catalog?.questionTypes?.open || 0} são dissertativas. A seleção será aleatória e exclusiva desse vestibular.` : "Nenhuma questão encontrada para este vestibular no acervo atual."}</span></div>
            <button className={styles.primaryButton} type="submit" disabled={creating || loading || !inventory?.total}>{creating ? <><FaSpinner className={styles.spin}/> Montando simulado...</> : <>Gerar simulado <FaArrowRight /></>}</button>
          </form>
          <aside className={styles.sideColumn}>
            <section className={styles.panel}>
              <span className={styles.eyebrow}>COMO FUNCIONA</span><h2>Uma prova diferente a cada treino</h2>
              <ul className={styles.steps}><li><b>01</b><span>O CapVest consulta somente questões cadastradas e indexadas.</span></li><li><b>02</b><span>As questões são sorteadas dentro do vestibular e filtros escolhidos.</span></li><li><b>03</b><span>Suas respostas são salvas automaticamente durante a sessão.</span></li><li><b>04</b><span>Questões com gabarito são corrigidas; respostas abertas ficam registradas para revisão.</span></li></ul>
            </section>
            <section className={`${styles.panel} ${styles.warningPanel}`}><h3>Importante sobre o acervo</h3><p>O índice recebido contém questões FUVEST. ENEM e UNICAMP só serão liberados para simulados quando seus respectivos bancos forem importados. O sistema não cria questões nem mistura vestibulares.</p></section>
          </aside>
        </div>
      </main>
    </div>
  );
}
