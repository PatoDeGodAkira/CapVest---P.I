import styles from "./RankingCard.module.css";

import {
    FaCrown,
    FaArrowUp,
    FaMedal
} from "react-icons/fa";

const ranking = [
    {
        position:1,
        name:"Lucas Martins",
        xp:"12.450 XP"
    },
    {
        position:2,
        name:"Ana Clara",
        xp:"12.110 XP"
    },
    {
        position:3,
        name:"Pedro Henrique",
        xp:"11.890 XP"
    },
    {
        position:4,
        name:"Julia Lima",
        xp:"11.650 XP"
    },
    {
        position:14,
        name:"Você",
        xp:"8.420 XP",
        me:true
    }
];

export default function RankingCard(){

    return(

        <section className={styles.card}>

            <div className={styles.header}>

                <div>

                    <h2>

                        Ranking Semanal

                    </h2>

                    <p>

                        Continue estudando para subir posições.

                    </p>

                </div>

                <FaCrown className={styles.crown}/>

            </div>

            <div className={styles.position}>

                <span>Sua posição</span>

                <h1>#14</h1>

                <div className={styles.up}>

                    <FaArrowUp/>

                    <span>+18 posições nesta semana</span>

                </div>

            </div>

            <div className={styles.progressArea}>

                <div className={styles.progressHeader}>

                    <span>Próximo nível</span>

                    <span>82%</span>

                </div>

                <div className={styles.progressBar}>

                    <div className={styles.fill}></div>

                </div>

            </div>

            <div className={styles.list}>

                {

                    ranking.map((user)=>(
                        <div
                            key={user.position}
                            className={`${styles.item} ${user.me ? styles.me : ""}`}
                        >

                            <div className={styles.left}>

                                <span className={styles.number}>

                                    #{user.position}

                                </span>

                                <span>

                                    {user.name}

                                </span>

                            </div>

                            <div className={styles.right}>

                                {

                                    user.position <=3 &&

                                    <FaMedal className={styles.medal}/>

                                }

                                <span>

                                    {user.xp}

                                </span>

                            </div>

                        </div>

                    ))

                }

            </div>

        </section>

    );

}