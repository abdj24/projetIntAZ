//Généré par IA

const path = require("path");
// Chargement des variables d'environnement depuis le fichier .env racine.
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const placeRoutes = require("./routes/placeRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const friendRoutes = require("./routes/friendRoutes");

// Initialisation de l'application Express.
const app = express();
let mongoConnecting = false;

// Activation du CORS et du JSON pour les requetes API.
app.use(cors());
app.use(express.json());

// Verification des variables obligatoires.
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("MONGO_URI et JWT_SECRET doivent être définis dans .env");
    process.exit(1);
}

// Connexion a MongoDB.
mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("MongoDB connecté"))
    .catch((error) => console.error("Erreur MongoDB:", error));

// Relance de la connexion si Atlas refuse temporairement l'acces.
async function retryMongoConnection() {
    if (mongoConnecting || mongoose.connection.readyState === 1) return;

    try {
        mongoConnecting = true;
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    } catch (error) {
        console.error("Nouvelle tentative MongoDB echouee:", error.message);
    } finally {
        mongoConnecting = false;
    }
}

mongoose.connection.on("connected", () => {
    console.log("MongoDB connecte");
});

setInterval(retryMongoConnection, 5000);

// Route de test pour verifier que l'API et MongoDB repondent.
app.get("/", (req, res) => {
    res.json({
        message: "API Endorphine fonctionne",
        mongoConnected: mongoose.connection.readyState === 1,
    });
});

// Blocage des routes si MongoDB n'est pas connecte.
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "MongoDB n'est pas connecté. Vérifie MONGO_URI et que MongoDB est démarré.",
        });
    }

    next();
});

// Declaration des routes principales de l'API.
app.use("/auth", authRoutes);
app.use("/workouts", workoutRoutes);
app.use("/places", placeRoutes);
app.use("/publications", publicationRoutes);
app.use("/friends", friendRoutes);

const PORT = process.env.PORT || 3000;

// Demarrage du serveur Express.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
