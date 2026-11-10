/**
 * Uso (a partir da raiz do projeto):
 *   npm run ingest      -> atualiza a lista de documentos E o índice de questões
 *   npm run library     -> só a lista de documentos (rápido, não lê os PDFs)
 *   npm run ingest -- --force   -> reprocessa todos os PDFs
 *
 * Gera:
 *   src/data/library.json                -> usado pela página de Materiais
 *   backend/data/questions-index.json    -> usado pela busca do CapyAssistant
 */
const fs = require("fs");
const path = require("path");

const { scanLibrary, toPublic } = require("../Services/library");
const { splitQuestions } = require("../Services/questionSplitter");
const { parseAnswerKey } = require("../Services/answerKey");

const ROOT = path.resolve(__dirname, "../..");
const DOCS_DIR = process.env.CAPVEST_DOCS_DIR || path.join(ROOT, "public/documents");
const LIBRARY_OUT = process.env.CAPVEST_LIBRARY_OUT || path.join(ROOT, "src/data/library.json");
const INDEX_OUT = process.env.CAPVEST_INDEX_OUT || path.join(__dirname, "../data/questions-index.json");

const args = process.argv.slice(2);
const LIBRARY_ONLY = args.includes("--library-only");
const FORCE = args.includes("--force");

function writeIfChanged(file, data) {
    const json = JSON.stringify(data, null, 2) + "\n";
    fs.mkdirSync(path.dirname(file), { recursive: true });

    if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === json) return false;

    fs.writeFileSync(file, json);
    return true;
}

function readIndex() {
    try {
        return JSON.parse(fs.readFileSync(INDEX_OUT, "utf8"));
    } catch {
        return { documents: [], questions: [] };
    }
}

const strip = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** "1ª Fase", "Dia 2"...: o que identifica qual etapa uma prova/gabarito cobre. */
const stageOf = (title) => (title.match(/\d+ª Fase|Dia \d/g) || []).join("|");

/** Letra do código da questão -> disciplina que aparece no nome do guia de respostas (FUVEST 2ª fase). */
const GUIDE_SUBJECTS = { M: "matematica", F: "fisica", Q: "quimica", B: "biologia", H: "historia", G: "geografia" };

/**
 * Liga cada questão ao seu gabarito:
 *  - questões numeradas (1ª fase): lê o gabarito da mesma etapa/ano e grava `answer` (ou `annulled`);
 *  - questões com código (M01...): aponta o guia de respostas da disciplina (`guide`).
 * Roda a cada ingestão: o gabarito pode mudar sem a prova mudar.
 */
async function attachAnswers(documents, questions) {
    const { extractPages } = require("../Services/pdfText");

    const gabaritos = documents.filter((d) => d.categoryId === "gabaritos");
    const exams = new Map(documents.filter((d) => d.categoryId === "provas").map((d) => [d.id, d]));
    const keyCache = new Map();
    const keyByExam = new Map();
    const stats = { answers: 0, guides: 0, exams: new Set() };

    const loadKey = async (doc) => {
        if (!keyCache.has(doc.id)) {
            try {
                keyCache.set(doc.id, parseAnswerKey(await extractPages(doc.absPath)));
            } catch {
                keyCache.set(doc.id, null);
            }
        }
        return keyCache.get(doc.id);
    };

    for (const q of questions) {
        delete q.answer;
        delete q.annulled;
        delete q.answerDoc;
        delete q.guide;

        const exam = exams.get(q.docId);
        if (!exam) continue;

        const sameStage = gabaritos.filter(
            (g) => g.vestibularId === exam.vestibularId && g.year === exam.year && stageOf(g.title) === stageOf(exam.title)
        );

        if (typeof q.number === "number") {
            if (!keyByExam.has(exam.id)) {
                let found = null;
                // "Retificado" (versão corrigida) tem prioridade
                for (const g of [...sameStage].sort((a, b) => /retificado/i.test(b.title) - /retificado/i.test(a.title))) {
                    const key = await loadKey(g);
                    if (key) {
                        found = { doc: g, key };
                        break;
                    }
                }
                keyByExam.set(exam.id, found);
            }

            const found = keyByExam.get(exam.id);
            const hit = found?.key.get(q.number);

            if (hit) {
                Object.assign(q, hit, { answerDoc: found.doc.id });
                stats.answers++;
                stats.exams.add(exam.id);
            }
        } else if (typeof q.number === "string") {
            const subject = GUIDE_SUBJECTS[q.number[0]];
            const guide = subject && sameStage.find((g) => strip(g.title).includes(subject));

            if (guide) {
                q.guide = guide.id;
                stats.guides++;
            }
        }
    }

    return stats;
}

async function main() {
    const { documents, warnings } = scanLibrary(DOCS_DIR);

    const changedLibrary = writeIfChanged(LIBRARY_OUT, documents.map(toPublic));
    console.log(
        `Biblioteca: ${documents.length} documento(s) ${changedLibrary ? "(lista atualizada)" : "(sem mudanças)"}`
    );

    warnings.forEach((w) => console.warn("  ! " + w));

    if (LIBRARY_ONLY) return;

    const { extractPages } = require("../Services/pdfText");

    const previous = readIndex();
    const prevDocs = new Map(previous.documents.map((d) => [d.id, d]));
    const prevQuestions = new Map();
    for (const q of previous.questions) {
        if (!prevQuestions.has(q.docId)) prevQuestions.set(q.docId, []);
        prevQuestions.get(q.docId).push(q);
    }

    const indexDocs = [];
    const questions = [];
    const problems = [];

    // só provas entram no índice: é de lá que o Capy tira as questões
    for (const doc of documents.filter((d) => d.categoryId === "provas")) {
        const before = prevDocs.get(doc.id);

        if (!FORCE && before && before.hash === doc.hash && before.status === "ok" && before.title === doc.title) {
            indexDocs.push(before);
            questions.push(...(prevQuestions.get(doc.id) || []));
            console.log(`  = ${doc.title} (já indexado, ${before.questions} questões)`);
            continue;
        }

        try {
            const pages = await extractPages(doc.absPath);
            const chars = pages.reduce((n, p) => n + p.length, 0);

            if (chars < 200) {
                indexDocs.push({ id: doc.id, title: doc.title, hash: doc.hash, pages: pages.length, questions: 0, status: "sem-texto" });
                problems.push(`${doc.title}: o PDF parece escaneado (sem texto selecionável). Precisa de OCR.`);
                continue;
            }

            const found = splitQuestions(pages);

            found.forEach((q, i) => {
                questions.push({
                    id: `${doc.id}:${i + 1}`,
                    docId: doc.id,
                    vestibularId: doc.vestibularId,
                    year: doc.year,
                    number: q.number,
                    page: q.page,
                    text: q.text,
                    ...(q.context ? { context: q.context } : {})
                });
            });

            indexDocs.push({ id: doc.id, title: doc.title, hash: doc.hash, pages: pages.length, questions: found.length, status: "ok" });

            const mode = found.length && found[0].number !== null ? "questões" : "trechos de página";
            console.log(`  + ${doc.title}: ${found.length} ${mode}`);

            if (!found.length) problems.push(`${doc.title}: nenhum texto aproveitável foi encontrado.`);
        } catch (error) {
            indexDocs.push({ id: doc.id, title: doc.title, hash: doc.hash, pages: 0, questions: 0, status: "erro" });
            problems.push(`${doc.title}: falha ao ler o PDF (${error.message})`);
        }
    }

    const linked = await attachAnswers(documents, questions);

    const index = {
        version: 1,
        documents: indexDocs,
        questions
    };

    // `generatedAt` só muda quando o conteúdo muda, para não sujar o git à toa
    const sameContent = JSON.stringify({ ...previous, generatedAt: undefined }) === JSON.stringify(index);
    index.generatedAt = sameContent && previous.generatedAt ? previous.generatedAt : new Date().toISOString();

    writeIfChanged(INDEX_OUT, index);

    console.log(`Índice: ${questions.length} questão(ões) em ${indexDocs.length} prova(s)`);
    console.log(
        `Gabaritos: ${linked.answers} questão(ões) com resposta em ${linked.exams.size} prova(s); ${linked.guides} com guia de respostas`
    );
    problems.forEach((p) => console.warn("  ! " + p));
}

main().catch((error) => {
    console.error("Falha na ingestão:", error);
    process.exit(1);
});
