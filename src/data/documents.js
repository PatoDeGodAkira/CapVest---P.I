import materials from "./materials";
import library from "./library.json"; // gerado por `npm run ingest` / `npm run library`

export const CATEGORIES = [
  { id: "provas", title: "Provas" },
  { id: "gabaritos", title: "Gabaritos" },
  { id: "editais", title: "Editais" },
  { id: "manuais", title: "Manuais" }
];

const DEFAULT_COLOR = "#6b4f3b";
const meta = new Map(materials.map((m) => [m.id, m]));

/** Vestibulares conhecidos (materials.js) + qualquer pasta nova criada em public/documents. */
const vestibularIds = [...new Set([...materials.map((m) => m.id), ...library.map((d) => d.vestibularId)])];

export const VESTIBULARES = vestibularIds.map((id) => {
  const m = meta.get(id);
  return {
    id,
    name: m?.name ?? id.toUpperCase(),
    color: m?.color ?? DEFAULT_COLOR,
    description: m?.description ?? `Provas e materiais do ${id.toUpperCase()}`
  };
});

const vestById = new Map(VESTIBULARES.map((v) => [v.id, v]));
const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

/** Lista única de documentos: só entra o que realmente existe em public/documents. */
export const DOCUMENTS = library.map((doc) => ({
  ...doc,
  vestibularName: vestById.get(doc.vestibularId).name,
  color: vestById.get(doc.vestibularId).color,
  categoryTitle: categoryById.get(doc.categoryId).title
}));
