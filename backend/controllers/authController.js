//Généré par IA

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function toPublicUser(user) {
    return {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        level: user.level,
    };
}

exports.register = async (req, res) => {
    try {
        const { name, username, email, password, age, weight, height, goal, level } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            age,
            weight,
            height,
            goal,
            level,
        });

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
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

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
        const allowedFields = ["name", "username", "age", "weight", "height", "goal", "level"];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const user = await User.findByIdAndUpdate(req.userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json(toPublicUser(user));
    } catch {
        res.status(500).json({ message: "Erreur modification profil" });
    }
};
