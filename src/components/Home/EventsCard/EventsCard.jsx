import styles from "./EventsCard.module.css";

import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt
} from "react-icons/fa";

const events = [

    {
        date:"08 AGO",
        title:"Simulado Geral ENEM",
        hour:"09:00",
        place:"CapVest Online",
        color:"enem"
    },

    {
        date:"12 AGO",
        title:"Revisão de Matemática",
        hour:"19:00",
        place:"Sala Virtual",
        color:"study"
    },

    {
        date:"20 AGO",
        title:"Vestibular UNICAMP",
        hour:"13:00",
        place:"Campinas",
        color:"unicamp"
    },

    {
        date:"01 SET",
        title:"Vestibular FUVEST",
        hour:"13:00",
        place:"São Paulo",
        color:"fuvest"
    }

];

export default function EventsCard(){

    return(

        <section className={styles.card}>

            <div className={styles.header}>

                <div>

                    <h2>Próximos Eventos</h2>

                    <p>
                        Não perca nenhuma data importante.
                    </p>

                </div>

                <FaCalendarAlt/>

            </div>

            <div className={styles.timeline}>

                {

                    events.map((event,index)=>(

                        <div
                            key={index}
                            className={styles.event}
                        >

                            <div
                                className={`${styles.date} ${styles[event.color]}`}
                            >

                                {event.date}

                            </div>

                            <div className={styles.info}>

                                <h3>

                                    {event.title}

                                </h3>

                                <div className={styles.details}>

                                    <span>

                                        <FaClock/>

                                        {event.hour}

                                    </span>

                                    <span>

                                        <FaMapMarkerAlt/>

                                        {event.place}

                                    </span>

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </section>

    );

}