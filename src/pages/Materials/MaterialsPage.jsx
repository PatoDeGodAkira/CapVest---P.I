import styles from "./MaterialsPage.module.css";

import Sidebar from "../../components/Sidebar/Sidebar";

import VestibularCard from "../../components/VestibularCard/VestibularCard";

import StatsBanner from "../../components/StatsBanner/StatsBanner";

import materials from "../../data/materials";
import { DOCUMENTS } from "../../data/documents";

export default function MaterialsPage() {
    const liveMaterials = materials.map((vestibular) => {
        const docs = DOCUMENTS.filter((doc) => doc.vestibularId === vestibular.id);
        return {
            ...vestibular,
            stats: {
                documents: docs.length,
                provas: docs.filter((doc) => doc.categoryId === "provas").length,
                editais: docs.filter((doc) => doc.categoryId === "editais" || doc.categoryId === "manuais").length,
                gabaritos: docs.filter((doc) => doc.categoryId === "gabaritos").length
            },
            categories: [
                { id: "provas", title: "Provas", icon: "📝" },
                { id: "editais", title: "Editais", icon: "📄" },
                { id: "gabaritos", title: "Gabaritos", icon: "✅" }
            ]
        };
    });

    return (

        <div className={styles.layout}>

            <Sidebar />

            <main className={styles.content}>

                <section className={styles.hero}>

                    <div>

                        <span className={styles.eyebrow}>CENTRAL DE ESTUDOS</span>
                        <h1>Biblioteca de Materiais</h1>

                        <p>

                            Acesse gratuitamente editais, provas, gabaritos,
                            manuais e documentos oficiais do ENEM,
                            UNICAMP e FUVEST. Encontre provas por instituição,
                            ano e categoria em um só lugar.

                        </p>

                    </div>

                </section>

                <StatsBanner materials={liveMaterials} />

                <section className={styles.cards}>

                    {

                        liveMaterials.map((vestibular)=>(
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