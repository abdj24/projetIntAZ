//Généré par IA

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const placeRoutes = require("./routes/placeRoutes");
const publicationRoutes = require("./routes/publicationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("MONGO_URI et JWT_SECRET doivent être définis dans .env");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("MongoDB connecté"))
    .catch((error) => console.error("Erreur MongoDB:", error));

app.get("/", (req, res) => {
    res.json({
        message: "API Endorphine fonctionne",
        mongoConnected: mongoose.connection.readyState === 1,
    });
});

app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "MongoDB n'est pas connecté. Vérifie MONGO_URI et que MongoDB est démarré.",
        });
    }

    next();
});

app.use("/auth", authRoutes);
app.use("/workouts", workoutRoutes);
app.use("/places", placeRoutes);
app.use("/publications", publicationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
