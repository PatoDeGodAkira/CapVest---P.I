const fs = require("fs");
const path = require("path");

const INDEX_FILE = process.env.CAPVEST_INDEX_OUT || path.join(__dirname, "../data/questions-index.json");

const STOPWORDS = new Set(
    (
        "a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sob sobre entre ate " +
        "e ou mas que se como mais menos muito muitos ja nao sim ao aos pelo pela pelos pelas seu sua seus suas " +
        "este esta estes estas esse essa esses essas isso isto aquele aquela aquilo foi sao ser era eram ha " +
        "tem ter tinha entao quando onde qual quais cujo cuja quanto quanta tambem so sua dele dela deles delas " +
        "assinale alternativa correta texto questao"
    ).split(" ")
);

const strip = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Radical simplificado: só precisa ser consistente entre a pergunta e as provas. */
function stem(word) {
    let w = word;
    if (w.length < 4) return w;

    w = w
        .replace(/(oes|aes|aos)$/, "ao")
        .replace(/ais$/, "al")
        .replace(/eis$/, "el")
        .replace(/ns$/, "m")
        .replace(/([rz])es$/, "$1")
        .replace(/s$/, "");

    if (w.length > 4) w = w.replace(/[aeo]$/, "");
    return w;
}

function tokenize(text) {
    return strip(text)
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
        .map(stem);
}

/* ------------------------------ índice em memória ------------------------------ */

let cache = { mtime: -1, data: null };

function load() {
    let mtime;
    try {
        mtime = fs.statSync(INDEX_FILE).mtimeMs;
    } catch {
        return { documents: [], questions: [], byId: new Map(), df: new Map(), avgLen: 0, generatedAt: null, tf: [] };
    }

    if (cache.data && cache.mtime === mtime) return cache.data;

    const raw = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
    const questions = raw.questions || [];

    const tf = [];
    const df = new Map();
    let totalLen = 0;

    for (const q of questions) {
        const tokens = tokenize(q.text + " " + (q.context || ""));
        const counts = new Map();
        for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);

        tf.push({ counts, len: tokens.length || 1 });
        totalLen += tokens.length || 1;
        for (const t of counts.keys()) df.set(t, (df.get(t) || 0) + 1);
    }

    const docs = new Map((raw.documents || []).map((d) => [d.id, d]));

    const data = {
        documents: raw.documents || [],
        docsById: docs,
        questions,
        byId: new Map(questions.map((q) => [q.id, q])),
        flat: questions.map((q) => strip(q.text + " " + (q.context || ""))),
        tf,
        df,
        avgLen: questions.length ? totalLen / questions.length : 0,
        generatedAt: raw.generatedAt || null
    };

    cache = { mtime, data: data };
    return data;
}

/* ----------------------------------- busca ----------------------------------- */

/** Raridade de um radical: palavras que quase nenhuma questão tem valem mais. */
const idf = (idx, token, N) => {
    const df = idx.df.get(token);
    return df === undefined ? Infinity : Math.log(1 + (N - df + 0.5) / (df + 0.5));
};

/**
 * terms: [{ text, weight }] — termos já em texto livre (serão normalizados aqui)
 * phrase: frase original (ganha bônus se aparecer inteira)
 */
function search({ terms, phrase, vestibularId, limit = 20, strict = false }) {
    const idx = load();
    const N = idx.questions.length;
    if (!N) return [];

    const k1 = 1.4;
    const b = 0.75;

    const weighted = new Map(); // radical -> peso
    for (const { text, weight } of terms) {
        for (const token of tokenize(text)) {
            weighted.set(token, Math.max(weighted.get(token) || 0, weight));
        }
    }

    const flatPhrase = phrase ? strip(phrase).trim() : "";
    const results = [];

    // Modo estrito (sem IA): em buscas com 2+ palavras, a palavra mais rara tem que aparecer.
    // Evita "Lei de Ohm" devolver "Lei de Terras" só porque as duas têm "lei".
    // Palavra que nenhuma prova contém (idf infinito) zera o resultado: melhor nada do que lixo.
    let mustHave = null;
    if (strict && phrase) {
        const original = [...new Set(tokenize(phrase))];
        if (original.length >= 2) {
            mustHave = original.sort((a, b) => (idf(idx, a, N) < idf(idx, b, N) ? 1 : -1))[0];
            if (!idx.df.has(mustHave)) return [];
        }
    }

    for (let i = 0; i < N; i++) {
        const q = idx.questions[i];
        if (vestibularId && q.vestibularId !== vestibularId) continue;

        const { counts, len } = idx.tf[i];
        if (mustHave && !counts.has(mustHave)) continue;
        let score = 0;
        let matched = 0;

        for (const [token, weight] of weighted) {
            const f = counts.get(token);
            if (!f) continue;

            const df = idx.df.get(token);
            const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
            score += weight * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * len) / idx.avgLen)));
            matched++;
        }

        if (!score) continue;

        if (flatPhrase.length > 3 && idx.flat[i].includes(flatPhrase)) score *= 1.6;

        // cobrir mais termos distintos da busca vale mais do que repetir um só
        score *= 1 + matched / Math.max(weighted.size, 1);

        results.push({ question: q, score });
    }

    return results.sort((a, b2) => b2.score - a.score).slice(0, limit);
}

/** Trecho do enunciado centrado no primeiro termo encontrado. */
function makeSnippet(text, terms, size = 380) {
    const flat = Array.from(text, (ch) => ch.normalize("NFD")[0].toLowerCase()).join("");
    let pos = -1;

    for (const term of terms) {
        const prefix = strip(term).slice(0, 5);
        if (prefix.length < 4) continue;
        const at = flat.indexOf(prefix);
        if (at !== -1 && (pos === -1 || at < pos)) pos = at;
    }

    let start = Math.max(0, pos - 80);
    if (start > 0) {
        const space = text.indexOf(" ", start);
        if (space !== -1 && space - start < 20) start = space + 1; // não começa no meio de uma palavra
    }
    let snippet = text.slice(start, start + size).replace(/\s+/g, " ").trim();

    if (start > 0) snippet = "…" + snippet;
    if (start + size < text.length) snippet += "…";
    return snippet;
}

/** Resumo do que está indexado (para o /status e para validar vestibulares). */
function stats() {
    const idx = load();
    const perVest = new Map();

    for (const q of idx.questions) {
        perVest.set(q.vestibularId, (perVest.get(q.vestibularId) || 0) + 1);
    }

    return {
        documents: idx.documents.filter((d) => d.status === "ok").length,
        questions: idx.questions.length,
        generatedAt: idx.generatedAt,
        vestibulares: [...perVest].map(([id, questions]) => ({ id, name: id.toUpperCase(), questions }))
    };
}

const getQuestion = (id) => load().byId.get(id);
const docTitle = (id) => load().docsById?.get(id)?.title || id;

function listDocuments() {
    const libraryFile = path.join(__dirname, "../../src/data/library.json");
    let library = [];
    try { library = JSON.parse(fs.readFileSync(libraryFile, "utf8")); } catch { /* biblioteca ainda não gerada */ }
    const indexed = new Map(load().documents.map((doc) => [doc.id, doc]));
    return library.map((doc) => ({ ...doc, ...(indexed.get(doc.id) || {}), categoryId: doc.categoryId, vestibularId: doc.vestibularId, file: doc.file }));
}

const getDocument = (id) => listDocuments().find((doc) => doc.id === id) || null;
const getQuestionsByDoc = (id) => load().questions.filter((question) => question.docId === id);
const getAllQuestions = () => load().questions;

module.exports = { search, makeSnippet, stats, getQuestion, docTitle, tokenize, listDocuments, getDocument, getQuestionsByDoc, getAllQuestions };
