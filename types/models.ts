//Généré par IA
export type GoalType = "lose_weight" | "gain_muscle" | "maintain";
export type LevelType = "debutant" | "intermediaire" | "avance";
export type PlaceType = "Gym" | "Parc";
export type MessageSender = "utilisateur" | "assistant";

// Différentes types de variables

// Donnees du profil utilisateur.
export type User = {
    id: string;
    _id?: string;
    name: string;
    username?: string;
    email?: string;
    age?: number | null;
    weight?: number | null;
    weightHistory?: WeightEntry[];
    height?: number | null;
    goal?: GoalType | string;
    level?: LevelType | string;
};

// Exercice d'un workout.
export type Exercise = {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
};

// Workout sauvegarde dans MongoDB.
export type Workout = {
    id: string;
    title: string;
    date: string;
    duration: number;
    completed: boolean;
    exercises: Exercise[];
};

// Entree de l'historique de poids.
export type WeightEntry = {
    id: string;
    date: string;
    weight: number;
};

// Message de l'assistant.
export type ChatMessage = {
    id: string;
    sender: MessageSender;
    text: string;
    date: string;
};

// Lieu affiche sur la carte.
export type Place = {
    id: string;
    _id?: string;
    nom: string;
    type: PlaceType;
    description: string;
    latitude?: number;
    longitude?: number;
};
