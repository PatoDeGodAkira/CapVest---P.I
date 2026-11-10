import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaBookOpen, FaSpinner, FaExternalLinkAlt, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import { searchQuestions, checkAnswer } from "../../services/capyApi";
import { saveOpenAnswer, reviewOpenAnswer } from "../../services/api";
import styles from "./QuestionsPage.module.css";

function parseChoices(text) {
  const matches = [...String(text || "").matchAll(/(?:^|\n)\s*\(?([A-E])\)?\s*[).:\-]\s*([\s\S]*?)(?=(?:\n\s*\(?[A-E]\)?\s*[).:\-]\s*)|$)/gm)];
  const unique = new Map();
  matches.forEach((match) => {
    const letter = match[1].toUpperCase();
    const value = match[2].replace(/\s+/g, " ").trim();
    if (value && !unique.has(letter)) unique.set(letter, { letter, text: value });
  });
  const choices = [...unique.values()].sort((a, b) => a.letter.localeCompare(b.letter));
  return choices.length >= 4 && ["A", "B", "C", "D"].every((letter) => unique.has(letter)) ? choices : [];
}

export default function QuestionsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [vestibular, setVestibular] = useState(params.get("vestibular") || "todos");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [checking, setChecking] = useState({});
  const [feedback, setFeedback] = useState({});
  const [openAnswers, setOpenAnswers] = useState({});
  const [openSaving, setOpenSaving] = useState({});
  const [openSaved, setOpenSaved] = useState({});
  const [openReviewing, setOpenReviewing] = useState({});
  const [openReviews, setOpenReviews] = useState({});

  async function runSearch(query = search, vest = vestibular) {
    if (query.trim().length < 2) { setResults([]); setError("Digite pelo menos 2 caracteres para pesquisar."); return; }
    setLoading(true); setError(""); setFeedback({});
    const next = new URLSearchParams({ search: query.trim() });
    if (vest !== "todos") next.set("vestibular", vest);
    setParams(next);
    try {
      const data = await searchQuestions({ q: query.trim(), vestibular: vest, limit: 20 });
      setResults(data.results || []);
      if (!data.results?.length) setError("Nenhuma questão encontrada nas provas indexadas. Tente outro tema ou vestibular.");
    } catch (err) { setError(err.status === 401 ? "Entre na sua conta para acessar o banco de questões." : err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const query = params.get("search");
    const vest = params.get("vestibular") || "todos";
    if (!query) return;
    searchQuestions({ q: query, vestibular: vest, limit: 20 })
      .then((data) => {
        setResults(data.results || []);
        if (!data.results?.length) setError("Nenhuma questão encontrada nas provas indexadas.");
      })
      .catch((err) => setError(err.status === 401 ? "Entre na sua conta para acessar o banco de questões." : err.message));
  // A busca inicial deve ocorrer apenas ao montar a página.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveOpen(question) {
    const text = openAnswers[question.id] || "";
    if (text.trim().length < 10 || openSaving[question.id]) return;
    setOpenSaving((current) => ({ ...current, [question.id]: true }));
    try {
      await saveOpenAnswer({ id: question.id, text });
      setOpenSaved((current) => ({ ...current, [question.id]: true }));
    } catch (err) { setError(err.message); }
    finally { setOpenSaving((current) => ({ ...current, [question.id]: false })); }
  }

  async function handleReviewOpen(question) {
    setOpenReviewing((current) => ({ ...current, [question.id]: true }));
    try {
      const data = await reviewOpenAnswer({ id: question.id });
      setOpenReviews((current) => ({ ...current, [question.id]: data.review }));
    } catch (err) { setError(err.message); }
    finally { setOpenReviewing((current) => ({ ...current, [question.id]: false })); }
  }

  async function handleCheck(question) {
    const choice = answers[question.id];
    if (!choice || checking[question.id]) return;
    setChecking((current) => ({ ...current, [question.id]: true }));
    try {
      const result = await checkAnswer({ id: question.id, choice });
      setFeedback((current) => ({ ...current, [question.id]: result }));
    } catch (err) { setError(err.message); }
    finally { setChecking((current) => ({ ...current, [question.id]: false })); }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div><span className={styles.eyebrow}>BANCO DE QUESTÕES</span><h1>Questões de provas reais</h1><p>Pesquise por assunto e pratique com questões extraídas dos documentos cadastrados na biblioteca.</p></div>
          <div className={styles.headerIcon}><FaBookOpen /></div>
        </header>
        <section className={styles.searchSection}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runSearch()} placeholder="Ex.: função do segundo grau, ecologia, Revolução Francesa..." />
            <button onClick={() => runSearch()} disabled={loading || search.trim().length < 2}>{loading ? <FaSpinner className={styles.spin} /> : "Pesquisar"}</button>
          </div>
          <div className={styles.quickFilters}>
            {[{ value: "todos", label: "Todos" }, { value: "enem", label: "ENEM" }, { value: "unicamp", label: "UNICAMP" }, { value: "fuvest", label: "FUVEST" }].map((item) => <button key={item.value} className={vestibular === item.value ? styles.activeFilter : ""} onClick={() => { setVestibular(item.value); if (search.trim().length >= 2) runSearch(search, item.value); }}>{item.label}</button>)}
          </div>
        </section>
        {loading && <div className={styles.emptyState}><FaSpinner className={styles.spin} /> Procurando nas provas...</div>}
        {error && !loading && <div className={styles.emptyState}>{error}</div>}
        <section className={styles.resultsList}>
          {results.map((question) => {
            const choices = parseChoices(question.text);
            const firstChoice = question.text.search(/(?:^|\n)\s*\(?A\)?\s*[).:\-]\s*/m);
            const statement = choices.length >= 4 && firstChoice > 0 ? question.text.slice(0, firstChoice).trim() : question.text;
            const feedbackItem = feedback[question.id];
            return (
              <article className={styles.questionCard} key={question.id}>
                <div className={styles.questionMeta}><span>{question.vestibular} · {question.year}</span><span>{question.number == null ? "Trecho da prova" : `Questão ${question.number}`}</span><span>Página {question.page}</span></div>
                {question.context && <div className={styles.questionContext}>{question.context}</div>}<p className={styles.questionText}>{statement}</p>
                {choices.length >= 4 ? <div className={styles.alternatives}>{choices.map((choice) => <label key={choice.letter} className={`${styles.alternative} ${answers[question.id] === choice.letter ? styles.selectedAlternative : ""} ${feedbackItem && feedbackItem.answer?.includes(choice.letter) ? styles.correctAlternative : ""}`}><input type="radio" name={`question-${question.id}`} value={choice.letter} checked={answers[question.id] === choice.letter} disabled={Boolean(feedbackItem)} onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice.letter }))} /><strong>{choice.letter})</strong><span>{choice.text}</span></label>)}</div> : <div className={styles.openAnswerBox}><label htmlFor={`open-${question.id}`}>Sua resposta dissertativa</label><textarea id={`open-${question.id}`} rows="6" value={openAnswers[question.id] || ""} onChange={(event) => { setOpenAnswers((current) => ({ ...current, [question.id]: event.target.value })); setOpenSaved((current) => ({ ...current, [question.id]: false })); }} placeholder="Escreva sua resolução ou resposta..."/><div><small>Salve sua resposta e solicite feedback formativo por IA se o provedor estiver configurado. Não é uma nota oficial.</small><div className={styles.openActions}><button onClick={() => handleSaveOpen(question)} disabled={(openAnswers[question.id] || "").trim().length < 10 || openSaving[question.id]}>{openSaving[question.id] ? "Salvando..." : openSaved[question.id] ? "Resposta salva" : "Salvar resposta"}</button><button className={styles.reviewButton} onClick={() => handleReviewOpen(question)} disabled={!openSaved[question.id] || openReviewing[question.id]}>{openReviewing[question.id] ? "Analisando..." : "Revisar com IA"}</button></div></div></div>}
                <div className={styles.questionFooter}>
                  <span>{choices.length >= 4 ? question.hasAnswer ? "Gabarito disponível" : "Sem gabarito cadastrado" : "Questão dissertativa"}</span>
                  {choices.length >= 4 && <button onClick={() => handleCheck(question)} disabled={!answers[question.id] || checking[question.id] || Boolean(feedbackItem)}>{checking[question.id] ? "Salvando..." : feedbackItem ? "Respondida" : question.hasAnswer ? "Conferir resposta" : "Salvar resposta"}</button>}
                  {question.file && <a href={`${question.file}#page=${question.page}`} target="_blank" rel="noreferrer">Abrir prova <FaExternalLinkAlt /></a>}
                </div>
                {feedbackItem && <div className={styles.answerFeedback}>{feedbackItem.needsAnswerKey ? <FaInfoCircle /> : <FaCheckCircle />} {feedbackItem.needsAnswerKey ? "Resposta registrada. O gabarito ainda não está disponível para correção." : feedbackItem.annulled ? "Questão anulada." : feedbackItem.correct ? `Resposta correta! +${feedbackItem.xpEarned} XP` : `Não foi dessa vez. Gabarito: ${feedbackItem.answer?.join(" / ")}. +${feedbackItem.xpEarned} XP`}</div>}
                {openReviews[question.id] && <div className={styles.openReview}><strong>Devolutiva formativa da Capy IA</strong><p>{openReviews[question.id].summary}</p>{openReviews[question.id].strengths?.length>0 && <><b>Pontos positivos</b><ul>{openReviews[question.id].strengths.map((item,index)=><li key={index}>{item}</li>)}</ul></>}{openReviews[question.id].improvements?.length>0 && <><b>O que melhorar</b><ul>{openReviews[question.id].improvements.map((item,index)=><li key={index}>{item}</li>)}</ul></>}{openReviews[question.id].nextStep && <p><b>Próximo passo:</b> {openReviews[question.id].nextStep}</p>}<small>{openReviews[question.id].disclaimer}</small></div>}
                {question.reason && <small className={styles.aiReason}>Capy: {question.reason}</small>}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
