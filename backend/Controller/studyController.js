const db = require("../DB/database");
const query = (sql, values = []) => db.promise().query(sql, values).then(([rows]) => rows);
const DAYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function normalizeSubjects(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => ({
        name: String(item.name || "").trim().slice(0, 100),
        priority: ["high", "normal", "low"].includes(item.priority) ? item.priority : "normal",
        weeklyMinutes: Math.max(30, Math.min(1200, Number(item.weeklyMinutes) || 120)),
        topics: Array.isArray(item.topics) ? item.topics.map((topic) => String(topic).trim().slice(0, 120)).filter(Boolean).slice(0, 20) : []
    })).filter((item) => item.name).slice(0, 20);
}

exports.getPlan = async (req, res) => {
    try {
        const plans = await query("SELECT * FROM user_study_plans WHERE user_id = ? LIMIT 1", [req.user.id]);
        if (!plans.length) return res.json({ plan: null, tasks: [] });
        const plan = plans[0];
        const tasks = await query("SELECT * FROM user_study_tasks WHERE user_id = ? AND plan_id = ? ORDER BY task_date, priority DESC, id", [req.user.id, plan.id]);
        res.json({ plan: { ...plan, availability: JSON.parse(plan.availability_json || "{}"), subjects: JSON.parse(plan.subjects_json || "[]") }, tasks });
    } catch (error) {
        console.error("[study/getPlan]", error);
        res.status(500).json({ message: "Não foi possível carregar seu cronograma." });
    }
};

exports.savePlan = async (req, res) => {
    try {
        const body = req.body || {};
        const title = String(body.title || "Meu plano de estudos").trim().slice(0, 180);
        const targetExam = String(body.targetExam || "").trim().toLowerCase();
        const targetCourse = String(body.targetCourse || "").trim().slice(0, 180);
        const targetDate = body.targetDate ? String(body.targetDate).slice(0, 10) : null;
        const weeklyHours = Math.max(1, Math.min(60, Number(body.weeklyHours) || 10));
        const rawAvailability = body.availability && typeof body.availability === "object" ? body.availability : {};
        const availability = Object.fromEntries(DAYS.map((day) => [day, Math.max(0, Math.min(480, Number(rawAvailability[day]) || 0))]));
        const subjects = normalizeSubjects(body.subjects);
        if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return res.status(400).json({ message: "Informe uma data de prova válida." });
        if (!targetExam) return res.status(400).json({ message: "Informe o vestibular que deseja prestar." });
        if (!subjects.length) return res.status(400).json({ message: "Adicione ao menos uma matéria ao seu plano." });
        const days = DAYS.filter((day) => availability[day] > 0);
        if (!days.length) return res.status(400).json({ message: "Informe ao menos um dia com minutos disponíveis para estudar." });
        await query(`INSERT INTO user_study_plans (user_id, title, target_exam, target_course, target_date, weekly_hours, availability_json, subjects_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE title=VALUES(title), target_exam=VALUES(target_exam), target_course=VALUES(target_course), target_date=VALUES(target_date), weekly_hours=VALUES(weekly_hours), availability_json=VALUES(availability_json), subjects_json=VALUES(subjects_json), updated_at=NOW()`,
          [req.user.id, title, targetExam, targetCourse || null, targetDate, weeklyHours, JSON.stringify(availability), JSON.stringify(subjects)]);
        const [plan] = await query("SELECT * FROM user_study_plans WHERE user_id = ? LIMIT 1", [req.user.id]);
        res.json({ message: "Objetivo e disponibilidade salvos.", plan: { ...plan, availability, subjects } });
    } catch (error) {
        console.error("[study/savePlan]", error);
        res.status(500).json({ message: "Não foi possível salvar seu plano." });
    }
};

exports.generateTasks = async (req, res) => {
    try {
        const [plan] = await query("SELECT * FROM user_study_plans WHERE user_id = ? LIMIT 1", [req.user.id]);
        if (!plan) return res.status(404).json({ message: "Configure seu objetivo e sua disponibilidade antes de gerar o cronograma." });
        const availability = JSON.parse(plan.availability_json || "{}");
        const subjects = JSON.parse(plan.subjects_json || "[]");
        const selectedDays = DAYS.map((day, index) => ({ day, index, minutes: Number(availability[day]) || 0 })).filter((item) => item.minutes > 0);
        if (!selectedDays.length || !subjects.length) return res.status(422).json({ message: "Seu plano precisa ter dias e matérias configurados." });
        await query("DELETE FROM user_study_tasks WHERE user_id = ? AND plan_id = ? AND status = 'pending' AND task_date >= CURDATE()", [req.user.id, plan.id]);
        const inserts = [];
        const today = new Date();
        const maxDays = 28;
        const weeklyCap = Math.max(60, Number(plan.weekly_hours || 10) * 60);
        let weekNumber = -1;
        let weeklyUsed = 0;
        let weeklyQuota = [];
        let roundRobin = 0;
        const resetWeek = () => {
            weeklyUsed = 0;
            weeklyQuota = subjects.map((subject) => ({ ...subject, remaining: Math.max(30, Number(subject.weeklyMinutes) || 120) }));
            weeklyQuota.sort((a,b) => ({high:0,normal:1,low:2}[a.priority] - {high:0,normal:1,low:2}[b.priority]));
        };
        for (let offset = 0; offset < maxDays; offset++) {
            const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
            const dayConfig = selectedDays.find((item) => item.index === date.getDay());
            const currentWeek = Math.floor((offset + ((today.getDay() + 6) % 7)) / 7);
            if (currentWeek !== weekNumber) { weekNumber = currentWeek; resetWeek(); }
            if (!dayConfig || (plan.target_date && date > new Date(`${String(plan.target_date).slice(0,10)}T23:59:59`))) continue;
            let remaining = Math.min(dayConfig.minutes, Math.max(0, weeklyCap - weeklyUsed));
            let guard = 0;
            while (remaining >= 25 && guard < 12) {
                let subject = weeklyQuota.find((item) => item.remaining >= 25);
                if (!subject) {
                    weeklyQuota.forEach((item) => { item.remaining = Math.max(30, Number(item.weeklyMinutes) || 120); });
                    subject = weeklyQuota[roundRobin % weeklyQuota.length];
                    roundRobin++;
                }
                const duration = Math.min(60, remaining, Math.max(25, subject.remaining));
                if (duration < 25) break;
                const topic = Array.isArray(subject.topics) && subject.topics.length ? subject.topics[(offset + guard) % subject.topics.length] : "Revisão do conteúdo";
                const taskType = offset > 0 && offset % 7 === 6 ? "review" : "study";
                const dateText = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
                inserts.push([req.user.id, plan.id, `${taskType === "review" ? "Revisar" : "Estudar"}: ${subject.name}`, subject.name, topic, dateText, duration, subject.priority || "normal", taskType]);
                subject.remaining -= duration;
                remaining -= duration;
                weeklyUsed += duration;
                guard++;
            }
        }
        if (inserts.length) {
            const placeholders = inserts.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(",");
            await query(`INSERT INTO user_study_tasks (user_id, plan_id, title, subject, topic, task_date, duration_minutes, priority, task_type) VALUES ${placeholders}`, inserts.flat());
        }
        const tasks = await query("SELECT * FROM user_study_tasks WHERE user_id = ? AND plan_id = ? ORDER BY task_date, id", [req.user.id, plan.id]);
        res.json({ message: `Cronograma gerado com ${inserts.length} atividades para as próximas quatro semanas, respeitando sua disponibilidade e carga semanal.`, tasks });
    } catch (error) {
        console.error("[study/generateTasks]", error);
        res.status(500).json({ message: "Não foi possível gerar o cronograma." });
    }
};

exports.createTask = async (req, res) => {
    try {
        const [plan] = await query("SELECT * FROM user_study_plans WHERE user_id = ? LIMIT 1", [req.user.id]);
        if (!plan) return res.status(409).json({ message: "Configure seu plano de estudos primeiro." });
        const { title, subject, topic, date, duration, priority, type, notes } = req.body || {};
        if (!String(title || "").trim() || !String(subject || "").trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return res.status(400).json({ message: "Informe atividade, matéria e data válida." });
        const result = await query("INSERT INTO user_study_tasks (user_id, plan_id, title, subject, topic, task_date, duration_minutes, priority, task_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.user.id, plan.id, String(title).trim().slice(0,220), String(subject).trim().slice(0,100), String(topic || "").slice(0,180) || null, date, Math.max(10, Math.min(360, Number(duration) || 45)), ["high","normal","low"].includes(priority) ? priority : "normal", ["study","review","exercise","essay","mock"].includes(type) ? type : "study", String(notes || "").slice(0,2000) || null]);
        const [task] = await query("SELECT * FROM user_study_tasks WHERE id = ? AND user_id = ?", [result.insertId, req.user.id]);
        res.status(201).json({ task });
    } catch (error) {
        console.error("[study/createTask]", error);
        res.status(500).json({ message: "Não foi possível adicionar a atividade." });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { status, title, subject, topic, date, duration, priority, notes } = req.body || {};
        const [existing] = await query("SELECT id FROM user_study_tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (!existing) return res.status(404).json({ message: "Atividade não encontrada." });
        await query(`UPDATE user_study_tasks SET title=COALESCE(?, title), subject=COALESCE(?, subject), topic=COALESCE(?, topic), task_date=COALESCE(?, task_date), duration_minutes=COALESCE(?, duration_minutes), priority=COALESCE(?, priority), notes=COALESCE(?, notes), status=COALESCE(?, status) WHERE id=? AND user_id=?`, [title?.trim()?.slice(0,220) || null, subject?.trim()?.slice(0,100) || null, topic?.slice(0,180) || null, date || null, duration ? Math.max(10,Math.min(360,Number(duration))) : null, ["high","normal","low"].includes(priority) ? priority : null, notes?.slice(0,2000) ?? null, ["pending","done","skipped"].includes(status) ? status : null, req.params.id, req.user.id]);
        const [task] = await query("SELECT * FROM user_study_tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        res.json({ task });
    } catch (error) {
        console.error("[study/updateTask]", error);
        res.status(500).json({ message: "Não foi possível atualizar a atividade." });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const result = await query("DELETE FROM user_study_tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (!result.affectedRows) return res.status(404).json({ message: "Atividade não encontrada." });
        res.json({ message: "Atividade removida." });
    } catch (error) {
        console.error("[study/deleteTask]", error);
        res.status(500).json({ message: "Não foi possível remover a atividade." });
    }
};
