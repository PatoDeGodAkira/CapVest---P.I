import styles from "./TopBar.module.css";

import {
    FaBell,
    FaFire,
    FaSearch,
    FaMoon
} from "react-icons/fa";

export default function TopBar(){

    const today = new Date();

    const options = {
        weekday:"long",
        day:"numeric",
        month:"long"
    };

    const data = today.toLocaleDateString(
        "pt-BR",
        options
    );

    return(

        <header className={styles.topbar}>

            <div className={styles.left}>

                <div className={styles.search}>

                    <FaSearch/>

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

                    <FaFire/>

                    <span>128 dias</span>

                </button>

                <button className={styles.iconButton}>

                    <FaBell/>

                    <span className={styles.notification}></span>

                </button>

                <button className={styles.iconButton}>

                    <FaMoon/>

                </button>

                <div className={styles.user}>

                    <img
                        src="https://i.pravatar.cc/150"
                        alt="Usuário"
                    />

                    <div>

                        <strong>Elias</strong>

                        <span>Capivara Persistente</span>

                    </div>

                </div>

            </div>

        </header>

    );

}