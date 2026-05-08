//Généré par IA
import { Exercise, Place, User, Workout } from "@/types/models";
import Constants from "expo-constants";
import { Platform } from "react-native";

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

export type ApiPublication = {
    id: string;
    auteur: string;
    temps: string;
    titre: string;
    description: string;
    likes: number;
    reactions: { id: string; ami: string; emoji: string }[];
    commentaires: { id: string; auteur: string; texte: string }[];
    estMoi?: boolean;
};

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

function normalizeUser(user: any): User {
    return {
        id: String(user.id || user._id),
        _id: user._id ? String(user._id) : undefined,
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

function normalizePublication(publication: any): ApiPublication {
    return {
        id: String(publication.id || publication._id),
        auteur: publication.auteur,
        temps: publication.temps,
        titre: publication.titre,
        description: publication.description,
        likes: Number(publication.likes || 0),
        reactions: Array.isArray(publication.reactions)
            ? publication.reactions.map((reaction: any) => ({
                id: String(reaction.id || reaction._id),
                ami: reaction.ami,
                emoji: reaction.emoji,
            }))
            : [],
        commentaires: Array.isArray(publication.commentaires)
            ? publication.commentaires.map((commentaire: any) => ({
                id: String(commentaire.id || commentaire._id),
                auteur: commentaire.auteur,
                texte: commentaire.texte,
            }))
            : [],
        estMoi: true,
    };
}

export async function login(email: string, password: string) {
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
    const response = await apiFetch(`${API_URL}/places`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizePlace) : [];
}

export async function getPublications(token: string) {
    const response = await apiFetch(`${API_URL}/publications`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await readJson(response);
    return Array.isArray(data) ? data.map(normalizePublication) : [];
}

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
