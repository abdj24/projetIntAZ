//Généré par IA
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const friendController = require("../controllers/friendController");

// Routes pour consulter et chercher des amis.
router.get("/", authMiddleware, friendController.getFriends);
router.get("/search", authMiddleware, friendController.searchUsers);

// Routes pour les demandes d'amis.
router.get("/requests", authMiddleware, friendController.getRequests);
router.post("/requests", authMiddleware, friendController.sendRequest);
router.put("/requests/:id", authMiddleware, friendController.respondRequest);

module.exports = router;
