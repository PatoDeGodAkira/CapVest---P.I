import { useEffect, useRef, useState } from "react";
import styles from "./ProfilePage.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getProgress, updateProfile } from "../../services/api";
import { FaMedal, FaBullseye, FaBook, FaFire, FaStar, FaTrophy, FaCamera, FaUserEdit } from "react-icons/fa";

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Selecione um arquivo de imagem."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Imagem inválida."));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 640 / Math.max(image.width, image.height));
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const [user, setUser] = useState(readUser);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    getProgress().then(setProgress).catch((err) => setError(err.message));
  }, []);

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setNotice(""); setSaving(true);
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 12 MB antes da otimização.");
      const avatar_url = await resizeImage(file);
      const updated = await updateProfile({ avatar_url });
      setUser(updated.user || { ...user, avatar_url });
      localStorage.setItem("user", JSON.stringify(updated.user || { ...user, avatar_url }));
      window.dispatchEvent(new Event("capvest:user-updated"));
      setNotice("Foto de perfil atualizada!");
    } catch (err) { setError(err.message || "Não foi possível atualizar a foto."); }
    finally { setSaving(false); event.target.value = ""; }
  };

  const stats = [
    { title: "Questões respondidas", value: progress?.questionsAnswered ?? "—", icon: <FaBook /> },
    { title: "Precisão geral", value: progress ? `${progress.accuracy}%` : "—", icon: <FaBullseye /> },
    { title: "XP conquistados", value: progress?.xp ?? "—", icon: <FaTrophy /> },
    { title: "Sequência atual", value: progress ? `${progress.currentStreak} dias` : "—", icon: <FaFire /> }
  ];
  const unlocked = progress?.achievements?.filter((achievement) => achievement.unlocked) || [];
  const locked = progress?.achievements?.filter((achievement) => !achievement.unlocked) || [];

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <div className={styles.background} />
        <div className={styles.pageHeading}><span>MINHA CONTA</span><h1>Meu perfil</h1><p>Acompanhe sua trajetória e personalize seu espaço no CapVest.</p></div>
        <section className={styles.hero}>
          <div className={styles.banner} />
          <div className={styles.heroContent}>
            <div className={styles.avatarWrap}>
              <img src={user?.avatar_url || "/assets/avatar-default.svg"} alt={user?.name || "Foto de perfil"} className={styles.avatar} />
              <button className={styles.photoButton} type="button" onClick={() => fileRef.current?.click()} disabled={saving} aria-label="Escolher foto de perfil"><FaCamera /></button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handlePhoto} />
            </div>
            <div className={styles.heroInfo}>
              <span className={styles.level}>Capivara estudante · Nível {progress?.level ?? "—"}</span>
              <h2>{user?.name || "Estudante"}</h2>
              <p className={styles.user}>@{user?.username || "usuario"}</p>
              <p className={styles.bio}>{user?.bio || "Cada questão respondida é mais um passo na sua preparação."}</p>
              <div className={styles.tags}><span>{user?.school || "Escola não informada"}</span><span>{user?.education_level || "Estudante"}</span></div>
              <button type="button" className={styles.editPhoto} onClick={() => fileRef.current?.click()} disabled={saving}><FaUserEdit /> {saving ? "Salvando foto..." : "Alterar foto de perfil"}</button>
            </div>
          </div>
        </section>
        {notice && <p className={styles.notice} role="status">{notice}</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <section className={styles.xpCard}>
          <div className={styles.xpTop}><div><h2>Experiência de estudos</h2><p>Seu nível evolui conforme você pratica e responde questões.</p></div><strong>{progress ? `${progress.xp} XP` : "— XP"}</strong></div>
          <div className={styles.progressBar}><div className={styles.progress} style={{ width: `${progress?.levelProgress || 0}%` }} /></div>
          <span>{progress ? `${progress.xpInLevel} de ${progress.xpForNextLevel} XP neste nível · faltam ${Math.max(0, progress.xpForNextLevel - progress.xpInLevel)} XP para o próximo nível` : "Carregando seu progresso..."}</span>
        </section>
        <section className={styles.statsGrid}>
          {stats.map((item) => <div key={item.title} className={styles.statCard}><div className={styles.statIcon}>{item.icon}</div><div><span>{item.title}</span><strong>{item.value}</strong></div></div>)}
        </section>
        <section className={styles.badgesCard}>
          <div className={styles.cardHeader}><FaMedal /><h2>Conquistas</h2></div>
          {!progress ? <p>Carregando conquistas...</p> : <>
            <h3 className={styles.achievementHeading}>Desbloqueadas ({unlocked.length})</h3>
            <div className={styles.badges}>{unlocked.map((item) => <div key={item.id} className={styles.badge}><FaStar />{item.title}</div>)}</div>
            <h3 className={styles.achievementHeading}>Próximas conquistas</h3>
            <div className={styles.badges}>{locked.map((item) => <div key={item.id} className={`${styles.badge} ${styles.lockedBadge}`} title={item.description}><FaStar />{item.title}</div>)}</div>
            {unlocked.length === 0 && <p>Responda sua primeira questão para desbloquear sua primeira conquista.</p>}
          </>}
        </section>
      </main>
    </div>
  );
}
