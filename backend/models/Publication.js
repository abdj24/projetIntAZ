//Généré par IA
const mongoose = require("mongoose");

// Reaction emoji ajoutee par un utilisateur.
const ReactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ami: { type: String, required: true },
        emoji: { type: String, required: true },
    },
    { _id: true }
);

// Commentaire ajoute sous une publication.
const CommentaireSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        auteur: { type: String, required: true },
        texte: { type: String, required: true },
    },
    { _id: true }
);

// Publication sociale liee a un workout complete.
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
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        reactions: [ReactionSchema],
        commentaires: [CommentaireSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Publication", PublicationSchema);
