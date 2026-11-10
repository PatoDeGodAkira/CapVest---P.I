import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaClock, FaSpinner, FaTrophy } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getExam, submitExam, reviewOpenAnswer } from "../../services/api";
import styles from "./ExamPage.module.css";

export default function ExamPage() {
  const { docId } = useParams();
  const storageKey = `capvest:exam:${(() => { try { return JSON.parse(localStorage.getItem("user") || "null")?.id || "guest"; } catch { return "guest"; } })()}:${docId}`;
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "null")?.answers || {}; }
    catch { return {}; }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey) || "null"); return Number.isInteger(saved?.current) && saved.current >= 0 ? saved.current : 0; }
    catch { return 0; }
  });
  const [openReviews, setOpenReviews] = useState({});
  const [reviewingOpen, setReviewingOpen] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return Math.max(0, Math.floor((Date.now() - (saved?.startedAt || Date.now())) / 1000));
    } catch { return 0; }
  });

  useEffect(() => {
    let active = true;
    getExam(docId).then((data) => { if (active) { setExam(data.exam); setQuestions(data.questions || []); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [docId]);

  useEffect(() => {
    if (result) return undefined;
    const interval = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [result]);

  useEffect(() => {
    if (result || loading) return;
    try {
      const previous = JSON.parse(localStorage.getItem(storageKey) || "null");
      localStorage.setItem(storageKey, JSON.stringify({
        answers,
        current,
        startedAt: previous?.startedAt || Date.now() - elapsedSeconds * 1000,
        updatedAt: Date.now()
      }));
    } catch { /* armazenamento local indisponível: a prova continua funcionando */ }
  }, [answers, current, elapsedSeconds, loading, result, storageKey]);

  const answered = useMemo(() => Object.keys(answers).filter((id) => answers[id].choice || answers[id].text?.trim()).length, [answers]);
  const question = questions[current];

  async function finish() {
    if (submitting || result) return;
    setSubmitting(true); setError("");
    try {
      const submitted = await submitExam(docId, Object.entries(answers).map(([id, value]) => ({ id, ...value })));
      localStorage.removeItem(storageKey);
      setResult(submitted);
    }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  async function requestOpenReview(questionId) {
    setReviewingOpen((old) => ({ ...old, [questionId]: true }));
    try {
      const data = await reviewOpenAnswer({ id: questionId });
      setOpenReviews((old) => ({ ...old, [questionId]: data.review }));
    } catch (err) { setError(err.message); }
    finally { setReviewingOpen((old) => ({ ...old, [questionId]: false })); }
  }

  if (loading) return <div className={styles.loading}><FaSpinner className={styles.spin} /> Carregando prova...</div>;
  if (error && !exam) return <div className={styles.loading}>{error}<Link to="/materiais">Voltar à biblioteca</Link></div>;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Link to="/materiais" className={styles.back}><FaArrowLeft /> Biblioteca de materiais</Link>
        <header className={styles.header}><div><span>{exam?.vestibularId?.toUpperCase()} · {exam?.year}</span><h1>{exam?.title}</h1><p>Resolva a prova no CapVest. Suas respostas ficam salvas automaticamente neste navegador.</p></div><div className={styles.counter}><FaClock /><strong>{String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0")}:{String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0")}:{String(elapsedSeconds % 60).padStart(2, "0")}</strong><small>tempo de prova · {answered}/{exam?.questionCount || questions.length} respondidas</small></div></header>
        {error && <div className={styles.error}>{error}</div>}
        {result ? (
          <section className={styles.resultCard}>
            <div className={styles.trophy}><FaTrophy /></div><h2>Prova finalizada!</h2>
            <p>Seu resultado foi calculado com base nas questões que possuem gabarito disponível.</p>
            <div className={styles.resultGrid}><div><strong>{result.correct ?? "—"}</strong><span>Acertos</span></div><div><strong>{result.wrong ?? "—"}</strong><span>Erros</span></div><div><strong>{result.blank ?? "—"}</strong><span>Em branco</span></div><div><strong>{result.accuracy == null ? "—" : `${result.accuracy}%`}</strong><span>Precisão</span></div></div>
            {result.openPending > 0 && <strong className={styles.xp}>{result.openPending} resposta(s) dissertativa(s) salva(s). Você pode solicitar uma devolutiva formativa.</strong>}
            {(result.results || []).filter((item) => item.status === "pending-review").map((item) => <div className={styles.openReviewResult} key={item.id}><button onClick={() => requestOpenReview(item.id)} disabled={reviewingOpen[item.id]}>{reviewingOpen[item.id] ? "Analisando..." : "Revisar resposta dissertativa com IA"}</button>{openReviews[item.id] && <div><strong>{openReviews[item.id].summary}</strong><ul>{openReviews[item.id].improvements?.map((tip,index)=><li key={index}>{tip}</li>)}</ul><small>{openReviews[item.id].disclaimer}</small></div>}</div>)}
            {result.needsAnswerKey ? <strong className={styles.xp}>As respostas foram armazenadas, mas esta prova ainda não possui questões indexadas para correção automática.</strong> : result.ungraded > 0 && <strong className={styles.xp}>{result.ungraded} questão(ões) sem gabarito ou anuladas não entraram na precisão.</strong>}
            <strong className={styles.xp}>+{result.xpEarned || 0} XP conquistados</strong>
            <button onClick={() => { localStorage.removeItem(storageKey); window.location.reload(); }}>Refazer prova</button>
          </section>
        ) : question ? (
          <>
            <div className={styles.progressTrack}><div style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
            <section className={styles.questionCard}>
              <div className={styles.questionTop}><span>Questão {current + 1} de {questions.length}</span><span>Página {question.page}</span></div>
              {question.context && <div className={styles.context}>{question.context}</div>}
              <p className={styles.statement}>{question.statement}</p>
              {question.type === "multiple-choice" ? (
                <div className={styles.options}>{question.choices.map((choice) => <label key={choice.letter} className={`${styles.option} ${answers[question.id]?.choice === choice.letter ? styles.optionSelected : ""}`}><input type="radio" name={`exam-${question.id}`} checked={answers[question.id]?.choice === choice.letter} onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: { choice: choice.letter } }))} /><b>{choice.letter})</b><span>{choice.text}</span></label>)}</div>
              ) : <textarea className={styles.openAnswer} value={answers[question.id]?.text || ""} onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: { text: event.target.value } }))} placeholder="Digite sua resposta..." rows={7} />}
              <div className={styles.questionActions}><button disabled={current === 0} onClick={() => setCurrent((n) => n - 1)}>Anterior</button><button onClick={() => setCurrent((n) => Math.min(questions.length - 1, n + 1))} disabled={current === questions.length - 1}>Próxima</button></div>
            </section>
            <div className={styles.finishRow}><span>{answered} questão(ões) preenchida(s). Você pode finalizar mesmo deixando questões em branco.</span><button onClick={finish} disabled={submitting}>{submitting ? <><FaSpinner className={styles.spin} /> Corrigindo...</> : <><FaCheckCircle /> Finalizar prova</>}</button></div>
          </>
        ) : exam?.file ? (
          <section className={styles.pdfExam}>
            <div className={styles.pdfNotice}>Esta prova ainda não possui questões extraídas individualmente. Você pode ler o PDF aqui e preencher o cartão-resposta. A correção automática será liberada quando o gabarito for adicionado à biblioteca.</div>
            <iframe title={exam.title} src={`${exam.file}#toolbar=1&navpanes=0`} className={styles.pdfFrame} />
            <div className={styles.answerSheet}><div><h2>Cartão-resposta</h2><p>Marque uma alternativa para cada questão que responder.</p></div><div className={styles.answerGrid}>{Array.from({ length: exam.answerSheetCount || 0 }, (_, index) => index + 1).map((number) => <div className={styles.answerRow} key={number}><strong>{number}</strong>{["A", "B", "C", "D", "E"].map((choice) => <label key={choice} className={answers[`pdfq:${number}`]?.choice === choice ? styles.answerSelected : ""}><input type="radio" name={`pdfq-${number}`} checked={answers[`pdfq:${number}`]?.choice === choice} onChange={() => setAnswers((prev) => ({ ...prev, [`pdfq:${number}`]: { choice } }))} />{choice}</label>)}</div>)}</div><div className={styles.finishRow}><span>{answered} respostas marcadas. O resultado será salvo, mas não corrigido até o gabarito estar disponível.</span><button onClick={finish} disabled={submitting}>{submitting ? "Salvando..." : "Finalizar prova"}</button></div></div>
          </section>
        ) : <div className={styles.error}>Esta prova ainda não possui questões processadas para resolução online.</div>}
      </main>
    </div>
  );
}
