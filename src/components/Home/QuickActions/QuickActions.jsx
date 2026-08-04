import styles from "./QuickActions.module.css";

import {
    FaBookOpen,
    FaClipboardList,
    FaPenNib,
    FaChartLine,
    FaFolderOpen,
    FaCalendarAlt,
    FaTrophy,
    FaArrowRight
} from "react-icons/fa";

const actions = [

    {
        icon:<FaBookOpen/>,
        title:"Questões",
        text:"Resolva exercícios por matéria."
    },

    {
        icon:<FaClipboardList/>,
        title:"Simulados",
        text:"Treine como se estivesse na prova."
    },

    {
        icon:<FaPenNib/>,
        title:"Redações",
        text:"Envie e acompanhe suas correções."
    },

    {
        icon:<FaChartLine/>,
        title:"Desempenho",
        text:"Visualize sua evolução."
    },

    {
        icon:<FaFolderOpen/>,
        title:"Materiais",
        text:"Editais, provas e apostilas."
    },

    {
        icon:<FaCalendarAlt/>,
        title:"Cronograma",
        text:"Organize seus estudos."
    },

    {
        icon:<FaTrophy/>,
        title:"Ranking",
        text:"Compare seu desempenho."
    },

    {
        icon:<FaArrowRight/>,
        title:"Continuar",
        text:"Volte exatamente de onde parou."
    }

];

export default function QuickActions(){

    return(

        <section>

            <div className={styles.header}>

                <h2>

                    Acesso Rápido

                </h2>

                <span>

                    Tudo o que você precisa em um clique.

                </span>

            </div>

            <div className={styles.grid}>

                {

                    actions.map((item,index)=>(

                        <div
                            key={index}
                            className={styles.card}
                        >

                            <div className={styles.icon}>

                                {item.icon}

                            </div>

                            <h3>

                                {item.title}

                            </h3>

                            <p>

                                {item.text}

                            </p>

                            <div className={styles.arrow}>

                                →

                            </div>

                        </div>

                    ))

                }

            </div>

        </section>

    )

}