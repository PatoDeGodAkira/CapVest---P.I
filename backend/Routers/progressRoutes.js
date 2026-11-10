const express = require("express");
const controller = require("../Controller/progressController");
const requireAuth = require("../Middleware/requireAuth");
const router = express.Router();
router.get("/me", requireAuth, controller.me);
router.get("/ranking", controller.ranking);
module.exports = router;
