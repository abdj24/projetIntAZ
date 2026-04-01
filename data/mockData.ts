import { User, Workout, WeightEntry, ChatMessage, Place } from "../types/models";

//Fichier servant a enregistrer en tant que constantes les textes

export const mockUser: User = {
    id: "u1",
    name: "Jougbouny",
    age: 19,
    weight: 119,
    height: 175,
    goal: "lose_weight",
    level: "debutant",
};

export const mockWorkouts: Workout[] = [
    {
        id: "w1",
        title: "Upper Body",
        date: "2026-04-01",
        duration: 50,
        completed: true,
        exercises: [
            { id: "e1", name: "Bench Press", sets: 3, reps: 10, weight: 45 },
            { id: "e2", name: "Shoulder Press", sets: 3, reps: 12, weight: 25 },
        ],
    },
    {
        id: "w2",
        title: "Cardio",
        date: "2026-04-02",
        duration: 30,
        completed: false,
        exercises: [{ id: "e3", name: "Running", sets: 1, reps: 1 }],
    },
];

export const mockWeightHistory: WeightEntry[] = [
    { id: "we1", date: "2026-03-20", weight: 120 },
    { id: "we2", date: "2026-03-25", weight: 119.4 },
    { id: "we3", date: "2026-04-01", weight: 119 },
];

export const mockMessages: ChatMessage[] = [
    {
        id: "m1",
        sender: "assistant",
        text: "Bienvenue 👋 Qu’est-ce que je peux faire pour toi aujourd’hui ?",
        date: "2026-04-01T10:00:00",
    },
];

export const mockPlaces: Place[] = [
    {
        id: "l1",
        nom: "Gym Downtown",
        type: "Gym",
        description: "Salle complète proche du centre-ville",
    },
    {
        id: "l2",
        nom: "Parc Montcalm",
        type: "Parc",
        description: "Bon endroit pour courir et marcher",
    },
];