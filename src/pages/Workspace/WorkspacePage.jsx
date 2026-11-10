import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaPenNib, FaChartLine, FaUsers, FaShieldAlt, FaPlus, FaTrash, FaBookOpen } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getProgress } from "../../services/api";
import styles from "./WorkspacePage.module.css";

const STORAGE = { essays: "capvest:essays", tasks: "capvest:study-tasks", posts: "capvest:community" };
const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export default function WorkspacePage({ type }) {
  const config = {
    essays: { title: "Redações", eyebrow: "PRÁTICA E EVOLUÇÃO", desc: "Organize seus textos, acompanhe versões e desenvolva sua escrita.", icon: <FaPenNib /> },
    schedule: { title: "Cronograma de estudos", eyebrow: "PLANEJAMENTO", desc: "Monte sua rotina, conclua tarefas e acompanhe o que está pendente.", icon: <FaCalendarAlt /> },
    analytics: { title: "Meu desempenho", eyebrow: "SEU PROGRESSO", desc: "Acompanhe seus indicadores e transforme resultados em próximos passos.", icon: <FaChartLine /> },
    community: { title: "Comunidade", eyebrow: "ESTUDAR EM CONJUNTO", desc: "Compartilhe metas e aprendizados com outros estudantes neste dispositivo.", icon: <FaUsers /> },
    admin: { title: "Painel administrativo", eyebrow: "GESTÃO", desc: "Área restrita para acompanhamento local do conteúdo.", icon: <FaShieldAlt /> }
  }[type];
  const [essays, setEssays] = useState(read(STORAGE.essays));
  const [tasks, setTasks] = useState(read(STORAGE.tasks));
  const [posts, setPosts] = useState(read(STORAGE.posts));
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("Matemática");
  const [due, setDue] = useState("");
  const [taskText, setTaskText] = useState("");
  const [postText, setPostText] = useState("");
  const [editingEssay, setEditingEssay] = useState(null);
  const [progress, setProgress] = useState(null);
  const [message, setMessage] = useState("");
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }, []);

  useEffect(() => { save(STORAGE.essays, essays); }, [essays]);
  useEffect(() => { save(STORAGE.tasks, tasks); }, [tasks]);
  useEffect(() => { save(STORAGE.posts, posts); }, [posts]);
  useEffect(() => { if (type === "analytics" || type === "admin") getProgress().then(setProgress).catch(() => setProgress(null)); }, [type]);

  const addEssay = () => {
    if (!title.trim() || !content.trim()) return setMessage("Informe um título e escreva sua redação.");
    const timestamp = new Date().toISOString();
    if (editingEssay) {
      setEssays((old) => old.map((item) => item.id === editingEssay ? { ...item, title: title.trim(), theme: theme.trim(), content, updatedAt: timestamp, history: [...(item.history || []), { title: item.title, theme: item.theme, content: item.content, savedAt: item.updatedAt }] } : item));
      setMessage("Redação atualizada. A versão anterior foi preservada no histórico local.");
      setEditingEssay(null);
    } else {
      setEssays((old) => [{ id: crypto.randomUUID(), title: title.trim(), theme: theme.trim(), content, updatedAt: timestamp, history: [] }, ...old]);
      setMessage("Redação salva neste navegador.");
    }
    setTitle(""); setTheme(""); setContent("");
  };
  const addTask = () => {
    if (!taskText.trim() || !due) return setMessage("Informe a tarefa e a data.");
    setTasks((old) => [...old, { id: crypto.randomUUID(), text: taskText.trim(), subject, due, done: false }].sort((a,b) => a.due.localeCompare(b.due)));
    setTaskText(""); setMessage("Tarefa adicionada ao cronograma.");
  };
  const addPost = () => {
    if (!postText.trim()) return;
    setPosts((old) => [{ id: crypto.randomUUID(), text: postText.trim(), author: user.name || "Estudante", createdAt: new Date().toISOString() }, ...old]);
    setPostText("");
  };
  const remove = (setter, id) => setter((old) => old.filter((item) => item.id !== id));
  const doneCount = tasks.filter((item) => item.done).length;

  return <div className={styles.layout}><Sidebar /><main className={styles.main}>
    <header className={styles.header}><div><span>{config.eyebrow}</span><h1>{config.title}</h1><p>{config.desc}</p></div><div className={styles.headerIcon}>{config.icon}</div></header>
    {message && <div className={styles.notice} role="status">{message}<button onClick={() => setMessage("")}>×</button></div>}

    {type === "essays" && <>
      <section className={styles.panel}><h2>{editingEssay ? "Editar redação" : "Nova redação"}</h2><div className={styles.formGrid}><label>Título<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Redação modelo ENEM" /></label><label>Tema proposto<input value={theme} onChange={e=>setTheme(e.target.value)} placeholder="Ex.: Desafios da educação brasileira" /></label></div><label>Seu texto<textarea rows="12" value={content} onChange={e=>setContent(e.target.value)} placeholder="Escreva sua introdução, desenvolvimentos e conclusão..." /></label><div className={styles.actions}><span>{content.trim().split(/\s+/).filter(Boolean).length} palavras · salvamento ao adicionar</span><div className={styles.buttonGroup}>{editingEssay && <button className={styles.secondaryButton} onClick={()=>{setEditingEssay(null);setTitle("");setTheme("");setContent("");}}>Cancelar</button>}<button onClick={addEssay}><FaPlus/> {editingEssay ? "Atualizar redação" : "Salvar redação"}</button></div></div></section>
      <section className={styles.panel}><h2>Minhas redações <small>{essays.length}</small></h2>{essays.length ? essays.map(item=><article className={styles.listItem} key={item.id}><div><strong>{item.title}</strong><p>{item.theme || "Sem tema informado"} · {new Date(item.updatedAt).toLocaleDateString("pt-BR")}</p><details><summary>Visualizar texto</summary><p className={styles.essayText}>{item.content}</p>{item.history?.length>0 && <details><summary>Versões anteriores ({item.history.length})</summary>{item.history.slice().reverse().map((version,index)=><div key={`${item.id}-v${index}`}><small>{new Date(version.savedAt).toLocaleString("pt-BR")} · {version.title}</small><p className={styles.essayText}>{version.content}</p></div>)}</details>}</details></div><div className={styles.buttonGroup}><button className={styles.secondaryButton} onClick={()=>{setEditingEssay(item.id);setTitle(item.title);setTheme(item.theme||"");setContent(item.content);window.scrollTo({top:0,behavior:"smooth"});}}>Editar</button><button className={styles.iconButton} onClick={()=>remove(setEssays,item.id)} aria-label="Excluir redação"><FaTrash/></button></div></article>) : <p className={styles.empty}>Suas redações salvas aparecerão aqui.</p>}</section>
      <p className={styles.disclaimer}>A versão atual oferece editor e arquivo pessoal. Correção automática por competências e avaliação por IA ainda dependem de integração própria e não são simuladas como se fossem uma nota oficial.</p>
    </>}

    {type === "schedule" && <>
      <section className={styles.stats}><div><strong>{tasks.length}</strong><span>Tarefas planejadas</span></div><div><strong>{doneCount}</strong><span>Concluídas</span></div><div><strong>{tasks.length ? Math.round(doneCount/tasks.length*100) : 0}%</strong><span>Conclusão</span></div></section>
      <section className={styles.panel}><h2>Adicionar tarefa</h2><div className={styles.formGrid}><label>O que estudar?<input value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="Ex.: Revisar funções" /></label><label>Matéria<select value={subject} onChange={e=>setSubject(e.target.value)}>{["Matemática","Português","Física","Química","Biologia","História","Geografia","Filosofia","Sociologia","Inglês","Redação"].map(s=><option key={s}>{s}</option>)}</select></label><label>Data<input type="date" value={due} onChange={e=>setDue(e.target.value)} /></label></div><div className={styles.actions}><span>As tarefas ficam salvas neste navegador.</span><button onClick={addTask}><FaPlus/> Adicionar</button></div></section>
      <section className={styles.panel}><h2>Minha rotina</h2>{tasks.length ? tasks.map(task=><article className={`${styles.listItem} ${task.done?styles.completed:""}`} key={task.id}><label className={styles.taskCheck}><input type="checkbox" checked={task.done} onChange={()=>setTasks(old=>old.map(t=>t.id===task.id?{...t,done:!t.done}:t))}/><span><strong>{task.text}</strong><p>{task.subject} · {new Date(`${task.due}T12:00:00`).toLocaleDateString("pt-BR")}</p></span></label><button className={styles.iconButton} onClick={()=>remove(setTasks,task.id)} aria-label="Excluir tarefa"><FaTrash/></button></article>) : <p className={styles.empty}>Adicione sua primeira tarefa para montar seu cronograma.</p>}</section>
    </>}

    {type === "analytics" && <>
      <section className={styles.stats}><div><strong>{progress?.questionsAnswered ?? "—"}</strong><span>Questões respondidas</span></div><div><strong>{progress?.accuracy == null ? "—" : `${progress.accuracy}%`}</strong><span>Precisão</span></div><div><strong>{progress?.xp ?? "—"}</strong><span>XP acumulados</span></div></section>
      <section className={styles.panel}><h2>Como interpretar seus resultados</h2><p>Use a precisão como indicador de revisão, não como previsão garantida de aprovação. Priorize revisar os assuntos em que erra com frequência e faça provas completas para medir também resistência e gestão de tempo.</p><div className={styles.tipGrid}><div><strong>1. Identifique lacunas</strong><p>Registre os temas em que errou e retorne a eles após alguns dias.</p></div><div><strong>2. Treine com contexto</strong><p>Alterne questões isoladas e provas completas do vestibular desejado.</p></div><div><strong>3. Compare períodos</strong><p>Compare seus resultados semanalmente, usando quantidade de questões e precisão.</p></div></div>{!progress && <p className={styles.disclaimer}>Não foi possível consultar a API agora. Confira se o backend e o banco MySQL estão ativos.</p>}</section>
      <section className={styles.panel}><h2>Atalhos de estudo</h2><div className={styles.linkGrid}><Link to="/questoes"><FaBookOpen/> Praticar questões</Link><Link to="/materiais"><FaBookOpen/> Abrir biblioteca</Link><Link to="/ranking"><FaChartLine/> Ver ranking e conquistas</Link></div></section>
    </>}

    {type === "community" && <><section className={styles.panel}><h2>Compartilhe uma conquista ou dúvida</h2><textarea rows="4" value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Como foi sua sessão de estudos hoje?"/><div className={styles.actions}><span>Feed local de demonstração neste navegador.</span><button onClick={addPost}><FaPlus/> Publicar</button></div></section><section className={styles.panel}><h2>Feed de estudantes</h2>{posts.length?posts.map(post=><article className={styles.post} key={post.id}><strong>{post.author}</strong><small>{new Date(post.createdAt).toLocaleString("pt-BR")}</small><p>{post.text}</p><button className={styles.iconButton} onClick={()=>remove(setPosts,post.id)} aria-label="Excluir publicação"><FaTrash/></button></article>):<p className={styles.empty}>Ainda não há publicações. Seja o primeiro a compartilhar algo!</p>}</section><p className={styles.disclaimer}>Este feed é armazenado somente no navegador atual e não representa uma comunidade online compartilhada entre contas.</p></>}

    {type === "admin" && <><section className={styles.panel}><h2>Visão geral</h2><p>Esta área não substitui um painel administrativo seguro. A gestão real de usuários, documentos e moderação exige permissões administrativas validadas no servidor.</p><div className={styles.stats}><div><strong>{progress?.questionsAnswered ?? "—"}</strong><span>Questões no seu progresso</span></div><div><strong>{essays.length}</strong><span>Redações neste navegador</span></div><div><strong>{tasks.length}</strong><span>Tarefas locais</span></div></div></section></>}
  </main></div>;
}
