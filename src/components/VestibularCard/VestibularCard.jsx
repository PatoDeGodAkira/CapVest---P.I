
import styles from "./VestibularCard.module.css";
import { FaArrowRight, FaBookOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function VestibularCard({ vestibular }) {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/materiais/${vestibular.id}`);
    };

    return (

        <div
            className={styles.card}
            style={{
                "--accent": vestibular.color
            }}
        >

            <div className={styles.top}>

                <div className={styles.logoContainer}>

                    <img
                        src={vestibular.image}
                        alt={vestibular.name}
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />

                </div>

                <div>

                    <h2>{vestibular.name}</h2>

                    <p>
                        {vestibular.description}
                    </p>

                </div>

            </div>

            <div className={styles.stats}>

                <div>

                    <strong>{vestibular.stats.documents}</strong>

                    <span>Documentos</span>

                </div>

                <div>

                    <strong>{vestibular.stats.provas}</strong>

                    <span>Provas</span>

                </div>

                <div>

                    <strong>{vestibular.stats.editais}</strong>

                    <span>Editais</span>

                </div>

            </div>

            <div className={styles.bottom}>

                <div className={styles.categories}>

                    {vestibular.categories.map((category) => (

                        <span key={category.id}>

                            {category.icon}

                            {category.title}

                        </span>

                    ))}

                </div>

                <button onClick={handleClick}>

                    <FaBookOpen />

                    Acessar Biblioteca

                    <FaArrowRight />

                </button>

            </div>

        </div>

    );

}