import styles from "./StatsGrid.module.css";

import {
    FaBookOpen,
    FaClipboardCheck,
    FaPenNib,
    FaBullseye
} from "react-icons/fa";

const stats = [

    {
        icon:<FaBookOpen/>,
        title:"Questões Respondidas",
        value:"12.430",
        growth:"+12%",
        progress:82
    },

    {
        icon:<FaClipboardCheck/>,
        title:"Simulados",
        value:"48",
        growth:"+4",
        progress:61
    },

    {
        icon:<FaPenNib/>,
        title:"Redações",
        value:"16",
        growth:"+2",
        progress:74
    },

    {
        icon:<FaBullseye/>,
        title:"Precisão Média",
        value:"84%",
        growth:"+3%",
        progress:84
    }

];

export default function StatsGrid(){

    return(

        <section className={styles.container}>

            <div className={styles.header}>

                <div>

                    <h2>

                        Seu Desempenho

                    </h2>

                    <p>

                        Veja como sua preparação está evoluindo.

                    </p>

                </div>

            </div>

            <div className={styles.grid}>

                {

                    stats.map((item,index)=>(

                        <div
                            className={styles.card}
                            key={index}
                        >

                            <div className={styles.icon}>

                                {item.icon}

                            </div>

                            <span className={styles.title}>

                                {item.title}

                            </span>

                            <h3>

                                {item.value}

                            </h3>

                            <div className={styles.progress}>

                                <div
                                    className={styles.fill}
                                    style={{
                                        width:`${item.progress}%`
                                    }}
                                ></div>

                            </div>

                            <small>

                                {item.growth} nesta semana

                            </small>

                        </div>

                    ))

                }

            </div>

        </section>

    )

}