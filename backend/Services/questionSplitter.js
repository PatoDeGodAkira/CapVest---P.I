const MAX_QUESTION_CHARS = 4000;
const MAX_CONTEXT_CHARS = 1800;
const MIN_QUESTION_CHARS = 40;
const MIN_MARKS = 5; // abaixo disso a estratégia não é confiável

/** Linhas que encerram uma questão (áreas da prova, rascunho, quadro de resposta...). */
const SECTION_BREAK = new RegExp(
    "^\\s*(" +
        [
            "RASCUNHO",
            "QUADRO DESTINADO",
            "Caderno Reserva",
            "[ÁA]rea Reservada",
            "N[ãa]o escreva no topo",
            "LINGUAGENS,? C[ÓO]DIGOS",
            "MATEM[ÁA]TICA E SUAS",
            "CI[ÊE]NCIAS (DA NATUREZA|HUMANAS) E SUAS",
            "REDA[ÇC][ÃA]O\\b",
            "Quest[õo]es de \\d+ a \\d+"
        ].join("|") +
        ")",
    "im"
);

/** "TEXTO PARA AS QUESTÕES 04 E 05" — texto de apoio usado por mais de uma questão. */
const SHARED_HEADER = /^[ \t]*TEXTOS?[ \t]+PARA[ \t]+(?:AS?[ \t]+)?QUEST(?:ÕES|OES|ÃO|AO)[ \t]+([^\n]+)$/gim;

/** Formatos de marcador, do mais confiável para o menos. `chain`: números devem crescer em sequência. */
const STRATEGIES = [
    { name: "questao", re: /^[ \t]*QUEST[ÃA]O[ \t]+(\d{1,3})\b/gim, chain: false }, // QUESTÃO 12 (ENEM, UNICAMP...)
    { name: "codigo", re: /^[ \t]*([A-Z])(\d{2})[ \t]*$/gm, chain: true, grouped: true }, // M01 (FUVEST 2ª fase, dia 2)
    { name: "chaves", re: /^[ \t]*\{(\d{1,3})\}[ \t]*$/gm, chain: true }, // {05} (FUVEST 2025+)
    { name: "numero", re: /^[ \t]*(\d{2})[ \t]*$/gm, chain: true }, // 05 sozinho na linha (FUVEST 1ª fase)
    { name: "ponto", re: /^[ \t]*(\d{1,3})[ \t]*[.)\-–—](?:[ \t]+(?=\p{Lu})|[ \t]*$)/gmu, chain: true } // 12.  12)  12 -
];

/**
 * Remove cabeçalhos e rodapés repetidos (ex.: "CADERNO 1 - AZUL"), que poluem a busca.
 * Só atua em provas com 4+ páginas e nunca em linhas sem texto (números de questão).
 */
function cleanPages(pages) {
    if (pages.length < 4) return pages;

    const norm = (line) => line.replace(/\d+/g, "#").trim().toLowerCase();
    const counts = new Map();

    for (const page of pages) {
        for (const key of new Set(page.split("\n").map(norm))) {
            counts.set(key, (counts.get(key) || 0) + 1);
        }
    }

    const limit = pages.length * 0.6;

    return pages.map((page) =>
        page
            .split("\n")
            .filter((line) => {
                const key = norm(line);
                const hasText = (line.match(/\p{L}/gu) || []).length >= 4;
                return !(hasText && line.length < 90 && counts.get(key) >= limit);
            })
            .join("\n")
    );
}

/**
 * Entre os candidatos, escolhe a maior sequência crescente (passos de 1 a `maxGap`).
 * Isso ignora números soltos de figuras e gráficos que não pertencem à numeração.
 */
function longestChain(marks, maxGap = 6) {
    const best = [];
    const prev = [];

    for (let i = 0; i < marks.length; i++) {
        best[i] = marks[i].n <= 3 ? 1 : 0;
        prev[i] = -1;

        for (let j = 0; j < i; j++) {
            const step = marks[i].n - marks[j].n;
            if (best[j] && step >= 1 && step <= maxGap && best[j] + 1 > best[i]) {
                best[i] = best[j] + 1;
                prev[i] = j;
            }
        }
    }

    let end = -1;
    best.forEach((len, i) => {
        if (len && (end === -1 || len > best[end])) end = i;
    });

    const chain = [];
    for (let i = end; i !== -1; i = prev[i]) chain.unshift(marks[i]);
    return chain;
}

function findMarks(text, strategy) {
    const raw = [];

    for (const m of text.matchAll(strategy.re)) {
        const n = Number(strategy.grouped ? m[2] : m[1]);
        raw.push({
            n,
            label: strategy.grouped ? m[1] + m[2] : null,
            group: strategy.grouped ? m[1] : "",
            index: m.index,
            end: m.index + m[0].length
        });
    }

    if (!strategy.chain) return raw;

    const groups = new Map();
    raw.forEach((mark) => groups.set(mark.group, [...(groups.get(mark.group) || []), mark]));

    return [...groups.values()]
        .flatMap((list) => longestChain(list))
        .sort((a, b) => a.index - b.index);
}

function parseQuestionNumbers(line) {
    const nums = (line.match(/\d+/g) || []).map(Number);
    if (nums.length === 2 && /\d\s+A\s+\d/i.test(line)) {
        return Array.from({ length: nums[1] - nums[0] + 1 }, (_, i) => nums[0] + i);
    }
    return nums;
}

const tidy = (text) => text.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();

/**
 * pages: string[] (texto de cada página)
 * Retorna [{ number, page, text, context }]. `page` é onde a questão começa (1-based);
 * `number` pode ser número (12) ou código ("M01"); `context` é texto de apoio compartilhado.
 */
function splitQuestions(rawPages) {
    const pages = cleanPages(rawPages);

    let full = "";
    const pageStarts = [];
    pages.forEach((text) => {
        pageStarts.push(full.length);
        full += text + "\n";
    });

    const pageOf = (pos) => {
        let lo = 0;
        let hi = pageStarts.length - 1;
        while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            if (pageStarts[mid] <= pos) lo = mid;
            else hi = mid - 1;
        }
        return lo + 1;
    };

    const build = ({ strategy, marks }) => {
        const numeric = !strategy.grouped;

        // cabeçalhos de texto de apoio entram como "quebras" para não poluir a questão anterior
        const shared = [];
        if (numeric) {
            for (const m of full.matchAll(SHARED_HEADER)) {
                shared.push({ index: m.index, end: m.index + m[0].length, numbers: parseQuestionNumbers(m[1]) });
            }
        }

        const breaks = [...marks.map((m) => m.index), ...shared.map((s) => s.index)].sort((a, b) => a - b);
        const nextBreak = (pos) => breaks.find((b) => b > pos) ?? full.length;

        const contextByNumber = new Map();
        for (const sh of shared) {
            const body = tidy(full.slice(sh.end, nextBreak(sh.index)));
            if (body.length < 20) continue;
            for (const n of sh.numbers) {
                contextByNumber.set(n, [...(contextByNumber.get(n) || []), body.slice(0, MAX_CONTEXT_CHARS)]);
            }
        }

        return marks
            .map((mark) => {
                let text = full.slice(mark.end, nextBreak(mark.index));

                const brk = text.search(SECTION_BREAK);
                if (brk !== -1) text = text.slice(0, brk);

                const context = (contextByNumber.get(mark.n) || []).join("\n\n");

                return {
                    n: mark.n,
                    number: mark.label || mark.n,
                    page: pageOf(mark.index),
                    text: tidy(text).slice(0, MAX_QUESTION_CHARS),
                    ...(context && !mark.label ? { context } : {})
                };
            })
            .filter((q) => q.text.length >= MIN_QUESTION_CHARS);
    };

    /**
     * Achar rótulos não basta: na 2ª fase da FUVEST, por exemplo, "Questão 01" aparece só nas
     * folhas de resposta. Só aceitamos a estratégia se o resultado parecer mesmo uma lista de questões.
     */
    const plausible = (strategy, questions) => {
        if (questions.length < MIN_MARKS) return false;

        const lens = questions.map((q) => q.text.length).sort((a, b) => a - b);
        if (lens[Math.floor(lens.length / 2)] < 120) return false;

        const covered = questions.reduce((n, q) => n + q.text.length, 0);
        if (covered < full.length * 0.3) return false;

        if (!strategy.grouped) {
            const nums = questions.map((q) => q.n);
            const span = Math.max(...nums) - Math.min(...nums) + 1;
            if (questions.length / span < 0.7) return false; // buracos demais na numeração
        }

        return true;
    };

    for (const candidate of STRATEGIES.map((s) => ({ strategy: s, marks: findMarks(full, s) }))) {
        if (candidate.marks.length < MIN_MARKS) continue;

        const questions = build(candidate);

        if (plausible(candidate.strategy, questions)) {
            return questions.map(({ n, ...rest }) => rest); // eslint-disable-line no-unused-vars
        }
    }

    // Sem marcação reconhecível: indexa página por página (a busca ainda abre a página certa).
    return pages
        .map((text, i) => ({ number: null, page: i + 1, text: tidy(text).slice(0, MAX_QUESTION_CHARS) }))
        .filter((q) => q.text.length >= 200);
}

module.exports = { splitQuestions, cleanPages };
