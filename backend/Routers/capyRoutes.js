const express = require("express");
const capyController = require("../Controller/capyController");
const rateLimit = require("../Middleware/rateLimit");
const requireAuth = require("../Middleware/requireAuth");

const router = express.Router();

router.get("/status", capyController.status);
router.get("/search", requireAuth, rateLimit({ windowMs: 60_000, max: 20 }), capyController.search);

router.post("/check", requireAuth, rateLimit({ windowMs: 60_000, max: 90 }), capyController.check);

module.exports = router;
