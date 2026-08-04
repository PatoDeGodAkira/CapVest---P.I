
const materials = [
  {
    id: "enem",

    name: "ENEM",

    color: "#6fb7b7",

    image: "/assets/enem.png",

    description:
      "O Exame Nacional do Ensino Médio é a principal porta de entrada para universidades brasileiras.",

    stats: {
      documents: 157,
      provas: 38,
      editais: 11,
      gabaritos: 38,
      manuais: 8
    },

    categories: [
      {
        id: "editais",
        title: "Editais",

        icon: "📄",

        documents: [
          {
            title: "Edital ENEM 2026",
            year: 2026,
            file: "/documents/enem/editais/edital2026.pdf"
          },

          {
            title: "Edital ENEM 2025",
            year: 2025,
            file: "/documents/enem/editais/edital2025.pdf"
          }
        ]
      },

      {
        id: "provas",

        title: "Provas",

        icon: "📝",

        documents: [
          {
            title: "Prova ENEM 2025",
            year: 2025,
            file: "/documents/enem/provas/prova2025.pdf"
          },

          {
            title: "Prova ENEM 2024",
            year: 2024,
            file: "/documents/enem/provas/prova2024.pdf"
          }
        ]
      },

      {
        id: "gabaritos",

        title: "Gabaritos",

        icon: "✅",

        documents: [
          {
            title: "Gabarito ENEM 2025",
            year: 2025,
            file: "/documents/enem/gabaritos/gabarito2025.pdf"
          }
        ]
      },

      {
        id: "manuais",

        title: "Manuais",

        icon: "📘",

        documents: [
          {
            title: "Manual do Participante",
            year: 2026,
            file: "/documents/enem/manuais/manual2026.pdf"
          }
        ]
      }
    ]
  },

  {
    id: "unicamp",

    name: "UNICAMP",

    color: "#a87a3a",

    image: "/assets/unicamp.png",

    description:
      "Vestibular da Universidade Estadual de Campinas, conhecido pelo alto nível de exigência.",

    stats: {
      documents: 91,
      provas: 27,
      editais: 12,
      gabaritos: 27,
      manuais: 4
    },

    categories: [
      {
        id: "editais",

        title: "Editais",

        icon: "📄",

        documents: [
          {
            title: "Edital UNICAMP 2026",

            year: 2026,

            file: "/documents/unicamp/editais/2026.pdf"
          }
        ]
      },

      {
        id: "provas",

        title: "Provas",

        icon: "📝",

        documents: [
          {
            title: "Primeira Fase 2025",

            year: 2025,

            file: "/documents/unicamp/provas/primeira2025.pdf"
          },

          {
            title: "Segunda Fase 2025",

            year: 2025,

            file: "/documents/unicamp/provas/segunda2025.pdf"
          }
        ]
      },

      {
        id: "gabaritos",

        title: "Gabaritos",

        icon: "✅",

        documents: [
          {
            title: "Gabarito Primeira Fase",

            year: 2025,

            file: "/documents/unicamp/gabaritos/2025.pdf"
          }
        ]
      },

      {
        id: "manuais",

        title: "Manuais",

        icon: "📘",

        documents: [
          {
            title: "Manual do Candidato",

            year: 2026,

            file: "/documents/unicamp/manuais/manual.pdf"
          }
        ]
      }
    ]
  },

  {
    id: "fuvest",

    name: "FUVEST",

    color: "#76805b",

    image: "/assets/fuvest.png",

    description:
      "Vestibular da Universidade de São Paulo com provas de primeira e segunda fase.",

    stats: {
      documents: 103,
      provas: 31,
      editais: 9,
      gabaritos: 31,
      manuais: 5
    },

    categories: [
      {
        id: "editais",

        title: "Editais",

        icon: "📄",

        documents: [
          {
            title: "Edital FUVEST 2026",

            year: 2026,

            file: "/documents/fuvest/editais/2026.pdf"
          }
        ]
      },

      {
        id: "provas",

        title: "Provas",

        icon: "📝",

        documents: [
          {
            title: "Primeira Fase 2025",

            year: 2025,

            file: "/documents/fuvest/provas/primeira2025.pdf"
          }
        ]
      },

      {
        id: "gabaritos",

        title: "Gabaritos",

        icon: "✅",

        documents: [
          {
            title: "Gabarito 2025",

            year: 2025,

            file: "/documents/fuvest/gabaritos/2025.pdf"
          }
        ]
      },

      {
        id: "manuais",

        title: "Manuais",

        icon: "📘",

        documents: [
          {
            title: "Manual do Vestibulando",

            year: 2026,

            file: "/documents/fuvest/manuais/manual.pdf"
          }
        ]
      }
    ]
  }
];

export default materials;