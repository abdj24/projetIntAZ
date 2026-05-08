//Généré par IA
const mongoose = require("mongoose");

// Demande d'ami entre deux utilisateurs.
const FriendRequestSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Une seule demande possible entre deux memes utilisateurs.
FriendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);
