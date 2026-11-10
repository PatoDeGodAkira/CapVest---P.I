import styles from "./TopBar.module.css";

import { useEffect, useState } from "react";
import { FaBell, FaFire, FaSearch, FaMoon } from "react-icons/fa";
import { getProgress } from "../../../services/api";

export default function TopBar() {
    const [progress, setProgress] = useState(null);
    useEffect(() => { getProgress().then(setProgress).catch(() => {}); }, []);

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    const data = today.toLocaleDateString(
        "pt-BR",
        options
    );

    const user = (() => {
        try { return JSON.parse(localStorage.getItem("user")); }
        catch { return null; }
    })();

    return (

        <header className={styles.topbar}>

            <div className={styles.left}>

                <div className={styles.search}>

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Pesquisar matérias, simulados, exercícios..."
                    />

                </div>

            </div>

            <div className={styles.right}>

                <div className={styles.date}>

                    {data}

                </div>

                <button className={styles.streak}>

                    <FaFire />

                    <span>{progress ? `${progress.currentStreak} dias` : "— dias"}</span>

                </button>

                <button className={styles.iconButton}>

                    <FaBell />

                    <span className={styles.notification}></span>

                </button>

                <button className={styles.iconButton}>

                    <FaMoon />

                </button>

                <div className={styles.user}>

                    <img
                        src={
                            user?.avatar_url ||
                            "https://i.pravatar.cc/150"
                        }
                        alt={user?.name || "Usuário"}
                    />

                    <div>

                        <strong>
                            {user?.name || "Usuário"}
                        </strong>

                        <span>
                            Capivara Persistente
                        </span>

                    </div>

                </div>

            </div>

        </header>

    );
}