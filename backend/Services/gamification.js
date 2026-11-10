const db = require("../DB/database");

const query = (sql, values = []) => db.promise().query(sql, values).then(([rows]) => rows);

async function ensureTables() {
    await query(`CREATE TABLE IF NOT EXISTS user_gamification (
        user_id INT NOT NULL PRIMARY KEY,
        xp INT NOT NULL DEFAULT 0,
        questions_answered INT NOT NULL DEFAULT 0,
        correct_answers INT NOT NULL DEFAULT 0,
        current_streak INT NOT NULL DEFAULT 0,
        longest_streak INT NOT NULL DEFAULT 0,
        last_activity_date DATE NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_gamification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    await query(`CREATE TABLE IF NOT EXISTS user_question_attempts (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_ref VARCHAR(190) NOT NULL,
        selected_choice VARCHAR(20) NULL,
        is_correct BOOLEAN NULL,
        xp_earned INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_attempt_user_date (user_id, created_at),
        CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    await query(`CREATE TABLE IF NOT EXISTS user_exam_submissions (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        document_id VARCHAR(190) NOT NULL,
        answers_json LONGTEXT NOT NULL,
        submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_exam_submission_user (user_id, submitted_at),
        CONSTRAINT fk_exam_submission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    await query(`CREATE TABLE IF NOT EXISTS user_question_rewards (
        user_id INT NOT NULL,
        question_ref VARCHAR(190) NOT NULL,
        rewarded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, question_ref),
        CONSTRAINT fk_question_reward_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
}

function levelFromXp(xp) {
    let level = 1;
    let remaining = Math.max(0, Number(xp) || 0);
    let next = 100;
    while (remaining >= next && level < 999) {
        remaining -= next;
        level += 1;
        next = 100 + (level - 1) * 50;
    }
    return { level, xpInLevel: remaining, xpForNextLevel: next, progress: Math.round((remaining / next) * 100) };
}

async function recordAnswer(userId, questionRef, choice, correct) {
    await query("INSERT IGNORE INTO user_gamification (user_id) VALUES (?)", [userId]);
    const reward = await query("INSERT IGNORE INTO user_question_rewards (user_id, question_ref) VALUES (?, ?)", [userId, questionRef]);
    const xpEarned = reward.affectedRows ? (correct === true ? 10 : correct === false ? 2 : 0) : 0;
    await query("INSERT INTO user_question_attempts (user_id, question_ref, selected_choice, is_correct, xp_earned) VALUES (?, ?, ?, ?, ?)", [userId, questionRef, choice || null, correct, xpEarned]);
    await query(`UPDATE user_gamification SET
        xp = xp + ?,
        questions_answered = questions_answered + 1,
        correct_answers = correct_answers + ?,
        current_streak = CASE
            WHEN last_activity_date = CURDATE() THEN current_streak
            WHEN last_activity_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN current_streak + 1
            ELSE 1 END,
        longest_streak = GREATEST(longest_streak, CASE
            WHEN last_activity_date = CURDATE() THEN current_streak
            WHEN last_activity_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN current_streak + 1
            ELSE 1 END),
        last_activity_date = CURDATE(), updated_at = NOW()
        WHERE user_id = ?`, [xpEarned, correct === true ? 1 : 0, userId]);
    const progress = await getProgress(userId);
    return { ...progress, lastAnswerXp: xpEarned };
}

async function getProgress(userId) {
    await query("INSERT IGNORE INTO user_gamification (user_id) VALUES (?)", [userId]);
    const rows = await query("SELECT * FROM user_gamification WHERE user_id = ?", [userId]);
    const row = rows[0];
    const xp = Number(row.xp || 0);
    const level = levelFromXp(xp);
    const answered = Number(row.questions_answered || 0);
    const correct = Number(row.correct_answers || 0);
    return {
        xp, level: level.level, xpInLevel: level.xpInLevel,
        xpForNextLevel: level.xpForNextLevel, levelProgress: level.progress,
        questionsAnswered: answered, correctAnswers: correct,
        accuracy: answered ? Math.round((correct / answered) * 1000) / 10 : 0,
        currentStreak: Number(row.current_streak || 0), longestStreak: Number(row.longest_streak || 0),
        achievements: [
            { id: "first-question", title: "Primeiro passo", description: "Responda sua primeira questão.", unlocked: answered >= 1 },
            { id: "ten-questions", title: "Aquecimento", description: "Responda 10 questões.", unlocked: answered >= 10 },
            { id: "fifty-questions", title: "Ritmo de estudo", description: "Responda 50 questões.", unlocked: answered >= 50 },
            { id: "hundred-questions", title: "Centena", description: "Responda 100 questões.", unlocked: answered >= 100 },
            { id: "ten-correct", title: "Precisão", description: "Acerte 10 questões.", unlocked: correct >= 10 },
            { id: "seven-day-streak", title: "Constância", description: "Mantenha uma sequência de 7 dias.", unlocked: Number(row.longest_streak || 0) >= 7 }
        ]
    };
}

async function getRanking(limit = 10) {
    const rows = await query(`SELECT u.id, u.name, u.username, u.avatar_url, g.xp, g.questions_answered
        FROM user_gamification g JOIN users u ON u.id = g.user_id
        ORDER BY g.xp DESC, g.questions_answered DESC LIMIT ?`, [limit]);
    return rows.map((row, index) => ({ position: index + 1, id: row.id, name: row.name, username: row.username, avatarUrl: row.avatar_url, xp: Number(row.xp), questionsAnswered: Number(row.questions_answered) }));
}

module.exports = { ensureTables, recordAnswer, getProgress, getRanking, levelFromXp };
