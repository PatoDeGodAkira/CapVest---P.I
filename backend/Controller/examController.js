const crypto = require("crypto");
const db = require("../DB/database");
const searchService = require("../Services/searchService");
const gamification = require("../Services/gamification");

const query = (sql, values = []) => db.promise().query(sql, values).then(([rows]) => rows);

/** Extrai alternativas em formatos comuns dos PDFs: (A), A), A., A - etc. */
function choicesFromText(text) {
    const source = String(text || "");
    const pattern = /(?:^|\n)\s*\(?([A-E])\)?\s*[).:\-]\s*([\s\S]*?)(?=(?:\n\s*\(?[A-E]\)?\s*[).:\-]\s*)|$)/gm;
    const matches = [...source.matchAll(pattern)];
    const choices = matches.map((match) => ({ letter: match[1].toUpperCase(), text: match[2].replace(/\s+/g, " ").trim() }))
        .filter((item) => item.text.length > 0);
    const unique = new Map();
    for (const choice of choices) if (!unique.has(choice.letter)) unique.set(choice.letter, choice);
    return [...unique.values()].sort((a, b) => a.letter.localeCompare(b.letter));
}

function safeQuestion(question, options = {}) {
    const choices = choicesFromText(question.text);
    const isMultipleChoice = choices.length >= 4 && ["A", "B", "C", "D"].every((letter) => choices.some((choice) => choice.letter === letter));
    const firstChoice = isMultipleChoice ? question.text.search(/(?:^|\n)\s*\(?A\)?\s*[).:\-]\s*/m) : -1;
    const statement = firstChoice > 0 ? question.text.slice(0, firstChoice).trim() : question.text;
    const output = {
        id: question.id,
        number: question.number,
        page: question.page,
        year: question.year,
        docId: question.docId,
        statement,
        context: question.context || null,
        choices: isMultipleChoice ? choices : [],
        type: isMultipleChoice ? "multiple-choice" : "open",
        hasAnswer: Boolean(question.answer?.length || question.annulled),
        sourceTitle: searchService.docTitle(question.docId)
    };
    if (options.includeText) output.fullText = question.text;
    return output;
}

function randomSample(items, count) {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
}

exports.list = (_req, res) => {
    const docs = searchService.listDocuments().filter((doc) => doc.categoryId === "provas");
    res.json({ exams: docs.map((doc) => {
        const extracted = searchService.getQuestionsByDoc(doc.id);
        return { ...doc, questionCount: extracted.filter((question) => question.number !== null && question.number !== undefined).length };
    }) });
};

exports.catalog = (_req, res) => {
    const stats = searchService.stats();
    const pool = searchService.getAllQuestions().filter((q) => q.number !== null && q.number !== undefined);
    const vestibulares = [...new Set(pool.map((q) => q.vestibularId))].map((id) => ({ id, name: id.toUpperCase(), total: pool.filter((q) => q.vestibularId === id).length }));
    const types = pool.reduce((acc, q) => {
        const item = safeQuestion(q);
        acc[item.type] = (acc[item.type] || 0) + 1;
        if (item.type === "multiple-choice" && (q.answer?.length || q.annulled)) acc.multipleChoiceWithKey = (acc.multipleChoiceWithKey || 0) + 1;
        return acc;
    }, {});
    const questionsByYear = [...new Set(pool.map((q) => `${q.vestibularId}:${q.year || ""}`))].map((key) => {
        const [vestibularId, year] = key.split(":");
        return { vestibularId, year: Number(year) || null };
    }).filter((item) => item.year);
    res.json({ ...stats, vestibulares, questionTypes: types, questionsByYear });
};

exports.createSimulation = async (req, res) => {
    try {
        const vestibularId = String(req.body?.vestibular || "").toLowerCase();
        const count = Math.min(90, Math.max(1, Number.parseInt(req.body?.questionCount, 10) || 20));
        const type = ["all", "multiple-choice", "open"].includes(req.body?.type) ? req.body.type : "all";
        const year = req.body?.year ? Number.parseInt(req.body.year, 10) : null;
        if (!vestibularId) return res.status(400).json({ message: "Selecione um vestibular." });
        let pool = searchService.getAllQuestions().filter((q) => q.vestibularId === vestibularId && q.number !== null && q.number !== undefined);
        if (year) pool = pool.filter((q) => Number(q.year) === year);
        if (type === "multiple-choice") pool = pool.filter((q) => safeQuestion(q).type === "multiple-choice" && (q.answer?.length || q.annulled));
        else if (type === "open") pool = pool.filter((q) => safeQuestion(q).type === "open");
        else pool = pool.filter((q) => safeQuestion(q).type === "open" || q.answer?.length || q.annulled);
        if (!pool.length) return res.status(422).json({ message: `Não há questões indexadas para ${vestibularId.toUpperCase()} com esses filtros. O CapVest não cria nem mistura questões de outros vestibulares.` });
        if (pool.length < count) return res.status(422).json({ message: `O banco possui apenas ${pool.length} questões disponíveis nesse filtro. Reduza a quantidade para continuar.`, available: pool.length });
        const selected = randomSample(pool, count);
        const id = crypto.randomUUID();
        const refs = selected.map((q) => q.id);
        const settings = { vestibularId, questionCount: count, type, year, durationMinutes: Math.max(0, Math.min(360, Number(req.body?.durationMinutes) || 0)) };
        await query("INSERT INTO user_simulation_sessions (id, user_id, vestibular_id, question_refs_json, settings_json, started_at) VALUES (?, ?, ?, ?, ?, NOW())", [id, req.user.id, vestibularId, JSON.stringify(refs), JSON.stringify(settings)]);
        return res.status(201).json({ id, settings, questions: selected.map((q) => safeQuestion(q)), available: pool.length });
    } catch (error) {
        console.error("Erro ao criar simulado:", error);
        return res.status(500).json({ message: "Não foi possível montar o simulado. Verifique a configuração do banco de dados." });
    }
};

exports.getSimulation = async (req, res) => {
    try {
        const rows = await query("SELECT * FROM user_simulation_sessions WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (!rows.length) return res.status(404).json({ message: "Simulado não encontrado." });
        const session = rows[0];
        const refs = JSON.parse(session.question_refs_json || "[]");
        const questions = refs.map((id) => searchService.getQuestion(id)).filter(Boolean);
        const saved = session.answers_json ? JSON.parse(session.answers_json) : {};
        return res.json({ id: session.id, settings: JSON.parse(session.settings_json || "{}"), startedAt: session.started_at, submittedAt: session.submitted_at, answers: saved, result: session.result_json ? JSON.parse(session.result_json) : null, questions: questions.map((q) => safeQuestion(q)) });
    } catch (error) {
        console.error("Erro ao recuperar simulado:", error);
        return res.status(500).json({ message: "Não foi possível recuperar o simulado." });
    }
};

exports.saveSimulationAnswers = async (req, res) => {
    try {
        const [session] = await query("SELECT question_refs_json, submitted_at FROM user_simulation_sessions WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (!session) return res.status(404).json({ message: "Simulado não encontrado." });
        if (session.submitted_at) return res.status(409).json({ message: "Este simulado já foi finalizado." });
        const allowed = new Set(JSON.parse(session.question_refs_json || "[]"));
        const incoming = req.body?.answers && typeof req.body.answers === "object" ? req.body.answers : {};
        const safe = {};
        for (const [id, value] of Object.entries(incoming)) {
            if (!allowed.has(id) || !value || typeof value !== "object") continue;
            const question = searchService.getQuestion(id);
            if (!question) continue;
            const normalized = safeQuestion(question);
            if (value.choice) {
                const choice = String(value.choice).toUpperCase().slice(0, 1);
                if (normalized.type === "multiple-choice" && normalized.choices.some((item) => item.letter === choice)) safe[id] = { choice };
            } else if (value.text && normalized.type === "open") safe[id] = { text: String(value.text).slice(0, 20000) };
        }
        await query("UPDATE user_simulation_sessions SET answers_json = ? WHERE id = ? AND user_id = ?", [JSON.stringify(safe), req.params.id, req.user.id]);
        return res.json({ saved: true, savedCount: Object.keys(safe).length });
    } catch (error) {
        console.error("Erro ao salvar rascunho do simulado:", error);
        return res.status(500).json({ message: "Não foi possível salvar suas respostas." });
    }
};

exports.submitSimulation = async (req, res) => {
    try {
        const rows = await query("SELECT * FROM user_simulation_sessions WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (!rows.length) return res.status(404).json({ message: "Simulado não encontrado." });
        const session = rows[0];
        if (session.submitted_at) return res.status(409).json({ message: "Este simulado já foi finalizado.", result: session.result_json ? JSON.parse(session.result_json) : null });
        const refs = JSON.parse(session.question_refs_json || "[]");
        const submitted = req.body?.answers && typeof req.body.answers === "object" ? req.body.answers : {};
        for (const ref of refs) {
            const question = searchService.getQuestion(ref);
            const answer = submitted[ref] || {};
            if (!question) continue;
            const normalized = safeQuestion(question);
            if (normalized.type === "multiple-choice" && answer.choice && !normalized.choices.some((item) => item.letter === String(answer.choice).toUpperCase())) return res.status(400).json({ message: `Alternativa inválida na questão ${normalized.number || ref}.` });
            if (normalized.type === "open" && String(answer.text || "").length > 20000) return res.status(400).json({ message: "Uma das respostas dissertativas ultrapassou 20.000 caracteres." });
        }
        const resultItems = [];
        let correct = 0, wrong = 0, ungraded = 0, xpEarned = 0, openPending = 0;
        for (const ref of refs) {
            const question = searchService.getQuestion(ref);
            if (!question) continue;
            const q = safeQuestion(question);
            const answer = submitted[ref] || {};
            if (q.type === "multiple-choice") {
                const selected = String(answer.choice || "").toUpperCase();
                if (!selected) { resultItems.push({ id: ref, type: q.type, status: "blank" }); continue; }
                if (!q.choices.some((item) => item.letter === selected)) return res.status(400).json({ message: `Alternativa inválida na questão ${q.number || ref}.` });
                if (!question.answer?.length && !question.annulled) {
                    ungraded++;
                    resultItems.push({ id: ref, type: q.type, status: "ungraded", selected });
                    continue;
                }
                const isCorrect = question.annulled ? null : question.answer.includes(selected);
                if (isCorrect === true) correct++; else if (isCorrect === false) wrong++; else ungraded++;
                const progress = await gamification.recordAnswer(req.user.id, ref, selected, isCorrect);
                xpEarned += progress.lastAnswerXp;
                resultItems.push({ id: ref, type: q.type, status: question.annulled ? "annulled" : isCorrect ? "correct" : "wrong", selected, answer: question.answer || [], explanation: question.explanation || null });
            } else {
                const text = String(answer.text || "").trim();
                if (!text) { resultItems.push({ id: ref, type: q.type, status: "blank" }); continue; }
                openPending++;
                await query(`INSERT INTO user_open_question_responses (user_id, question_ref, simulation_id, response_text, review_status, updated_at)
                    VALUES (?, ?, ?, ?, 'pending', NOW())
                    ON DUPLICATE KEY UPDATE response_text = VALUES(response_text), review_status = 'pending', updated_at = NOW()`, [req.user.id, ref, session.id, text]);
                resultItems.push({ id: ref, type: q.type, status: "pending-review", message: "Resposta dissertativa salva. Não há espelho de correção estruturado disponível para atribuir uma nota automática confiável." });
            }
        }
        const answered = resultItems.filter((item) => item.status !== "blank").length;
        const result = { total: refs.length, answered, correct, wrong, ungraded, openPending, blank: refs.length - answered, accuracy: (correct + wrong) ? Math.round(correct / (correct + wrong) * 1000) / 10 : null, xpEarned, results: resultItems };
        await query("UPDATE user_simulation_sessions SET answers_json = ?, result_json = ?, submitted_at = NOW() WHERE id = ? AND user_id = ?", [JSON.stringify(submitted), JSON.stringify(result), session.id, req.user.id]);
        return res.json(result);
    } catch (error) {
        console.error("Erro ao finalizar simulado:", error);
        return res.status(500).json({ message: "Não foi possível finalizar o simulado." });
    }
};

exports.get = (req, res) => {
    const doc = searchService.getDocument(req.params.docId);
    if (!doc || doc.categoryId !== "provas") return res.status(404).json({ message: "Prova não encontrada na biblioteca." });
    const rawQuestions = searchService.getQuestionsByDoc(doc.id);
    const questions = rawQuestions.filter((question) => question.number !== null && question.number !== undefined).map((question) => safeQuestion(question));
    const answerSheetCount = doc.vestibularId === "enem" && !questions.length ? 90 : 0;
    res.json({ exam: doc, questions, questionCount: questions.length || answerSheetCount, answerSheetCount, requiresIndexing: !rawQuestions.length });
};

exports.submit = async (req, res) => {
    const doc = searchService.getDocument(req.params.docId);
    if (!doc || doc.categoryId !== "provas") return res.status(404).json({ message: "Prova não encontrada." });
    const questions = searchService.getQuestionsByDoc(doc.id).filter((question) => question.number !== null && question.number !== undefined);
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const answerMap = new Map(answers.map((answer) => [String(answer.id), answer]));
    if (!questions.length) {
        if (!answers.length) return res.status(400).json({ message: "Marque ao menos uma resposta antes de finalizar." });
        await query("INSERT INTO user_exam_submissions (user_id, document_id, answers_json) VALUES (?, ?, ?)", [req.user.id, doc.id, JSON.stringify(answers)]);
        const total = Number(doc.vestibularId === "enem" ? 90 : answers.length);
        return res.json({ total, answered: answers.length, correct: null, wrong: null, ungraded: answers.length, openPending: 0, blank: Math.max(0, total - answers.length), accuracy: null, xpEarned: 0, needsAnswerKey: true, results: [], message: "Respostas salvas. Esta prova ainda não possui questões indexadas para correção automática." });
    }
    const results = [];
    let correct = 0, wrong = 0, ungraded = 0, openPending = 0, xp = 0;
    for (const question of questions) {
        const q = safeQuestion(question);
        const submitted = answerMap.get(question.id) || {};
        if (q.type === "multiple-choice") {
            const choice = String(submitted.choice || "").toUpperCase();
            if (!choice) { results.push({ id: question.id, status: "blank" }); continue; }
            if (!q.choices.some((item) => item.letter === choice)) return res.status(400).json({ message: `Alternativa inválida na questão ${q.number || question.id}.` });
            if (!question.answer?.length && !question.annulled) { ungraded++; results.push({ id: question.id, status: "ungraded", selected: choice }); continue; }
            const isCorrect = question.annulled ? null : question.answer.includes(choice);
            if (isCorrect === true) correct++; else if (isCorrect === false) wrong++; else ungraded++;
            const progress = await gamification.recordAnswer(req.user.id, question.id, choice, isCorrect);
            xp += progress.lastAnswerXp;
            results.push({ id: question.id, status: question.annulled ? "annulled" : isCorrect ? "correct" : "wrong", selected: choice, answer: question.answer || [], explanation: question.explanation || null });
        } else {
            const text = String(submitted.text || "").trim();
            if (!text) { results.push({ id: question.id, status: "blank" }); continue; }
            if (text.length > 20000) return res.status(400).json({ message: "Uma das respostas dissertativas ultrapassou 20.000 caracteres." });
            openPending++;
            await query(`INSERT INTO user_open_question_responses (user_id, question_ref, simulation_id, response_text, review_status, updated_at)
              VALUES (?, ?, NULL, ?, 'pending', NOW())`, [req.user.id, question.id, text]);
            results.push({ id: question.id, status: "pending-review", message: "Resposta registrada; solicite uma devolutiva formativa por IA quando houver chave configurada." });
        }
    }
    const answered = results.filter((item) => item.status !== "blank").length;
    await query("INSERT INTO user_exam_submissions (user_id, document_id, answers_json) VALUES (?, ?, ?)", [req.user.id, doc.id, JSON.stringify(answers)]);
    return res.json({ total: questions.length, answered, correct, wrong, ungraded, openPending, blank: questions.length - answered, accuracy: (correct + wrong) ? Math.round(correct / (correct + wrong) * 1000) / 10 : null, xpEarned: xp, results });
};

exports.answerOpen = async (req, res) => {
    try {
        const { id, text, simulationId } = req.body || {};
        const question = searchService.getQuestion(String(id || ""));
        if (!question) return res.status(404).json({ message: "Questão não encontrada." });
        if (safeQuestion(question).type !== "open") return res.status(422).json({ message: "Esta questão possui alternativas; utilize a correção objetiva." });
        const responseText = String(text || "").trim();
        if (responseText.length < 10) return res.status(400).json({ message: "Escreva uma resposta com pelo menos 10 caracteres." });
        if (responseText.length > 20000) return res.status(400).json({ message: "A resposta ultrapassou o limite de 20.000 caracteres." });
        if (simulationId) {
            const [session] = await query("SELECT id FROM user_simulation_sessions WHERE id = ? AND user_id = ?", [simulationId, req.user.id]);
            if (!session) return res.status(404).json({ message: "Simulado não encontrado." });
        }
        await query(`INSERT INTO user_open_question_responses (user_id, question_ref, simulation_id, response_text, review_status, updated_at)
          VALUES (?, ?, ?, ?, 'pending', NOW())
          ON DUPLICATE KEY UPDATE response_text=VALUES(response_text), review_status='pending', updated_at=NOW()`, [req.user.id, question.id, simulationId || null, responseText]);
        return res.status(201).json({ message: "Resposta dissertativa salva.", status: "pending-review", correctionAvailable: false, explanation: "O acervo atual não possui espelho de correção estruturado para esta questão. Por isso, a plataforma registra sua resposta, mas não inventa uma nota." });
    } catch (error) {
        console.error("Erro ao salvar resposta dissertativa:", error);
        return res.status(500).json({ message: "Não foi possível salvar sua resposta." });
    }
};

exports.reviewOpenAnswer = async (req, res) => {
    try {
        const ai = require("../Services/aiService");
        if (!ai.isEnabled()) return res.status(503).json({ message: "A correção formativa por IA ainda não está configurada. Adicione GEMINI_API_KEY ou ANTHROPIC_API_KEY ao backend/.env." });
        const { id, simulationId } = req.body || {};
        const question = searchService.getQuestion(String(id || ""));
        if (!question || safeQuestion(question).type !== "open") return res.status(404).json({ message: "Questão dissertativa não encontrada." });
        const params = simulationId ? [req.user.id, question.id, simulationId] : [req.user.id, question.id];
        const sql = simulationId
            ? "SELECT * FROM user_open_question_responses WHERE user_id = ? AND question_ref = ? AND simulation_id = ? ORDER BY updated_at DESC LIMIT 1"
            : "SELECT * FROM user_open_question_responses WHERE user_id = ? AND question_ref = ? AND simulation_id IS NULL ORDER BY updated_at DESC LIMIT 1";
        const [saved] = await query(sql, params);
        if (!saved) return res.status(404).json({ message: "Salve sua resposta antes de solicitar a revisão." });
        const review = await ai.reviewOpenResponse({ questionText: question.text, answerText: saved.response_text, vestibular: question.vestibularId, year: question.year });
        await query("UPDATE user_open_question_responses SET reviewer_feedback = ?, review_status = 'ai-reviewed', updated_at = NOW() WHERE id = ? AND user_id = ?", [JSON.stringify(review), saved.id, req.user.id]);
        return res.json({ review, status: "ai-reviewed" });
    } catch (error) {
        console.error("Erro na revisão da resposta dissertativa:", error);
        return res.status(502).json({ message: "Não foi possível revisar a resposta agora. Tente novamente mais tarde." });
    }
};

exports.answer = async (req, res) => {
    const { id, choice } = req.body || {};
    const question = searchService.getQuestion(String(id || ""));
    if (!question) return res.status(404).json({ message: "Questão não encontrada." });
    const q = safeQuestion(question);
    if (q.type !== "multiple-choice") return res.status(422).json({ message: "Esta é uma questão dissertativa. Escreva sua resposta para salvá-la; não há correção objetiva cadastrada." });
    const selected = String(choice || "").toUpperCase();
    if (!/^[A-E]$/.test(selected) || !q.choices.some((item) => item.letter === selected)) return res.status(400).json({ message: "Selecione uma alternativa disponível nesta questão." });
    if (!question.answer?.length && !question.annulled) {
        await query("INSERT INTO user_question_attempts (user_id, question_ref, selected_choice, is_correct, xp_earned) VALUES (?, ?, ?, NULL, 0)", [req.user.id, question.id, selected]);
        return res.json({ correct: null, answer: [], needsAnswerKey: true, xpEarned: 0, message: "Resposta registrada. O gabarito desta questão ainda não está disponível no acervo." });
    }
    const correct = question.annulled ? null : question.answer.includes(selected);
    const progress = await gamification.recordAnswer(req.user.id, question.id, selected, correct);
    res.json({ correct, answer: question.answer || [], annulled: Boolean(question.annulled), xpEarned: progress.lastAnswerXp, explanation: question.explanation || null, progress });
};
