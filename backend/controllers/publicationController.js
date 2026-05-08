//Généré par IA
const Publication = require("../models/Publication");
const User = require("../models/User");
const Workout = require("../models/Workout");

/**
 * Retourne le nom affiche pour les interactions sociales.
 */
function getDisplayName(user) {
    return user?.username || user?.name || "Utilisateur";
}

/**
 * Verifie si une liste d'ObjectId contient un identifiant donne.
 */
function hasId(ids, searchedId) {
    return (ids || []).some((id) => String(id) === String(searchedId));
}

/**
 * Formate une publication MongoDB pour le frontend.
 */
function toPublicPublication(publication, currentUserId) {
    // Transformation du document MongoDB en objet utilisable par le frontend.
    const raw = publication.toObject ? publication.toObject() : publication;
    const likedBy = raw.likedBy || [];
    const likes = likedBy.length > 0 ? likedBy.length : Number(raw.likes || 0);

    return {
        ...raw,
        id: String(raw._id || raw.id),
        userId: String(raw.userId),
        workoutId: String(raw.workoutId),
        likes,
        likedByMe: hasId(likedBy, currentUserId),
        estMoi: String(raw.userId) === String(currentUserId),
        reactions: (raw.reactions || []).map((reaction) => ({
            ...reaction,
            id: String(reaction._id || reaction.id),
            userId: reaction.userId ? String(reaction.userId) : undefined,
        })),
        commentaires: (raw.commentaires || []).map((commentaire) => ({
            ...commentaire,
            id: String(commentaire._id || commentaire.id),
            userId: commentaire.userId ? String(commentaire.userId) : undefined,
        })),
    };
}

/**
 * Retourne les identifiants visibles dans le feed: utilisateur + amis.
 */
async function getVisibleUserIds(userId) {
    // Le feed contient les publications de l'utilisateur et de ses amis.
    const user = await User.findById(userId).select("friends");
    return [userId, ...((user?.friends || []).map((id) => String(id)))];
}

/**
 * Cherche une publication seulement si elle appartient a l'utilisateur ou a un ami.
 */
async function findVisiblePublication(publicationId, userId) {
    const visibleUserIds = await getVisibleUserIds(userId);

    return Publication.findOne({
        _id: publicationId,
        userId: { $in: visibleUserIds },
    });
}

/**
 * Retourne le feed social de l'utilisateur connecte.
 */
exports.getPublications = async (req, res) => {
    try {
        // Chargement des publications visibles dans le feed social.
        const visibleUserIds = await getVisibleUserIds(req.userId);
        const publications = await Publication.find({ userId: { $in: visibleUserIds } }).sort({
            createdAt: -1,
        });

        res.json(publications.map((publication) => toPublicPublication(publication, req.userId)));
    } catch (error) {
        console.error("Erreur récupération publications:", error);
        res.status(500).json({ message: "Erreur récupération publications" });
    }
};

/**
 * Publie une seance completee dans le feed social.
 */
exports.createPublication = async (req, res) => {
    try {
        // Lecture des informations envoyees par le frontend.
        const { workoutId, auteur, temps, titre, description } = req.body;

        if (!workoutId || !auteur || !titre || !description) {
            return res.status(400).json({ message: "Publication incomplète" });
        }

        // Verification que la seance appartient bien a l'utilisateur connecte.
        const workout = await Workout.findOne({ _id: workoutId, userId: req.userId });

        if (!workout) {
            return res.status(404).json({ message: "Workout introuvable" });
        }

        // Evite de publier deux fois la meme seance.
        const existingPublication = await Publication.findOne({
            userId: req.userId,
            workoutId,
        });

        if (existingPublication) {
            return res.json(toPublicPublication(existingPublication, req.userId));
        }

        const publication = await Publication.create({
            userId: req.userId,
            workoutId,
            auteur,
            temps: temps || "À l'instant",
            titre,
            description,
            likes: 0,
            likedBy: [],
            reactions: [],
            commentaires: [],
        });

        res.status(201).json(toPublicPublication(publication, req.userId));
    } catch (error) {
        console.error("Erreur création publication:", error);
        res.status(500).json({ message: "Erreur création publication" });
    }
};

/**
 * Ajoute ou retire le like de l'utilisateur connecte.
 */
exports.toggleLike = async (req, res) => {
    try {
        // Recherche de la publication uniquement dans le feed autorise.
        const publication = await findVisiblePublication(req.params.id, req.userId);

        if (!publication) {
            return res.status(404).json({ message: "Publication introuvable" });
        }

        const alreadyLiked = hasId(publication.likedBy, req.userId);

        if (alreadyLiked) {
            // Retrait du like si l'utilisateur avait deja aime.
            publication.likedBy = publication.likedBy.filter(
                (id) => String(id) !== String(req.userId)
            );
        } else {
            // Ajout du like sinon.
            publication.likedBy.push(req.userId);
        }

        publication.likes = publication.likedBy.length;
        await publication.save();

        res.json(toPublicPublication(publication, req.userId));
    } catch (error) {
        console.error("Erreur like publication:", error);
        res.status(500).json({ message: "Erreur like publication" });
    }
};

/**
 * Enregistre une reaction emoji sur une publication visible.
 */
exports.setReaction = async (req, res) => {
    try {
        // Lecture de l'emoji choisi par l'utilisateur.
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ message: "Réaction manquante" });
        }

        const [publication, user] = await Promise.all([
            findVisiblePublication(req.params.id, req.userId),
            User.findById(req.userId).select("name username"),
        ]);

        if (!publication) {
            return res.status(404).json({ message: "Publication introuvable" });
        }

        // Une seule reaction par utilisateur sur une publication.
        publication.reactions = (publication.reactions || []).filter(
            (reaction) => String(reaction.userId || "") !== String(req.userId)
        );
        publication.reactions.push({
            userId: req.userId,
            ami: getDisplayName(user),
            emoji,
        });

        await publication.save();

        res.json(toPublicPublication(publication, req.userId));
    } catch (error) {
        console.error("Erreur réaction publication:", error);
        res.status(500).json({ message: "Erreur réaction publication" });
    }
};

/**
 * Ajoute un commentaire sur une publication visible.
 */
exports.addComment = async (req, res) => {
    try {
        // Nettoyage du commentaire avant sauvegarde.
        const texte = String(req.body.texte || "").trim();

        if (!texte) {
            return res.status(400).json({ message: "Commentaire vide" });
        }

        const [publication, user] = await Promise.all([
            findVisiblePublication(req.params.id, req.userId),
            User.findById(req.userId).select("name username"),
        ]);

        if (!publication) {
            return res.status(404).json({ message: "Publication introuvable" });
        }

        // Ajout du commentaire avec l'auteur connecte.
        publication.commentaires.push({
            userId: req.userId,
            auteur: getDisplayName(user),
            texte: texte.slice(0, 300),
        });

        await publication.save();

        res.json(toPublicPublication(publication, req.userId));
    } catch (error) {
        console.error("Erreur commentaire publication:", error);
        res.status(500).json({ message: "Erreur commentaire publication" });
    }
};
