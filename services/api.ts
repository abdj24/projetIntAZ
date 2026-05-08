//Généré par IA
import { Exercise, Place, User, WeightEntry, Workout } from "@/types/models";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Choix de l'URL API selon la plateforme utilisee.
function getApiUrl() {
    if (Platform.OS === "web") {
        return "http://localhost:3000";
    }

    const hostUri =
        Constants.expoConfig?.hostUri ||
        (Constants as any).manifest?.debuggerHost ||
        (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    const host = typeof hostUri === "string" ? hostUri.split(":")[0] : null;

    return host ? `http://${host}:3000` : "http://localhost:3000";
}

export const API_URL = getApiUrl();

/**
 * Publication sociale normalisee pour l'ecran Social.
 */
export type ApiPublication = {
    id: string;
    userId?: string;
    auteur: string;
    temps: string;
    titre: string;
    description: string;
    likes: number;
    likedByMe?: boolean;
    reactions: { id: string; userId?: string; ami: string; emoji: string }[];
    commentaires: { id: string; userId?: string; auteur: string; texte: string }[];
    estMoi?: boolean;
};

/**
 * Utilisateur affiche dans la liste d'amis ou la recherche.
 */
export type FriendUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    relation?: "none" | "friend" | "incoming" | "outgoing";
    requestId?: string;
};

/**
 * Demande d'ami recue ou envoyee.
 */
export type FriendRequest = {
    id: string;
    status: "pending" | "accepted" | "declined";
    requester: FriendUser;
    recipient: FriendUser;
    createdAt?: string;
};

/**
 * Reponse de la boite aux demandes d'amis.
 */
export type FriendRequestsResponse = {
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
};

/**
 * Lit la reponse JSON et lance une erreur claire si l'API refuse la requete.
 */
async function readJson(response: Response) {
    let data: any = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.message || "Erreur API");
    }

    return data;
}

/**
 * Wrapper fetch avec message plus utile quand le backend n'est pas joignable.
 */
async function apiFetch(url: string, options?: RequestInit) {
    try {
        return await fetch(url, options);
    } catch (e: any) {
        throw new Error(
            e.message === "Failed to fetch" || e.message === "Network request failed"
                ? `Impossible de joindre l'API (${API_URL}). Lance npm.cmd start et vérifie que le backend tourne.`
                : e.message || "Erreur réseau"
        );
    }
}

function normalizeExercise(exercise: any): Exercise {
    return {
        id: String(exercise.id || exercise._id),
        name: exercise.name,
        sets: Number(exercise.sets || 0),
        reps: Number(exercise.reps || 0),
        weight: exercise.weight,
    };
}

// Normalisation des workouts recus depuis MongoDB.
function normalizeWorkout(workout: any): Workout {
    return {
        id: String(workout.id || workout._id),
        title: workout.title,
        date: workout.date,
        duration: Number(workout.duration || 0),
        completed: Boolean(workout.completed),
        exercises: Array.isArray(workout.exercises)
            ? workout.exercises.map(normalizeExercise)
            : [],
    };
}

// Normalisation du profil utilisateur recu depuis l'API.
function normalizeUser(user: any): User {
    return {
        id: String(user.id || user._id),
        _id: user._id ? String(user._id) : undefined,
        name: user.name,
        username: user.username,
        email: user.email,
        age: user.age,
        weight: user.weight,
        weightHistory: Array.isArray(user.weightHistory)
            ? user.weightHistory.map(normalizeWeightEntry)
            : [],
        height: user.height,
        goal: user.goal,
        level: user.level,
    };
}

// Normalisation d'une pesee dans l'historique du poids.
function normalizeWeightEntry(entry: any): WeightEntry {
    return {
        id: String(entry.id || entry._id),
        date: entry.date,
        weight: Number(entry.weight),
    };
}

// Normalisation d'un lieu affiche sur la carte.
function normalizePlace(place: any): Place {
    return {
        id: String(place.id || place._id),
        _id: place._id ? String(place._id) : undefined,
        nom: place.nom,
        type: place.type,
        description: place.description || "",
        latitude: place.latitude,
        longitude: place.longitude,
    };
}

// Normalisation d'une publication du feed social.
function normalizePublication(publication: any): ApiPublication {
    return {
        id: String(publication.id || publication._id),
        userId: publication.userId ? String(publication.userId) : undefined,
        auteur: publication.auteur,
        temps: publication.temps,
        titre: publication.titre,
        description: publication.description,
        likes: Number(publication.likes || 0),
        likedByMe: Boolean(publication.likedByMe),
        reactions: Array.isArray(publication.reactions)
            ? publication.reactions.map((reaction: any) => ({
                id: String(reaction.id || reaction._id),
                userId: reaction.userId ? String(reaction.userId) : undefined,
                ami: reaction.ami,
                emoji: reaction.emoji,
            }))
            : [],
        commentaires: Array.isArray(publication.commentaires)
            ? publication.commentaires.map((commentaire: any) => ({
                id: String(commentaire.id || commentaire._id),
                userId: commentaire.userId ? String(commentaire.userId) : undefined,
                auteur: commentaire.auteur,
                texte: commentaire.texte,
            }))
            : [],
        estMoi: Boolean(publication.estMoi),
    };
}

// Normalisation d'un utilisateur affiche dans la recherche d'amis.
function normalizeFriendUser(user: any): FriendUser {
    return {
        id: String(user.id || user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        relation: user.relation,
        requestId: user.requestId,
    };
}

// Normalisation d'une demande d'ami.
function normalizeFriendRequest(request: any): FriendRequest {
    return {
        id: String(request.id || request._id),
        status: request.status,
        requester: normalizeFriendUser(request.requester),
        recipient: normalizeFriendUser(request.recipient),
        createdAt: request.createdAt,
    };
}

export async function login(email: string, password: string) {
    // Envoi des identifiants au backend.
    const response = await apiFetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await readJson(response);
    return { ...data, user: normalizeUser(data.user) };
}

export async function register(
    name: string,
    username: string,
    email: string,
    password: string
) {
    const response = await apiFetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            username,
            email,
            password,
        }),
    });

    const data = await readJson(response);
    return { ...data, user: normalizeUser(data.user) };
}

export async function getWorkouts(token: string) {
    // Recuperation des workouts sauvegardes dans MongoDB.
    const response = await apiFetch(`${API_URL}/workouts`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizeWorkout) : [];
}

export async function createWorkout(token: string, workout: Omit<Workout, "id">) {
    try {
        // Sauvegarde d'un workout complete.
        const response = await apiFetch(`${API_URL}/workouts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(workout),
        });

        const data = await readJson(response);
        return normalizeWorkout(data);
    } catch (e: any) {
        throw new Error(
            e.message === "Network request failed"
                ? `Impossible de joindre l'API (${API_URL}). Vérifie que le backend est démarré.`
                : e.message || "Erreur sauvegarde workout"
        );
    }
}

export async function getMe(token: string) {
    const response = await apiFetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return normalizeUser(await readJson(response));
}

export async function updateMe(token: string, updates: Partial<User>) {
    // Mise a jour du profil utilisateur.
    const response = await apiFetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });

    return normalizeUser(await readJson(response));
}

export async function getPlaces(token: string) {
    // Recuperation des lieux de la carte.
    const response = await apiFetch(`${API_URL}/places`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizePlace) : [];
}

export async function getPublications(token: string) {
    // Recuperation du feed social visible par l'utilisateur.
    const response = await apiFetch(`${API_URL}/publications`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizePublication) : [];
}

/**
 * Publie un workout complete dans le feed social.
 */
export async function createPublication(
    token: string,
    publication: {
        workoutId: string;
        auteur: string;
        temps: string;
        titre: string;
        description: string;
    }
) {
    const response = await apiFetch(`${API_URL}/publications`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(publication),
    });

    return normalizePublication(await readJson(response));
}

/**
 * Ajoute ou retire le like de l'utilisateur connecte.
 */
export async function togglePublicationLike(token: string, publicationId: string) {
    const response = await apiFetch(`${API_URL}/publications/${publicationId}/like`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return normalizePublication(await readJson(response));
}

/**
 * Enregistre une reaction emoji sur une publication.
 */
export async function setPublicationReaction(
    token: string,
    publicationId: string,
    emoji: string
) {
    const response = await apiFetch(`${API_URL}/publications/${publicationId}/reactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
    });

    return normalizePublication(await readJson(response));
}

/**
 * Ajoute un commentaire persistant a une publication.
 */
export async function addPublicationComment(
    token: string,
    publicationId: string,
    texte: string
) {
    const response = await apiFetch(`${API_URL}/publications/${publicationId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texte }),
    });

    return normalizePublication(await readJson(response));
}

/**
 * Recupere les amis de l'utilisateur connecte.
 */
export async function getFriends(token: string) {
    const response = await apiFetch(`${API_URL}/friends`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizeFriendUser) : [];
}

/**
 * Cherche des utilisateurs par nom, pseudo ou email.
 */
export async function searchUsers(token: string, query: string) {
    const response = await apiFetch(
        `${API_URL}/friends/search?q=${encodeURIComponent(query)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizeFriendUser) : [];
}

/**
 * Recupere les demandes d'amis recues et envoyees.
 */
export async function getFriendRequests(token: string): Promise<FriendRequestsResponse> {
    const response = await apiFetch(`${API_URL}/friends/requests`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return {
        incoming: Array.isArray(data.incoming)
            ? data.incoming.map(normalizeFriendRequest)
            : [],
        outgoing: Array.isArray(data.outgoing)
            ? data.outgoing.map(normalizeFriendRequest)
            : [],
    };
}

/**
 * Envoie une demande d'ami.
 */
export async function sendFriendRequest(token: string, recipientId: string) {
    const response = await apiFetch(`${API_URL}/friends/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId }),
    });

    return normalizeFriendRequest(await readJson(response));
}

/**
 * Accepte ou refuse une demande d'ami.
 */
export async function respondFriendRequest(
    token: string,
    requestId: string,
    action: "accept" | "decline"
) {
    const response = await apiFetch(`${API_URL}/friends/requests/${requestId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
    });

    return normalizeFriendRequest(await readJson(response));
}
