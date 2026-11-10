/**
 * Lê o gabarito da 1ª fase da FUVEST: tabelas com as versões da prova lado a lado
 * (V, K, Q ou V1, V2), cada uma com duas colunas (questões 1–45 e 46–90).
 * Usamos só o primeiro bloco de cada linha, que é a versão que está na biblioteca (V / V1).
 *
 * "*" = questão anulada; "D E" = mais de uma alternativa aceita.
 */
const COLUMN_OFFSET = 45;
const ANSWER = "(?:[A-E](?: [A-E])?|\\*)";
const ROW = new RegExp(`^\\s*(\\d{1,2}) (${ANSWER}) (\\d{2}) (${ANSWER})(?=\\s|$)`);

/** Retorna Map<número, { answer: ["C"] } | { annulled: true }> ou null se não parecer um gabarito. */
function parseAnswerKey(pages) {
    const key = new Map();

    for (const line of pages.join("\n").split("\n")) {
        const m = line.replace(/\s+/g, " ").match(ROW);
        if (!m) continue;

        const left = Number(m[1]);
        const right = Number(m[3]);
        if (left < 1 || left > COLUMN_OFFSET || right !== left + COLUMN_OFFSET) continue;

        for (const [number, raw] of [[left, m[2]], [right, m[4]]]) {
            if (key.has(number)) continue; // o primeiro bloco da linha é o que vale
            key.set(number, raw === "*" ? { annulled: true } : { answer: raw.split(" ") });
        }
    }

    return key.size >= 60 ? key : null;
}

module.exports = { parseAnswerKey };
