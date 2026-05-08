//Généré par IA
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const placeController = require("../controllers/placeController");

// Route des lieux affiches sur la carte.
router.get("/", authMiddleware, placeController.getPlaces);

module.exports = router;
