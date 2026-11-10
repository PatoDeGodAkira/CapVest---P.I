import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaBookOpen, FaDownload, FaFileAlt, FaClipboardList, FaSpinner, FaPlay } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import vestibulares from "../../data/vestibulares";
import { DOCUMENTS, CATEGORIES } from "../../data/documents";
import { getExams } from "../../services/api";
import styles from "./VestibularPage.module.css";

export default function VestibularPage() {
  const { id } = useParams();
  const vestibular = vestibulares[id];
  const [examCounts, setExamCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("provas");
  const [year, setYear] = useState("todos");

  useEffect(() => {
    getExams().then((data) => setExamCounts(Object.fromEntries((data.exams || []).map((exam) => [exam.id, exam.questionCount])))).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const documents = useMemo(() => DOCUMENTS.filter((doc) => doc.vestibularId === id && doc.categoryId === category && (year === "todos" || String(doc.year) === year)).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)), [id, category, year]);
  const years = [...new Set(DOCUMENTS.filter((doc) => doc.vestibularId === id && doc.categoryId === category).map((doc) => String(doc.year)))].sort((a, b) => Number(b) - Number(a));

  if (!vestibular) return <div className={styles.layout}><Sidebar /><main className={styles.content}><h1>Vestibular não encontrado.</h1><Link to="/materiais">Voltar</Link></main></div>;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <Link to="/materiais" className={styles.back}><FaArrowLeft /> Biblioteca</Link>
        <section className={styles.hero} style={{ backgroundImage: `url(${vestibular.banner})` }}><div className={styles.overlay}></div><div className={styles.heroContent}><span>BIBLIOTECA DE VESTIBULARES</span><h1>{vestibular.nome}</h1><h2>{vestibular.subtitulo}</h2><p>{vestibular.descricao}</p></div></section>
        <section className={styles.librarySection}>
          <div className={styles.sectionHeading}><div><span>ACERVO DISPONÍVEL</span><h2>Materiais e provas</h2><p>Selecione uma categoria para consultar os documentos disponíveis.</p></div><strong>{DOCUMENTS.filter((doc) => doc.vestibularId === id).length} documentos</strong></div>
          <div className={styles.categoryTabs}>{CATEGORIES.map((item) => <button key={item.id} className={category === item.id ? styles.activeTab : ""} onClick={() => { setCategory(item.id); setYear("todos"); }}>{item.title}</button>)}</div>
          <div className={styles.filters}><label htmlFor="year-filter">Ano</label><select id="year-filter" value={year} onChange={(event) => setYear(event.target.value)}><option value="todos">Todos os anos</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          {loading && <div className={styles.loading}><FaSpinner className={styles.spin} /> Carregando dados das provas...</div>}
          {!loading && documents.length === 0 && <div className={styles.empty}>Ainda não há documentos cadastrados nesta categoria.</div>}
          <div className={styles.documentGrid}>{documents.map((doc) => {
            const count = examCounts[doc.id] || 0;
            return <article className={styles.documentCard} key={doc.id}><div className={styles.documentIcon}>{category === "provas" ? <FaBookOpen /> : category === "gabaritos" ? <FaClipboardList /> : <FaFileAlt />}</div><div className={styles.documentInfo}><span>{doc.year} · {doc.vestibularName}</span><h3>{doc.title}</h3>{category === "provas" && <small>{count ? `${count} questões extraídas` : "Documento disponível · questões ainda não indexadas"}</small>}</div><div className={styles.documentActions}><a href={doc.file} target="_blank" rel="noreferrer"><FaDownload /> PDF</a>{category === "provas" && <Link className={count ? styles.solveButton : styles.disabledButton} to={count ? `/provas/${encodeURIComponent(doc.id)}` : "#"} onClick={(event) => { if (!count) event.preventDefault(); }}><FaPlay /> {count ? "Resolver no site" : "Indisponível"}</Link>}</div></article>;
          })}</div>
        </section>
      </main>
    </div>
  );
}
