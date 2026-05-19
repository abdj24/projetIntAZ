//Généré par IA

const jwt = require("jsonwebtoken");

// Middleware qui protege les routes avec un token JWT.
function authMiddleware(req, res, next) {
    // Lecture du header Authorization.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Non autorisé" });
    }

    // Extraction du token apres "Bearer".
    const token = authHeader.split(" ")[1];

    try {
        // Verification du token et ajout de l'utilisateur dans la requete.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide" });
    }
}

module.exports = authMiddleware;
