//Généré par IA

const mongoose = require("mongoose");

// Historique des pesees de l'utilisateur.
const WeightHistorySchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
    },
    { _id: true }
);

// Modele principal d'un utilisateur Endorphine.
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            default: null,
        },
        weight: {
            type: Number,
            default: null,
        },
        weightHistory: {
            type: [WeightHistorySchema],
            default: [],
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        height: {
            type: Number,
            default: null,
        },
        goal: {
            type: String,
            default: "Devenir plus actif",
        },
        level: {
            type: String,
            default: "debutant",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
