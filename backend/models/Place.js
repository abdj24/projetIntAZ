//Généré par IA
const mongoose = require("mongoose");

// Lieu affiche dans la carte de l'application.
const PlaceSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["Gym", "Parc"],
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Place", PlaceSchema);
