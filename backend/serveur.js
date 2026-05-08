//Cette classe est générée par IA

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connecté"))
    .catch((error) => console.error("Erreur MongoDB:", error));

app.use("/auth", authRoutes);
app.use("/workouts", workoutRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API Endorphine fonctionne" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});