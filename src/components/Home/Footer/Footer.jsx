import styles from "./Footer.module.css";

import {
    FaGithub,
    FaEnvelope,
    FaGraduationCap,
    FaBook,
    FaUniversity
} from "react-icons/fa";

export default function Footer(){

    return(

        <footer className={styles.footer}>

            <div className={styles.top}>

                <div className={styles.brand}>

                    <img
                        src="/assets/logo.jpg"
                        alt="CapVest"
                        onError={(e)=>{
                            e.target.style.display="none";
                        }}
                    />

                    <h2>CapVest</h2>

                    <p>

                        Plataforma completa para preparação
                        de vestibulares, simulados, redações
                        e organização dos estudos.

                    </p>

                </div>

                <div>

                    <h3>Vestibulares</h3>

                    <a href="#">ENEM</a>

                    <a href="#">UNICAMP</a>

                    <a href="#">FUVEST</a>

                </div>

                <div>

                    <h3>Recursos</h3>

                    <a href="#">Questões</a>

                    <a href="#">Simulados</a>

                    <a href="#">Cronograma</a>

                    <a href="#">Materiais</a>

                </div>

                <div>

                    <h3>Projeto</h3>

                    <a href="#">

                        <FaGithub/>

                        GitHub

                    </a>

                    <a href="#">

                        <FaEnvelope/>

                        Contato

                    </a>

                </div>

            </div>

            <div className={styles.bottom}>

                <div>

                    <FaGraduationCap/>

                    Desenvolvido para auxiliar estudantes
                    brasileiros.

                </div>

                <span>

                    © 2026 CapVest • Versão 1.0.0

                </span>

            </div>

        </footer>

    );

}