import styles from "./NewsSection.module.css";

import {
    FaArrowRight,
    FaNewspaper
} from "react-icons/fa";

const news = [

    {
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZrXEhDQ5SlgCTCSqe8uSJ7ZAvcszMkzfaRXnAqFcR-GRUZ-cAQGNP-dnm&s=10",
        category:"ENEM",
        title:"Inscrições do ENEM 2027 começam em agosto",
        description:"Confira o cronograma completo e não perca os prazos."
    },

    {
        image:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900",
        category:"UNICAMP",
        title:"Edital da UNICAMP é atualizado",
        description:"Veja todas as mudanças para o próximo vestibular."
    },

    {
        image:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900",
        category:"FUVEST",
        title:"Calendário oficial divulgado",
        description:"Primeira fase acontecerá no mês de novembro."
    }

];

export default function NewsSection(){

    return(

        <section className={styles.section}>

            <div className={styles.header}>

                <div>

                    <h2>Notícias</h2>

                    <p>
                        Acompanhe tudo sobre os vestibulares.
                    </p>

                </div>

                <button>

                    Ver todas

                </button>

            </div>

            <div className={styles.grid}>

                {

                    news.map((item,index)=>(

                        <article
                            className={styles.card}
                            key={index}
                        >

                            <img
                                src={item.image}
                                alt={item.title}
                            />

                            <div className={styles.content}>

                                <span>

                                    <FaNewspaper/>

                                    {item.category}

                                </span>

                                <h3>

                                    {item.title}

                                </h3>

                                <p>

                                    {item.description}

                                </p>

                                <button>

                                    Ler notícia

                                    <FaArrowRight/>

                                </button>

                            </div>

                        </article>

                    ))

                }

            </div>

        </section>

    )

}