//Généré par IA
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const publicationController = require("../controllers/publicationController");

router.get("/", authMiddleware, publicationController.getPublications);
router.post("/", authMiddleware, publicationController.createPublication);

module.exports = router;
