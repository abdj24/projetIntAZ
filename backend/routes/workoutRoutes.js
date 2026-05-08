//Généré par IA

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const workoutController = require("../controllers/workoutController");

router.get("/", authMiddleware, workoutController.getWorkouts);
router.post("/", authMiddleware, workoutController.createWorkout);
router.put("/:id", authMiddleware, workoutController.updateWorkout);
router.delete("/:id", authMiddleware, workoutController.deleteWorkout);

module.exports = router;