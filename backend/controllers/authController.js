//Généré par IA

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Transformation d'un utilisateur MongoDB en objet public.
function toPublicUser(user) {
    return {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        age: user.age,
        weight: user.weight,
        weightHistory: user.weightHistory || [],
        height: user.height,
        goal: user.goal,
        level: user.level,
    };
}

exports.register = async (req, res) => {
    try {
        // Lecture des informations du formulaire d'inscription.
        const { name, username, email, password, age, weight, height, goal, level } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        // Verification que l'email n'est pas deja utilise.
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // Hash du mot de passe avant sauvegarde.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Initialisation du poids et de son historique.
        const initialWeight = weight !== undefined && weight !== null && Number(weight) > 0
            ? Number(weight)
            : null;

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            age,
            weight: initialWeight,
            weightHistory: initialWeight
                ? [{ date: new Date().toISOString().split("T")[0], weight: initialWeight }]
                : [],
            height,
            goal,
            level,
        });

        // Creation du token de session.
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: toPublicUser(user),
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur register" });
    }
};

exports.login = async (req, res) => {
    try {
        // Lecture des identifiants de connexion.
        const { email, password } = req.body;

        // Recherche de l'utilisateur par email.
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Verification du mot de passe.
        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Creation du token apres connexion reussie.
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: toPublicUser(user),
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur login" });
    }
};

exports.me = async (req, res) => {
    try {
        // Recuperation du profil connecte sans le mot de passe.
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json(toPublicUser(user));
    } catch {
        res.status(500).json({ message: "Erreur serveur me" });
    }
};

exports.updateMe = async (req, res) => {
    try {
        // Liste des champs autorises a etre modifies.
        const allowedFields = ["name", "username", "age", "weight", "height", "goal", "level"];
        const updates = { $set: {} };

        // Construction de l'objet de mise a jour.
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.$set[field] = req.body[field];
            }
        }

        // Chargement du profil actuel pour comparer le poids.
        const currentUser = await User.findById(req.userId).select("-password");

        if (!currentUser) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        if (updates.$set.weight !== undefined) {
            // Ajout d'une entree d'historique si le poids change.
            const nextWeight = updates.$set.weight === null ? null : Number(updates.$set.weight);
            updates.$set.weight = nextWeight;

            if (nextWeight !== null && Number.isFinite(nextWeight) && nextWeight > 0) {
                const today = new Date().toISOString().split("T")[0];
                const previousWeight = currentUser.weight;

                if (previousWeight !== nextWeight) {
                    updates.$push = {
                        weightHistory: {
                            date: today,
                            weight: nextWeight,
                        },
                    };
                }
            }
        }

        if (Object.keys(updates.$set).length === 0) {
            delete updates.$set;
        }

        // Sauvegarde des modifications du profil.
        const user = await User.findByIdAndUpdate(req.userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password");

        res.json(toPublicUser(user));
    } catch {
        res.status(500).json({ message: "Erreur modification profil" });
    }
};
