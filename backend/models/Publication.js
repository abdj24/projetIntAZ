//Généré par IA
const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
    {
        ami: { type: String, required: true },
        emoji: { type: String, required: true },
    },
    { _id: true }
);

const CommentaireSchema = new mongoose.Schema(
    {
        auteur: { type: String, required: true },
        texte: { type: String, required: true },
    },
    { _id: true }
);

const PublicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workoutId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workout",
            required: true,
        },
        auteur: {
            type: String,
            required: true,
            trim: true,
        },
        temps: {
            type: String,
            default: "À l'instant",
        },
        titre: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        likes: {
            type: Number,
            default: 0,
        },
        reactions: [ReactionSchema],
        commentaires: [CommentaireSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Publication", PublicationSchema);
