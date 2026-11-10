require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./Routers/authRoutes");
const capyRoutes = require("./Routers/capyRoutes");
const examRoutes = require("./Routers/examRoutes");
const progressRoutes = require("./Routers/progressRoutes");
const newsRoutes = require("./Routers/newsRoutes");
const studyRoutes = require("./Routers/studyRoutes");
const gamification = require("./Services/gamification");
const db = require("./DB/database");
const learningSchema = require("./Services/learningSchema");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : true }));
app.use(express.json({ limit: "3mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/capy", capyRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/study", studyRoutes);

app.get("/", (_req, res) => res.json({ message: "API CapVest funcionando!", endpoints: ["/api/auth", "/api/capy", "/api/exams", "/api/progress", "/api/news", "/api/study"] }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    gamification.ensureTables().then(() => console.log("Tabelas de gamificação verificadas.")).catch((error) => console.error("Não foi possível preparar as tabelas de gamificação:", error.message));
    learningSchema.ensureLearningTables().then(() => console.log("Tabelas de simulados e cronograma verificadas.")).catch((error) => console.error("Não foi possível preparar as tabelas de aprendizagem:", error.message));
    db.query("ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NULL", (error) => {
        if (error) console.error("Aviso: não foi possível ampliar avatar_url. Execute backend/migrations/002_avatar_storage.sql no banco:", error.message);
        else console.log("Armazenamento de foto de perfil verificado.");
    });
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
