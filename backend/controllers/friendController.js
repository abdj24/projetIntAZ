//Généré par IA
const mongoose = require("mongoose");

const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

const userFields = "name username email friends";

/**
 * Convertit un document User MongoDB en objet public envoye au frontend.
 */
function toPublicUser(user) {
    if (!user) return null;

    return {
        id: String(user._id || user.id),
        name: user.name,
        username: user.username,
        email: user.email,
    };
}

/**
 * Convertit une demande d'ami MongoDB en objet public.
 */
function toPublicRequest(request) {
    return {
        id: String(request._id || request.id),
        status: request.status,
        requester: toPublicUser(request.requester),
        recipient: toPublicUser(request.recipient),
        createdAt: request.createdAt,
    };
}

/**
 * Ajoute le statut de relation pour chaque utilisateur trouve.
 * Statuts possibles: friend, incoming, outgoing ou none.
 */
async function buildFriendStatus(currentUserId, users) {
    // Recuperation des amis actuels pour identifier les relations existantes.
    const currentUser = await User.findById(currentUserId).select("friends");
    const friendIds = new Set((currentUser?.friends || []).map((id) => String(id)));
    const userIds = users.map((user) => user._id);

    // Recuperation des demandes en attente entre l'utilisateur et les resultats.
    const pendingRequests = await FriendRequest.find({
        status: "pending",
        $or: [
            { requester: currentUserId, recipient: { $in: userIds } },
            { requester: { $in: userIds }, recipient: currentUserId },
        ],
    });

    const pendingByUser = new Map();
    pendingRequests.forEach((request) => {
        const otherId =
            String(request.requester) === String(currentUserId)
                ? String(request.recipient)
                : String(request.requester);
        pendingByUser.set(otherId, {
            direction:
                String(request.requester) === String(currentUserId)
                    ? "outgoing"
                    : "incoming",
            requestId: String(request._id),
        });
    });

    return users.map((user) => {
        const id = String(user._id);
        const pending = pendingByUser.get(id);

        return {
            ...toPublicUser(user),
            relation: friendIds.has(id)
                ? "friend"
                : pending?.direction || "none",
            requestId: pending?.requestId,
        };
    });
}

/**
 * Retourne la liste des amis de l'utilisateur connecte.
 */
exports.getFriends = async (req, res) => {
    try {
        // Chargement des amis avec leurs informations publiques.
        const user = await User.findById(req.userId).populate("friends", userFields);

        res.json((user?.friends || []).map(toPublicUser));
    } catch (error) {
        console.error("Erreur récupération amis:", error);
        res.status(500).json({ message: "Erreur récupération amis" });
    }
};

/**
 * Recherche des utilisateurs par nom, pseudo ou email.
 */
exports.searchUsers = async (req, res) => {
    try {
        // Lecture et validation du texte de recherche.
        const q = String(req.query.q || "").trim();

        if (q.length < 2) {
            return res.json([]);
        }

        // Protection du regex pour eviter une recherche invalide.
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const users = await User.find({
            _id: { $ne: req.userId },
            $or: [
                { name: { $regex: escaped, $options: "i" } },
                { username: { $regex: escaped, $options: "i" } },
                { email: { $regex: escaped, $options: "i" } },
            ],
        })
            .select(userFields)
            .limit(20);

        res.json(await buildFriendStatus(req.userId, users));
    } catch (error) {
        console.error("Erreur recherche utilisateurs:", error);
        res.status(500).json({ message: "Erreur recherche utilisateurs" });
    }
};

/**
 * Retourne les demandes recues et envoyees encore en attente.
 */
exports.getRequests = async (req, res) => {
    try {
        // Chargement des demandes recues et envoyees en parallele.
        const [incoming, outgoing] = await Promise.all([
            FriendRequest.find({ recipient: req.userId, status: "pending" })
                .populate("requester", userFields)
                .populate("recipient", userFields)
                .sort({ createdAt: -1 }),
            FriendRequest.find({ requester: req.userId, status: "pending" })
                .populate("requester", userFields)
                .populate("recipient", userFields)
                .sort({ createdAt: -1 }),
        ]);

        res.json({
            incoming: incoming.map(toPublicRequest),
            outgoing: outgoing.map(toPublicRequest),
        });
    } catch (error) {
        console.error("Erreur récupération demandes:", error);
        res.status(500).json({ message: "Erreur récupération demandes" });
    }
};

/**
 * Envoie une demande d'ami ou accepte automatiquement une demande inverse.
 */
exports.sendRequest = async (req, res) => {
    try {
        // Validation de l'utilisateur a ajouter.
        const recipientId = req.body.recipientId;

        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return res.status(400).json({ message: "Utilisateur introuvable" });
        }

        if (String(recipientId) === String(req.userId)) {
            return res.status(400).json({ message: "Tu ne peux pas t'ajouter toi-même" });
        }

        const [currentUser, recipient] = await Promise.all([
            User.findById(req.userId),
            User.findById(recipientId),
        ]);

        if (!currentUser || !recipient) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        if ((currentUser.friends || []).some((id) => String(id) === String(recipientId))) {
            return res.status(400).json({ message: "Vous êtes déjà amis" });
        }

        // Si l'autre personne a deja envoye une demande, on l'accepte directement.
        const oppositeRequest = await FriendRequest.findOne({
            requester: recipientId,
            recipient: req.userId,
            status: "pending",
        });

        if (oppositeRequest) {
            oppositeRequest.status = "accepted";
            await oppositeRequest.save();

            await Promise.all([
                User.findByIdAndUpdate(req.userId, { $addToSet: { friends: recipientId } }),
                User.findByIdAndUpdate(recipientId, { $addToSet: { friends: req.userId } }),
            ]);

            const populated = await oppositeRequest.populate("requester recipient", userFields);
            return res.json(toPublicRequest(populated));
        }

        // Creation ou reactivation d'une demande en attente.
        const request = await FriendRequest.findOneAndUpdate(
            { requester: req.userId, recipient: recipientId },
            { requester: req.userId, recipient: recipientId, status: "pending" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate("requester recipient", userFields);

        res.status(201).json(toPublicRequest(request));
    } catch (error) {
        console.error("Erreur envoi demande:", error);
        res.status(500).json({ message: "Erreur envoi demande" });
    }
};

/**
 * Accepte ou refuse une demande d'ami recue.
 */
exports.respondRequest = async (req, res) => {
    try {
        // Lecture de l'action demandee: accepter ou refuser.
        const { action } = req.body;

        if (!["accept", "decline"].includes(action)) {
            return res.status(400).json({ message: "Action invalide" });
        }

        const request = await FriendRequest.findOne({
            _id: req.params.id,
            recipient: req.userId,
            status: "pending",
        });

        if (!request) {
            return res.status(404).json({ message: "Demande introuvable" });
        }

        request.status = action === "accept" ? "accepted" : "declined";
        await request.save();

        if (action === "accept") {
            // Ajout mutuel dans les listes d'amis.
            await Promise.all([
                User.findByIdAndUpdate(request.requester, {
                    $addToSet: { friends: request.recipient },
                }),
                User.findByIdAndUpdate(request.recipient, {
                    $addToSet: { friends: request.requester },
                }),
            ]);
        }

        const populated = await request.populate("requester recipient", userFields);
        res.json(toPublicRequest(populated));
    } catch (error) {
        console.error("Erreur réponse demande:", error);
        res.status(500).json({ message: "Erreur réponse demande" });
    }
};
