//Généré par IA

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes d'inscription et de connexion.
router.post("/register", authController.register);
router.post("/login", authController.login);

// Routes du profil connecte.
router.get("/me", authMiddleware, authController.me);
router.put("/me", authMiddleware, authController.updateMe);

module.exports = router;
