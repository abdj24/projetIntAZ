//Généré par IA

const Workout = require("../models/Workout");

exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.userId }).sort({
            date: -1,
            createdAt: -1,
        });

        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération workouts" });
    }
};

exports.createWorkout = async (req, res) => {
    try {
        const { title, date, duration, completed, exercises } = req.body;

        if (!title || !date) {
            return res.status(400).json({ message: "Titre et date requis" });
        }

        const cleanedExercises = Array.isArray(exercises)
            ? exercises.map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets || 0,
                reps: exercise.reps || 0,
                weight: exercise.weight || 0,
            }))
            : [];

        const workout = await Workout.create({
            userId: req.userId,
            title,
            date,
            duration: duration || 0,
            completed: completed || false,
            exercises: cleanedExercises,
        });

        res.status(201).json(workout);
    } catch (error) {
        console.error("Erreur création workout:", error);
        res.status(500).json({ message: "Erreur création workout" });
    }
};

exports.updateWorkout = async (req, res) => {
    try {
        const workout = await Workout.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );

        if (!workout) {
            return res.status(404).json({ message: "Workout introuvable" });
        }

        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: "Erreur modification workout" });
    }
};

exports.deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!workout) {
            return res.status(404).json({ message: "Workout introuvable" });
        }

        res.json({ message: "Workout supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression workout" });
    }
};
