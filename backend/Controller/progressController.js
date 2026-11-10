const gamification = require("../Services/gamification");

exports.me = async (req, res) => {
    try { res.json(await gamification.getProgress(req.user.id)); }
    catch (error) { console.error("[progress]", error); res.status(503).json({ message: "Não foi possível carregar seu progresso. Verifique o banco de dados." }); }
};

exports.ranking = async (_req, res) => {
    try { res.json({ ranking: await gamification.getRanking(10) }); }
    catch (error) { console.error("[ranking]", error); res.status(503).json({ message: "Ranking indisponível no momento." }); }
};
