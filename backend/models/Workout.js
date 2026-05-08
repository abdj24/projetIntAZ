//Généré par IA

const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        sets: { type: Number, default: 0 },
        reps: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
    },
    { _id: true }
);

const WorkoutSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 0,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        exercises: [ExerciseSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Workout", WorkoutSchema);