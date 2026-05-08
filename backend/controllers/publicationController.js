//Généré par IA
const Publication = require("../models/Publication");
const Workout = require("../models/Workout");

exports.getPublications = async (req, res) => {
    try {
        const publications = await Publication.find({ userId: req.userId }).sort({
            createdAt: -1,
        });

        res.json(publications);
    } catch (error) {
        console.error("Erreur récupération publications:", error);
        res.status(500).json({ message: "Erreur récupération publications" });
    }
};

exports.createPublication = async (req, res) => {
    try {
        const { workoutId, auteur, temps, titre, description } = req.body;

        if (!workoutId || !auteur || !titre || !description) {
            return res.status(400).json({ message: "Publication incomplète" });
        }

        const workout = await Workout.findOne({ _id: workoutId, userId: req.userId });

        if (!workout) {
            return res.status(404).json({ message: "Workout introuvable" });
        }

        const existingPublication = await Publication.findOne({
            userId: req.userId,
            workoutId,
        });

        if (existingPublication) {
            return res.json(existingPublication);
        }

        const publication = await Publication.create({
            userId: req.userId,
            workoutId,
            auteur,
            temps: temps || "À l'instant",
            titre,
            description,
            likes: 0,
            reactions: [],
            commentaires: [],
        });

        res.status(201).json(publication);
    } catch (error) {
        console.error("Erreur création publication:", error);
        res.status(500).json({ message: "Erreur création publication" });
    }
};
