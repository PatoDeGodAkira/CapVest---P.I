const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** Categorias aceitas (nome da pasta -> rótulo singular usado no título). */
const CATEGORIES = {
    provas: "Prova",
    gabaritos: "Gabarito",
    editais: "Edital",
    manuais: "Manual"
};

const slugify = (text) =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

/** Palavra da própria categoria já aparece no começo do título ("Prova FUVEST..."): não repete no complemento. */
const CATEGORY_WORDS = {
    provas: ["prova", "provas"],
    gabaritos: ["gabarito", "gabaritos"],
    editais: ["edital", "editais"],
    manuais: ["manual", "manuais"]
};

const ACCENTS = {
    fisica: "Física",
    historia: "História",
    matematica: "Matemática",
    quimica: "Química",
    versao: "Versão",
    portugues: "Português",
    ingles: "Inglês"
};

/**
 * Transforma o que sobra do nome do arquivo em um complemento legível.
 * "fuv2018_2fase_dia_1" -> "2ª Fase Dia 1"; "primeira_fase_prova_V" -> "1ª Fase Tipo V"
 */
function prettifySuffix(raw, vestibularId, categoryId) {
    let s = raw
        .replace(/([a-zà-ú])([A-Z])/g, "$1 $2") // ManualCandidato -> Manual Candidato
        .toLowerCase()
        .replace(/manualdo/g, "manual do")
        .replace(/primeira[\s_.-]*fase|1[\s_.-]*[ªa]?[\s_.-]*fase|fase[\s_.-]*1\b/g, " §f1§ ")
        .replace(/segunda[\s_.-]*fase|2[\s_.-]*[ªa]?[\s_.-]*fase|fase[\s_.-]*2\b/g, " §f2§ ")
        .replace(/(\d)[\s_.-]*dia(?![a-z])|(?<![a-z])dia[\s_.-]*(\d)/g, (m, a, b) => ` §d${a || b}§ `);

    const tokens = s
        .split(/[\s_.-]+/)
        .filter(Boolean)
        // tira o nome do vestibular e abreviações ("fuv", "fuvest") e palavras já presentes no tipo do documento
        .filter((t) => !(t.length >= 3 && vestibularId.startsWith(t)) && t !== vestibularId)
        .filter((t) => !CATEGORY_WORDS[categoryId].includes(t))
        .map((t, i, all) => {
            if (/^§f\d§$/.test(t)) return `${t[2]}ª Fase`;
            if (/^§d\d§$/.test(t)) return `Dia ${t[2]}`;
            if (t.length === 1 && /[a-z]/.test(t) && all[i - 1] !== "tipo") return `Tipo ${t.toUpperCase()}`;
            return ACCENTS[t] || t.charAt(0).toUpperCase() + t.slice(1);
        });

    return tokens.join(" ");
}

/** Monta título e ano. O ano vem da pasta (Provas/2016/...) ou, se não houver, do nome do arquivo. */
function describeFile(vestibularId, categoryId, fileName, folderYear) {
    const base = fileName.replace(/\.pdf$/i, "");
    const yearMatch = base.match(/(?:19|20)\d{2}/);
    const year = folderYear || (yearMatch ? Number(yearMatch[0]) : null);

    if (!year) return null;

    const leftover = base
        .replace(/\d{4}[-_.]\d{2}[-_.]\d{2}|\d{8}/g, " ") // datas: 2023-11-24, 29092022
        .replace(/(?:19|20)\d{2}/g, " ");

    const suffix = prettifySuffix(leftover, vestibularId, categoryId);

    return {
        year,
        title: `${CATEGORIES[categoryId]} ${vestibularId.toUpperCase()} ${year}${suffix ? ` · ${suffix}` : ""}`
    };
}

const listDirs = (dir) =>
    fs.existsSync(dir)
        ? fs
              .readdirSync(dir, { withFileTypes: true })
              .filter((e) => e.isDirectory())
              .map((e) => e.name)
              .sort()
        : [];

/** Lista os PDFs de uma categoria; aceita subpastas de ano (provas/2016/arquivo.pdf). */
function listPdfs(catDir, warn) {
    const found = [];

    for (const entry of fs.readdirSync(catDir, { withFileTypes: true })) {
        if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
            found.push({ fileName: entry.name, folderYear: null, subDir: "" });
        } else if (entry.isDirectory() && /^(19|20)\d{2}$/.test(entry.name)) {
            const dir = path.join(catDir, entry.name);
            for (const f of fs.readdirSync(dir).filter((n) => /\.pdf$/i.test(n))) {
                found.push({ fileName: f, folderYear: Number(entry.name), subDir: entry.name });
            }
        } else if (entry.isDirectory()) {
            warn(`Pasta ignorada: ${path.basename(catDir)}/${entry.name} (subpastas devem ser anos, ex.: 2023)`);
        }
    }

    return found.sort((a, b) => (a.subDir + a.fileName).localeCompare(b.subDir + b.fileName));
}

/**
 * Varre <docsDir>/<vestibular>/<categoria>/[<ano>/]<arquivo>.pdf
 * Retorna { documents, warnings }. Cada documento inclui `absPath` e `hash`
 * (usados só na indexação; o site recebe a versão sem esses campos).
 */
function scanLibrary(docsDir) {
    const documents = [];
    const warnings = [];

    for (const vestDirName of listDirs(docsDir)) {
        const vestibularId = vestDirName.toLowerCase();
        const vestDir = path.join(docsDir, vestDirName);

        for (const catDirName of listDirs(vestDir)) {
            const categoryId = catDirName.toLowerCase();

            if (!CATEGORIES[categoryId]) {
                warnings.push(
                    `Pasta ignorada: ${vestDirName}/${catDirName} (use: ${Object.keys(CATEGORIES).join(", ")})`
                );
                continue;
            }

            const catDir = path.join(vestDir, catDirName);

            for (const { fileName, folderYear, subDir } of listPdfs(catDir, (w) => warnings.push(w))) {
                const info = describeFile(vestibularId, categoryId, fileName, folderYear);
                const relPath = [vestDirName, catDirName, subDir, fileName].filter(Boolean).join("/");

                if (!info) {
                    warnings.push(`Ignorado: ${relPath} — coloque o ano no nome ou numa pasta de ano (ex.: 2023/)`);
                    continue;
                }

                const absPath = path.join(docsDir, relPath);

                documents.push({
                    id: slugify(relPath.replace(/\.pdf$/i, "")),
                    vestibularId,
                    categoryId,
                    title: info.title,
                    year: info.year,
                    file: "/documents/" + relPath.split("/").map(encodeURIComponent).join("/"),
                    absPath,
                    hash: crypto.createHash("sha1").update(fs.readFileSync(absPath)).digest("hex")
                });
            }
        }
    }

    // ids repetidos (ex.: "Prova 2023.pdf" e "prova-2023.pdf") quebrariam a busca
    const seen = new Set();
    return {
        documents: documents.filter((d) => {
            if (seen.has(d.id)) {
                warnings.push(`Ignorado (nome duplicado): ${d.file}`);
                return false;
            }
            seen.add(d.id);
            return true;
        }),
        warnings
    };
}

/** Versão pública (sem caminhos locais) que vai para src/data/library.json. */
const toPublic = ({ id, vestibularId, categoryId, title, year, file }) => ({
    id,
    vestibularId,
    categoryId,
    title,
    year,
    file
});

module.exports = { CATEGORIES, scanLibrary, toPublic, slugify };
