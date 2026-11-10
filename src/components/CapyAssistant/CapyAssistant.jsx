import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaArrowRight, FaFilter, FaBookOpen, FaSpinner } from "react-icons/fa";
import { searchQuestions } from "../../services/capyApi";
import styles from "./CapyAssistant.module.css";

export default function CapyAssistant() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [vestibular, setVestibular] = useState("todos");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiUsed, setAiUsed] = useState(false);

  async function handleSearch() {
    if (search.trim().length < 2 || loading) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const data = await searchQuestions({ q: search.trim(), vestibular, limit: 4 });
      setResults(data.results || []);
      setAiUsed(Boolean(data.aiUsed));
      if (!data.ready) setError("A biblioteca ainda não possui questões indexadas.");
      else if (!data.results?.length) setError("Não encontrei questões desse tema nas provas cadastradas. Tente outros termos.");
    } catch (err) {
      setError(err.status === 401 ? "Entre na sua conta para pesquisar questões." : err.message);
    } finally { setLoading(false); }
  }

  function goToQuestions() {
    const params = new URLSearchParams({ search: search.trim() });
    if (vestibular !== "todos") params.set("vestibular", vestibular);
    navigate(`/questoes?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className={styles.assistant}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.capyIcon}>🦫</div>
            <div><h3>Capy</h3><span>Assistente de questões</span></div>
            <button className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Fechar"><FaTimes /></button>
          </div>
          <div className={styles.message}><div className={styles.messageCapy}>🦫</div><p>Oi! Me diga um assunto e vou procurar questões nas provas que já estão na biblioteca.</p></div>
          <div className={styles.searchArea}>
            <label htmlFor="capy-search">O que você quer estudar?</label>
            <div className={styles.searchBox}>
              <FaSearch />
              <input id="capy-search" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSearch()} placeholder="Ex.: Revolução Francesa" />
              {search && <button className={styles.clearButton} onClick={() => { setSearch(""); setResults([]); setError(""); }} aria-label="Limpar"><FaTimes /></button>}
            </div>
          </div>
          <div className={styles.filters}>
            <div className={styles.filterTitle}><FaFilter /><span>Vestibular</span></div>
            <div className={styles.filterButtons}>
              {[{ value: "todos", label: "Todos" }, { value: "enem", label: "ENEM" }, { value: "unicamp", label: "UNICAMP" }, { value: "fuvest", label: "FUVEST" }].map((item) => (
                <button key={item.value} className={vestibular === item.value ? styles.activeFilter : ""} onClick={() => setVestibular(item.value)}>{item.label}</button>
              ))}
            </div>
          </div>
          <button className={styles.searchButton} onClick={handleSearch} disabled={search.trim().length < 2 || loading}>
            {loading ? <FaSpinner className={styles.spin} /> : <FaSearch />} {loading ? "Pesquisando nas provas..." : "Pesquisar questões"}
          </button>
          {error && <p className={styles.resultDescription} role="status">{error}</p>}
          {results.length > 0 && (
            <div className={styles.results}>
              <div className={styles.resultHeader}><div><span>{results.length} resultado(s) encontrado(s)</span><strong>{search}</strong></div><FaBookOpen /></div>
              {aiUsed && <small>Busca aprimorada por IA</small>}
              {results.map((item) => (
                <button className={styles.capyResult} key={item.id} onClick={() => { navigate(`/questoes?search=${encodeURIComponent(search)}&vestibular=${vestibular}&question=${encodeURIComponent(item.id)}`); setOpen(false); }}>
                  <strong>{item.vestibular} {item.year} · {item.number == null ? `Página ${item.page}` : `Questão ${item.number}`}</strong>
                  <span>{item.snippet || item.text?.slice(0, 150)}</span>
                  {item.reason && <small>{item.reason}</small>}
                </button>
              ))}
              <button className={styles.questionsButton} onClick={goToQuestions}>Ver todos os resultados <FaArrowRight /></button>
            </div>
          )}
          {!results.length && !error && <div className={styles.tip}><span>💡</span><p>A pesquisa consulta questões extraídas das provas cadastradas. Quando a chave de IA estiver configurada, o Capy também expande os temas e seleciona resultados relevantes.</p></div>}
        </div>
      )}
      <button className={`${styles.capyButton} ${open ? styles.capyOpen : ""}`} onClick={() => setOpen(!open)} aria-label="Abrir assistente Capy">
        <div className={styles.capyFace}><div className={styles.earLeft}></div><div className={styles.earRight}></div><div className={styles.eyes}><span></span><span></span></div><div className={styles.nose}></div><div className={styles.muzzle}></div></div>
      </button>
    </div>
  );
}
