const jwt = require("jsonwebtoken");

/** Exige o token JWT emitido no login (header "Authorization: Bearer <token>"). */
module.exports = function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Entre na sua conta para pesquisar questões." });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Sua sessão expirou. Entre novamente." });
    }
};
