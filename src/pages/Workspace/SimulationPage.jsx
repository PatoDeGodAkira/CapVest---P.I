import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaClock, FaExclamationCircle, FaSpinner, FaSave } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getSimulation, saveSimulationAnswers, submitSimulation, reviewOpenAnswer } from "../../services/api";
import styles from "./SimulationPage.module.css";

const formatTime = (seconds) => `${String(Math.floor(seconds / 3600)).padStart(2,"0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;

export default function SimulationPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [reviews, setReviews] = useState({});
  const [reviewing, setReviewing] = useState({});
  const saveTimer = useRef(null);
  const question = questions[current];
  const timerActive = secondsLeft !== null;

  const finish = useCallback(async () => {
    if (submitting || result) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSubmitting(true); setError("");
    try {
      await saveSimulationAnswers(id, answers);
      const data = await submitSimulation(id, answers);
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }, [answers, id, result, submitting]);

  useEffect(() => {
    let active = true;
    getSimulation(id).then((data) => {
      if (!active) return;
      setSession(data);
      setQuestions(data.questions || []);
      setAnswers(data.answers || {});
      setResult(data.result || null);
      const duration = Number(data.settings?.durationMinutes || 0);
      if (duration > 0 && !data.submittedAt) {
        const elapsed = Math.floor((Date.now() - new Date(data.startedAt || Date.now()).getTime()) / 1000);
        setSecondsLeft(Math.max(0, duration * 60 - elapsed));
      }
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [id]);

  useEffect(() => {
    if (!session || result) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(() => {
      saveSimulationAnswers(id, answers).catch((err) => setError(`Não foi possível salvar o rascunho: ${err.message}`)).finally(() => setSaving(false));
    }, 550);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [answers, id, session, result]);

  useEffect(() => {
    if (!timerActive || result || submitting) return undefined;
    const timer = setInterval(() => setSecondsLeft((value) => value === null ? null : Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [timerActive, result, submitting]);

  useEffect(() => {
    if (secondsLeft === 0 && !result && !submitting) finish();
  }, [secondsLeft, result, submitting, finish]);

  const answeredCount = useMemo(() => questions.filter((item) => item.type === "open" ? Boolean(answers[item.id]?.text?.trim()) : Boolean(answers[item.id]?.choice)).length, [questions, answers]);

  function updateAnswer(questionId, value) {
    setAnswers((old) => ({ ...old, [questionId]: value }));
  }

  async function requestReview(questionId) {
    setReviewing((old) => ({ ...old, [questionId]: true }));
    try {
      const data = await reviewOpenAnswer({ id: questionId, simulationId: id });
      setReviews((old) => ({ ...old, [questionId]: data.review }));
    } catch (err) { setError(err.message); }
    finally { setReviewing((old) => ({ ...old, [questionId]: false })); }
  }



  if (loading) return <div className={styles.loading}><FaSpinner className={styles.spin}/> Carregando simulado...</div>;
  if (error && !session) return <div className={styles.loading}>{error}<Link to="/simulados">Voltar</Link></div>;

  if (result) {
    const resultMap = new Map((result.results || []).map((item) => [item.id, item]));
    return <div className={styles.layout}><Sidebar/><main className={styles.main}>
      <Link to="/simulados" className={styles.back}><FaArrowLeft/> Simulados</Link>
      <section className={styles.resultHero}><div className={styles.resultIcon}><FaCheckCircle/></div><span>SIMULADO FINALIZADO</span><h1>Seu resultado</h1><p>Você respondeu {result.answered} de {result.total} questões.</p>
        <div className={styles.resultStats}><div><strong>{result.correct}</strong><small>Acertos</small></div><div><strong>{result.wrong}</strong><small>Erros</small></div><div><strong>{result.openPending}</strong><small>Dissertativas aguardando revisão</small></div><div><strong>{result.accuracy === null ? "—" : `${result.accuracy}%`}</strong><small>Precisão objetiva</small></div></div>
      </section>
      {result.openPending > 0 && <div className={styles.reviewNotice}><FaExclamationCircle/> Suas respostas dissertativas foram salvas. O banco atual não contém espelhos de correção completos para atribuir notas automáticas confiáveis; elas aparecem como pendentes, sem nota inventada.</div>}
      <section className={styles.panel}><h2>Correção por questão</h2>{questions.map((item,index)=>{const status=resultMap.get(item.id)?.status||"blank";const labels={correct:"Acertou",wrong:"Errou",blank:"Em branco",ungraded:"Sem gabarito",annulled:"Anulada","pending-review":"Resposta salva · revisão pendente"};return <article className={styles.resultRow} key={item.id}><span className={styles.resultNumber}>{String(index+1).padStart(2,"0")}</span><div><strong>Questão {item.number ?? index+1} · {item.type === "open" ? "Dissertativa" : "Objetiva"}</strong><small>{labels[status]}</small>{resultMap.get(item.id)?.explanation && <p>{resultMap.get(item.id).explanation}</p>}{status === "pending-review" && <><button className={styles.reviewAction} onClick={()=>requestReview(item.id)} disabled={reviewing[item.id]}>{reviewing[item.id]?"Analisando resposta...":"Solicitar devolutiva da IA"}</button>{reviews[item.id] && <div className={styles.reviewBox}><strong>Feedback formativo</strong><p>{reviews[item.id].summary}</p>{reviews[item.id].improvements?.length>0 && <ul>{reviews[item.id].improvements.map((text,i)=><li key={i}>{text}</li>)}</ul>}<small>{reviews[item.id].disclaimer}</small></div>}</>}</div><span className={`${styles.status} ${styles[status.replace("-","_")]}`}>{labels[status]}</span></article>;})}</section>
      <Link to="/simulados" className={styles.primaryButton}>Montar outro simulado</Link>
    </main></div>;
  }

  return <div className={styles.layout}><Sidebar/><main className={styles.main}>
    <Link to="/simulados" className={styles.back}><FaArrowLeft/> Sair do simulado</Link>
    <header className={styles.examHeader}><div><span>{session?.settings?.vestibularId?.toUpperCase()} · SIMULADO ALEATÓRIO</span><h1>{session?.settings?.questionCount} questões selecionadas do banco</h1><p>As questões pertencem exclusivamente ao vestibular escolhido. Suas respostas são salvas automaticamente.</p></div><div className={styles.timer}><FaClock/><strong>{secondsLeft === null ? "Livre" : formatTime(secondsLeft)}</strong><small>{saving ? "Salvando..." : "Rascunho salvo"}</small></div></header>
    {error && <div className={styles.error}>{error}</div>}
    <div className={styles.progressTrack}><span style={{width:`${questions.length ? answeredCount/questions.length*100 : 0}%`}}/></div>
    <div className={styles.workspace}>
      <aside className={styles.questionNav}><div className={styles.navHeading}><strong>Questões</strong><small>{answeredCount}/{questions.length} respondidas</small></div><div className={styles.navGrid}>{questions.map((item,index)=><button key={item.id} onClick={()=>setCurrent(index)} className={`${current===index?styles.navCurrent:""} ${(item.type==="open"?answers[item.id]?.text?.trim():answers[item.id]?.choice)?styles.navAnswered:""}`}>{index+1}</button>)}</div><div className={styles.legend}><span><i className={styles.dotAnswered}/> Respondida</span><span><i/> Não respondida</span></div><button className={styles.finishButton} onClick={finish} disabled={submitting}>{submitting?<><FaSpinner className={styles.spin}/> Finalizando</>:"Finalizar simulado"}</button></aside>
      <section className={styles.questionPanel}>
        {question ? <>
          <div className={styles.questionTop}><span>QUESTÃO {current+1} DE {questions.length}</span><span className={styles.typeTag}>{question.type === "open" ? "Dissertativa" : "Objetiva"}</span></div>
          {question.context && <div className={styles.context}>{question.context}</div>}
          <div className={styles.statement}>{question.statement}</div>
          <div className={styles.sourceLine}>{question.sourceTitle} · {question.year || "Ano não identificado"} · página {question.page || "—"}</div>
          {question.type === "multiple-choice" ? <div className={styles.options}>{question.choices.map((choice)=><label key={choice.letter} className={`${styles.option} ${answers[question.id]?.choice===choice.letter?styles.optionSelected:""}`}><input type="radio" name={`q-${question.id}`} value={choice.letter} checked={answers[question.id]?.choice===choice.letter} onChange={()=>updateAnswer(question.id,{choice:choice.letter})}/><b>{choice.letter}</b><span>{choice.text}</span></label>)}</div> : <div className={styles.openAnswer}><label htmlFor="open-answer">Sua resposta dissertativa</label><textarea id="open-answer" rows="9" value={answers[question.id]?.text || ""} onChange={(event)=>updateAnswer(question.id,{text:event.target.value})} placeholder="Desenvolva sua resposta com argumentos, cálculos ou justificativas..."/><small>{(answers[question.id]?.text || "").trim().length} caracteres · a resposta será salva para revisão</small></div>}
          <div className={styles.questionActions}><button className={styles.secondaryButton} onClick={()=>setCurrent((value)=>Math.max(0,value-1))} disabled={current===0}>Anterior</button><span>{saving?<><FaSave/> Salvando respostas</>:<><FaCheckCircle/> Salvamento automático</>}</span><button className={styles.nextButton} onClick={()=>setCurrent((value)=>Math.min(questions.length-1,value+1))} disabled={current===questions.length-1}>Próxima</button></div>
        </> : <p>Este simulado não possui questões carregadas.</p>}
      </section>
    </div>
  </main></div>;
}
