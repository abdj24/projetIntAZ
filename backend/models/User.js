//Cette classe a été générée par IA

const mongoose = require("mongoose");

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
        goal: {
            type: String,
            default: "Devenir plus actif",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);