import styles from "./MaterialsPage.module.css";

import Sidebar from "../../components/Sidebar/Sidebar";

import VestibularCard from "../../components/VestibularCard/VestibularCard";

import StatsBanner from "../../components/StatsBanner/StatsBanner";

import materials from "../../data/materials";

export default function MaterialsPage() {

    return (

        <div className={styles.layout}>

            <Sidebar />

            <main className={styles.content}>

                <section className={styles.hero}>

                    <div>

                        <h1>Biblioteca de Materiais</h1>

                        <p>

                            Acesse gratuitamente editais, provas, gabaritos,
                            manuais e documentos oficiais do ENEM,
                            UNICAMP e FUVEST.

                        </p>

                    </div>

                </section>

                <StatsBanner materials={materials} />

                <section className={styles.cards}>

                    {

                        materials.map((vestibular)=>(
                            <VestibularCard
                                key={vestibular.id}
                                vestibular={vestibular}
                            />
                        ))

                    }

                </section>

            </main>

        </div>

    );

}