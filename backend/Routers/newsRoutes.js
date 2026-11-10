const express = require("express");
const newsController = require("../Controller/newsController");
const router = express.Router();
router.get("/", newsController.list);
module.exports = router;
