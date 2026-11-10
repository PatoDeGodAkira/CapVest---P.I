const searchService = require("../Services/searchService");
const ai = require("../Services/aiService");

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function present(hit) {
    const q = hit.question;
    return {
        id: q.id,
        docId: q.docId,
        docTitle: searchService.docTitle(q.docId),
        file: searchService.getDocument(q.docId)?.file || null,
        vestibularId: q.vestibularId,
        vestibular: q.vestibularId.toUpperCase(),
        year: q.year,
        number: q.number,
        page: q.page,
        text: q.text,
        context: q.context || null,
        hasAnswer: Boolean(q.answer?.length || q.annulled), // a resposta em si só sai em /check
        questionType: (() => {
            const pattern = /(?:^|\n)\s*\(?([A-E])\)?\s*[).:\-]\s*([\s\S]*?)(?=(?:\n\s*\(?[A-E]\)?\s*[).:\-]\s*)|$)/gm;
            const found = [...String(q.text || "").matchAll(pattern)].map((match) => match[1].toUpperCase());
            return found.length >= 4 && ["A", "B", "C", "D"].every((letter) => found.includes(letter)) ? "multiple-choice" : "open";
        })(),
        guideDoc: q.guide || null,
        score: Math.round(hit.score * 100) / 100
    };
}

exports.status = (req, res) => {
    const stats = searchService.stats();
    res.json({ ready: stats.questions > 0, ai: ai.isEnabled(), ...stats });
};

exports.search = async (req, res) => {
    const query = String(req.query.q || "").trim();

    if (query.length < 2 || query.length > 120) {
        return res.status(400).json({ message: "Digite um tema com 2 a 120 caracteres." });
    }

    const vest = String(req.query.vestibular || "todos").toLowerCase();
    const vestibularId = vest === "todos" ? null : vest;
    const limit = clamp(parseInt(req.query.limit, 10) || 8, 1, 20);

    const stats = searchService.stats();

    if (!stats.questions) {
        return res.json({ query, ready: false, aiUsed: false, expanded: [], total: 0, results: [] });
    }

    const aiOn = ai.isEnabled();
    const cacheKey = [query.toLowerCase(), vestibularId, limit, aiOn, stats.generatedAt].join("|");
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return res.json(cached.payload);

    let degraded = false;
    let expanded = [];

    if (aiOn) {
        try {
            expanded = await ai.expandTheme(query);
        } catch (error) {
            degraded = true;
            console.warn("[capy] falha ao expandir o tema:", error.message);
        }
    }

    const hits = searchService.search({
        terms: [{ text: query, weight: 1 }, ...expanded.map((text) => ({ text, weight: 0.5 }))],
        phrase: query,
        vestibularId,
        limit: aiOn ? 20 : limit,
        strict: !aiOn || !expanded.length // sem a ajuda da IA, não mostra resultado só "parecido"
    });

    let selected = hits.slice(0, limit).map((hit) => ({ hit, reason: null }));
    let aiUsed = false;

    if (aiOn && hits.length) {
        try {
            const candidates = hits.map((h) => ({ ...present(h), text: h.question.text }));
            const picked = await ai.pickRelevant(query, candidates, limit);
            const byId = new Map(hits.map((h) => [h.question.id, h]));

            selected = picked.map((p) => ({ hit: byId.get(p.id), reason: p.reason }));
            aiUsed = true;
        } catch (error) {
            degraded = true;
            console.warn("[capy] falha ao selecionar questões:", error.message);
        }
    }

    const terms = [query, ...expanded];

    const results = selected.map(({ hit, reason }) => ({
        ...present(hit),
        snippet: searchService.makeSnippet(hit.question.text, terms),
        reason
    }));

    const payload = { query, ready: true, aiUsed, expanded, total: results.length, results };

    if (!degraded) cache.set(cacheKey, { at: Date.now(), payload });

    res.json(payload);
};

/**
 * Confere a alternativa marcada pelo aluno. A resposta certa só é revelada aqui,
 * depois que ele escolhe, e não junto com os resultados da busca.
 */
exports.check = (req, res) => {
    const { id, choice } = req.body || {};
    const pick = String(choice || "").toUpperCase();

    if (!/^[A-E]$/.test(pick)) {
        return res.status(400).json({ message: "Escolha uma alternativa de A a E." });
    }

    const question = searchService.getQuestion(String(id || ""));

    if (!question || !(question.answer?.length || question.annulled)) {
        return res.status(404).json({ message: "Esta questão ainda não tem gabarito na biblioteca." });
    }

    const choicePattern = /(?:^|\n)\s*\(?([A-E])\)?\s*[).:\-]\s*([\s\S]*?)(?=(?:\n\s*\(?[A-E]\)?\s*[).:\-]\s*)|$)/gm;
    const letters = new Set([...String(question.text || "").matchAll(choicePattern)].map((match) => match[1].toUpperCase()));
    if (letters.size < 4 || !["A", "B", "C", "D"].every((letter) => letters.has(letter))) {
        return res.status(422).json({ message: "Esta questão é dissertativa; utilize o campo de resposta aberta." });
    }
    if (!letters.has(pick)) return res.status(400).json({ message: "A alternativa selecionada não existe nesta questão." });
    const correct = question.annulled ? null : question.answer.includes(pick);
    const gamification = require("../Services/gamification");
    gamification.recordAnswer(req.user.id, question.id, pick, correct)
        .then((progress) => res.json({ annulled: Boolean(question.annulled), answer: question.answer || [], correct, xpEarned: progress.lastAnswerXp, progress, gabaritoDocId: question.answerDoc || null }))
        .catch((error) => { console.error("[capy-check]", error); res.status(503).json({ message: "Resposta conferida, mas não foi possível salvar seu progresso." }); });
};
