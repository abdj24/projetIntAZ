//Généré par IA
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const publicationController = require("../controllers/publicationController");

// Routes du feed social.
router.get("/", authMiddleware, publicationController.getPublications);
router.post("/", authMiddleware, publicationController.createPublication);

// Routes des interactions sociales persistantes.
router.post("/:id/like", authMiddleware, publicationController.toggleLike);
router.post("/:id/reactions", authMiddleware, publicationController.setReaction);
router.post("/:id/comments", authMiddleware, publicationController.addComment);

module.exports = router;
