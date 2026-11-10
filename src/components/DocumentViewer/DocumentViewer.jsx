import { useEffect, useState } from "react";
import { FaDownload, FaExternalLinkAlt, FaTimes, FaFileExcel } from "react-icons/fa";

import styles from "./DocumentViewer.module.css";
import { checkFile, downloadFile } from "../../utils/files";

export default function DocumentViewer({ doc, page, onClose }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    checkFile(doc.file).then((ok) => {
      if (active) setResult({ file: doc.file, ok });
    });
    return () => {
      active = false;
    };
  }, [doc.file]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const status = result?.file === doc.file ? (result.ok ? "ok" : "missing") : "loading";
  const src = page ? `${doc.file}#page=${page}` : doc.file;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ "--accent": doc.color }}
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.title}>
            <span className={styles.badge}>
              {doc.vestibularName} · {doc.year}
            </span>
            <h3>{doc.title}</h3>
          </div>

          <div className={styles.actions}>
            {status === "ok" && (
              <>
                <button onClick={() => downloadFile(doc.file, `${doc.id}.pdf`)}>
                  <FaDownload /> <span>Baixar</span>
                </button>
                <a href={src} target="_blank" rel="noreferrer">
                  <FaExternalLinkAlt /> <span>Nova aba</span>
                </a>
              </>
            )}
            <button className={styles.close} onClick={onClose} aria-label="Fechar">
              <FaTimes />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {status === "loading" && <div className={styles.state}>Carregando documento...</div>}

          {status === "ok" && <iframe src={src} title={doc.title} />}

          {status === "missing" && (
            <div className={styles.state}>
              <FaFileExcel />
              <h4>Este arquivo ainda não está disponível</h4>
              <p>O PDF desta prova ainda não foi adicionado à biblioteca.</p>
              <code>public{doc.file}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
