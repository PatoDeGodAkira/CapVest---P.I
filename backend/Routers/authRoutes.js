const express = require("express");
const authController = require("../Controller/authController");
const requireAuth = require("../Middleware/requireAuth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.patch("/profile", requireAuth, authController.updateProfile);

module.exports = router;