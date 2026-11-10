const fs = require("fs");

const LINE_TOLERANCE = 3; // diferença máxima de Y (em pontos) para considerar a mesma linha

function tokensToLines(tokens) {
    const sorted = [...tokens].sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];

    for (const t of sorted) {
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.y - t.y) <= LINE_TOLERANCE) last.items.push(t);
        else lines.push({ y: t.y, items: [t] });
    }

    return lines.map((line) => {
        const items = line.items.sort((a, b) => a.x - b.x);
        let text = "";
        let prevEnd = null;

        for (const t of items) {
            const needsSpace =
                prevEnd !== null && t.x - prevEnd > 1.2 && !text.endsWith(" ") && !t.s.startsWith(" ");
            text += (needsSpace ? " " : "") + t.s;
            prevEnd = t.x + t.w;
        }

        return text.replace(/\s+/g, " ").trim();
    });
}

/**
 * Converte os itens de texto de uma página em string.
 * Provas como o ENEM usam duas colunas: lemos a coluna esquerda inteira
 * e depois a direita, senão as linhas das duas colunas se misturam.
 */
function pageToText(items, pageWidth) {
    // fórmulas de fontes antigas viram caracteres de controle ou de alfabetos aleatórios (sírio, indianos...);
    // "¬" é usado no lugar de espaço em algumas provas
    // eslint-disable-next-line no-control-regex
    const clean = (str) => str.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ue000-\uf8ff\u00ac\u0590-\u08ff\u0900-\u0dff]/g, " ");

    const tokens = items
        .map((i) => ({ s: clean(i.str || ""), x: i.transform[4], y: i.transform[5], w: i.width || 0 }))
        .filter((t) => t.s.trim());

    if (!tokens.length) return "";

    const mid = pageWidth / 2;
    const left = tokens.filter((t) => t.x + t.w / 2 < mid);
    const right = tokens.filter((t) => t.x + t.w / 2 >= mid);
    const crossing = tokens.filter((t) => t.x < mid - 6 && t.x + t.w > mid + 6).length;

    const twoColumns = left.length > 8 && right.length > 8 && crossing <= tokens.length * 0.03;

    const lines = twoColumns
        ? [...tokensToLines(left), ...tokensToLines(right)]
        : tokensToLines(tokens);

    // junta palavras hifenizadas na quebra de linha: "revo-\nlução" -> "revolução"
    return lines.join("\n").replace(/(\p{L})-\n(\p{Ll})/gu, "$1$2");
}

/** Lê um PDF e devolve um array com o texto de cada página. */
async function extractPages(filePath) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(fs.readFileSync(filePath));

    const task = pdfjs.getDocument({
        data,
        useSystemFonts: true,
        disableFontFace: true,
        verbosity: 0
    });
    const pdf = await task.promise;

    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { width } = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();

        pages.push(pageToText(content.items, width));
        page.cleanup();
    }

    await task.destroy();
    return pages;
}

module.exports = { extractPages, pageToText };
