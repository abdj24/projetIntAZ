//Généré par IA
const Place = require("../models/Place");

// Lieux inseres automatiquement si la collection MongoDB est vide.
const DEFAULT_PLACES = [
    {
        nom: "Econofitness Berri-UQAM",
        type: "Gym",
        description: "Salle de sport au centre-ville, pratique pour musculation et cardio.",
        latitude: 45.5152,
        longitude: -73.5613,
    },
    {
        nom: "Nautilus Plus Place Montreal Trust",
        type: "Gym",
        description: "Gym central avec equipements de musculation et espaces cardio.",
        latitude: 45.5028,
        longitude: -73.5719,
    },
    {
        nom: "Parc La Fontaine",
        type: "Parc",
        description: "Grand parc pour courir, marcher et faire une seance exterieure.",
        latitude: 45.5271,
        longitude: -73.5691,
    },
    {
        nom: "Parc du Mont-Royal",
        type: "Parc",
        description: "Lieu classique pour marche, course, escaliers et entrainement dehors.",
        latitude: 45.5017,
        longitude: -73.5878,
    },
    {
        nom: "Parc Jarry",
        type: "Parc",
        description: "Grand espace vert avec pistes et terrains pour bouger dehors.",
        latitude: 45.5354,
        longitude: -73.6271,
    },
];

// Initialisation des lieux par defaut dans MongoDB.
async function ensureDefaultPlaces() {
    const count = await Place.countDocuments();

    if (count === 0) {
        await Place.insertMany(DEFAULT_PLACES);
    }
}

exports.getPlaces = async (req, res) => {
    try {
        // Verification que la collection contient des lieux.
        await ensureDefaultPlaces();

        // Recuperation des lieux tries par nom.
        const places = await Place.find().sort({ nom: 1 });
        res.json(places);
    } catch (error) {
        console.error("Erreur recuperation lieux:", error);
        res.status(500).json({ message: "Erreur recuperation lieux" });
    }
};
