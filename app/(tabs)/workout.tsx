//Généré par IA

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/context";
import { useWorkouts } from "@/context/WorkoutContext";

import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getUiColors } from "@/components/utils/themeUtils";
import { toLocalDateString } from "@/components/utils/dateUtils";

type ExerciceModele = {
    id: string;
    label: string;
};

type ModeleWorkout = {
    id: string;
    title: string;
    exercises: ExerciceModele[];
};

const STORAGE_KEY = "endorphine_workout_templates_v1";

// Liste de workouts par defaut avant personnalisation.
const DEFAULT_WORKOUTS: ModeleWorkout[] = [
    {
        id: "upper",
        title: "Haut du corps",
        exercises: [
            { id: "upper-1", label: "3x12 Push-ups" },
            { id: "upper-2", label: "3x10 Développé haltères" },
            { id: "upper-3", label: "3x12 Rowing haltères" },
            { id: "upper-4", label: "3x12 Développé épaules" },
            { id: "upper-5", label: "3x10 Dips triceps" },
        ],
    },
    {
        id: "lower",
        title: "Bas du corps",
        exercises: [
            { id: "lower-1", label: "4x12 Squats" },
            { id: "lower-2", label: "3x10 Fentes" },
            { id: "lower-3", label: "3x12 Ponts fessiers" },
            { id: "lower-4", label: "3x10 Romanian deadlift" },
            { id: "lower-5", label: "3x15 Mollets debout" },
        ],
    },
    {
        id: "cardio",
        title: "Cardio",
        exercises: [
            { id: "cardio-1", label: "5 min échauffement" },
            { id: "cardio-2", label: "12 min course légère" },
            { id: "cardio-3", label: "6x30s accélérations" },
            { id: "cardio-4", label: "5 min marche rapide" },
        ],
    },
    {
        id: "push",
        title: "Push",
        exercises: [
            { id: "push-1", label: "4x8 Bench press" },
            { id: "push-2", label: "3x10 Incline press" },
            { id: "push-3", label: "3x12 Shoulder press" },
            { id: "push-4", label: "3x15 Élévations latérales" },
            { id: "push-5", label: "3x12 Triceps extension" },
        ],
    },
    {
        id: "pull",
        title: "Pull",
        exercises: [
            { id: "pull-1", label: "4x8 Tirage vertical" },
            { id: "pull-2", label: "4x10 Rowing" },
            { id: "pull-3", label: "3x12 Face pull" },
            { id: "pull-4", label: "3x10 Curl biceps" },
            { id: "pull-5", label: "3x12 Curl marteau" },
        ],
    },
    {
        id: "legs",
        title: "Jambes",
        exercises: [
            { id: "legs-1", label: "4x8 Squat ou leg press" },
            { id: "legs-2", label: "3x10 Hip thrust" },
            { id: "legs-3", label: "3x12 Leg curl" },
            { id: "legs-4", label: "3x12 Leg extension" },
            { id: "legs-5", label: "4x15 Mollets" },
        ],
    },
    {
        id: "full-body",
        title: "Full body",
        exercises: [
            { id: "full-1", label: "3x10 Squat" },
            { id: "full-2", label: "3x10 Développé couché" },
            { id: "full-3", label: "3x10 Rowing" },
            { id: "full-4", label: "3x12 Shoulder press" },
            { id: "full-5", label: "3x30s Gainage" },
        ],
    },
    {
        id: "core",
        title: "Abdos & gainage",
        exercises: [
            { id: "core-1", label: "3x45s Planche" },
            { id: "core-2", label: "3x20 Crunchs" },
            { id: "core-3", label: "3x12 Relevés de jambes" },
            { id: "core-4", label: "3x30s Side plank" },
            { id: "core-5", label: "3x20 Mountain climbers" },
        ],
    },
    {
        id: "hiit",
        title: "HIIT rapide",
        exercises: [
            { id: "hiit-1", label: "4x40 Jumping jacks" },
            { id: "hiit-2", label: "4x12 Burpees" },
            { id: "hiit-3", label: "4x30s Montées de genoux" },
            { id: "hiit-4", label: "4x30s Mountain climbers" },
            { id: "hiit-5", label: "4x20 Squat jumps" },
        ],
    },
];

// Creation d'un identifiant local pour les listes et exercices.
function creerId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

export default function WorkoutScreen() {
    // Initialisation du theme et du contexte workouts.
    const { theme } = useTheme();
    const { workouts, addWorkout } = useWorkouts();
    const ui = getUiColors(theme);

    // Initialisation des variables de la seance.
    const [modeles, setModeles] = useState<ModeleWorkout[]>(DEFAULT_WORKOUTS);
    const [workoutChoisiId, setWorkoutChoisiId] = useState<string | null>(null);
    const [demarre, setDemarre] = useState(false);
    const [termine, setTermine] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [completes, setCompletes] = useState<string[]>([]);
    const [modalEditionVisible, setModalEditionVisible] = useState(false);
    const [modeleEditionId, setModeleEditionId] = useState(DEFAULT_WORKOUTS[0].id);
    const [titreEdition, setTitreEdition] = useState(DEFAULT_WORKOUTS[0].title);
    const [nouveauTitreWorkout, setNouveauTitreWorkout] = useState("");
    const [nouvelExercice, setNouvelExercice] = useState("");
    const [exerciceDrafts, setExerciceDrafts] = useState<Record<string, string>>({});

    const aujourdhui = toLocalDateString(new Date());

    // Chargement des modeles personnalises depuis le stockage local.
    useEffect(() => {
        async function chargerModeles() {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);

            if (!saved) return;

            try {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed) && parsed.length > 0) {
                    setModeles(parsed);
                    setModeleEditionId(parsed[0].id);
                    setTitreEdition(parsed[0].title);
                }
            } catch {
                await AsyncStorage.removeItem(STORAGE_KEY);
            }
        }

        chargerModeles();
    }, []);

    // Recuperation du workout choisi par l'utilisateur.
    const modeleChoisi = useMemo(
        () => modeles.find((modele) => modele.id === workoutChoisiId) || null,
        [modeles, workoutChoisiId]
    );

    // Recuperation du modele en cours d'edition.
    const modeleEdition = useMemo(
        () => modeles.find((modele) => modele.id === modeleEditionId) || modeles[0],
        [modeles, modeleEditionId]
    );

    const exercices = modeleChoisi?.exercises || [];
    // Calcul de la progression de la seance.
    const pourcentage =
        exercices.length > 0 ? Math.round((completes.length / exercices.length) * 100) : 0;

    const workoutsAujourdhui = workouts.filter(
        (item) => item.date === aujourdhui
    ).length;

    const totalWorkouts = workouts.length;
    // Calcul des statistiques rapides de l'ecran Workout.
    const totalExercicesCompletes = workouts.reduce(
        (total, item) => total + item.exercises.length,
        0
    );
    const dernierWorkout = workouts.length > 0 ? workouts[0] : null;

    // Sauvegarde des modeles personnalises dans le stockage local.
    async function sauvegarderModeles(nextModeles: ModeleWorkout[]) {
        setModeles(nextModeles);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextModeles));
    }

    // Choix d'un workout dans la liste.
    function choisirWorkout(id: string) {
        setWorkoutChoisiId(id);
        setDemarre(false);
        setTermine(false);
        setError("");
        setCompletes([]);
    }

    // Demarrage de la seance choisie.
    function demarrerWorkout() {
        if (!modeleChoisi || modeleChoisi.exercises.length === 0) {
            setError("Ajoute au moins un exercice avant de démarrer.");
            return;
        }

        setDemarre(true);
        setTermine(false);
        setError("");
        setCompletes([]);
    }

    // Validation ou retrait d'un exercice pendant la seance.
    function basculerExercice(id: string) {
        if (!demarre || termine) return;

        setCompletes((ancienneListe) =>
            ancienneListe.includes(id)
                ? ancienneListe.filter((item) => item !== id)
                : [...ancienneListe, id]
        );
    }

    // Sauvegarde du workout termine dans MongoDB.
    async function terminerWorkout() {
        if (!demarre || termine || !modeleChoisi || saving) return;

        const dateLocale = toLocalDateString(new Date());
        const exercicesCompletesPourStats = exercices
            .filter((exercice) => completes.includes(exercice.id))
            .map((exercice) => ({
                id: exercice.id,
                name: exercice.label,
                sets: 1,
                reps: 1,
                weight: undefined,
            }));

        try {
            setSaving(true);
            setError("");
            await addWorkout({
                title: modeleChoisi.title,
                date: dateLocale,
                duration: completes.length * 5,
                completed: true,
                exercises: exercicesCompletesPourStats,
            });

            setTermine(true);
        } catch (e: any) {
            setError(e.message || "Erreur sauvegarde workout");
        } finally {
            setSaving(false);
        }
    }

    // Remise a zero apres une seance terminee.
    function nouveauWorkout() {
        setWorkoutChoisiId(null);
        setDemarre(false);
        setTermine(false);
        setError("");
        setCompletes([]);
    }

    // Ouverture de la modale de modification des listes.
    function ouvrirEdition() {
        const premierModele = modeleChoisi || modeles[0];
        setModeleEditionId(premierModele.id);
        setTitreEdition(premierModele.title);
        setExerciceDrafts(
            Object.fromEntries(premierModele.exercises.map((exercice) => [exercice.id, exercice.label]))
        );
        setModalEditionVisible(true);
    }

    // Selection du modele a modifier.
    function choisirModeleEdition(id: string) {
        const modele = modeles.find((item) => item.id === id);
        if (!modele) return;

        setModeleEditionId(modele.id);
        setTitreEdition(modele.title);
        setExerciceDrafts(
            Object.fromEntries(modele.exercises.map((exercice) => [exercice.id, exercice.label]))
        );
    }

    // Renommage d'une liste de workout.
    async function renommerWorkout() {
        const titre = titreEdition.trim();
        if (!titre || !modeleEdition) return;

        const next = modeles.map((modele) =>
            modele.id === modeleEdition.id ? { ...modele, title: titre } : modele
        );

        await sauvegarderModeles(next);
    }

    // Ajout d'une nouvelle liste de workout.
    async function ajouterWorkoutModele() {
        const titre = nouveauTitreWorkout.trim();
        if (!titre) return;

        const nouveauModele: ModeleWorkout = {
            id: creerId("workout"),
            title: titre,
            exercises: [],
        };
        const next = [...modeles, nouveauModele];

        setNouveauTitreWorkout("");
        setModeleEditionId(nouveauModele.id);
        setTitreEdition(nouveauModele.title);
        setExerciceDrafts({});
        await sauvegarderModeles(next);
    }

    // Suppression d'une liste de workout.
    async function supprimerWorkoutModele() {
        if (!modeleEdition || modeles.length <= 1) return;

        const next = modeles.filter((modele) => modele.id !== modeleEdition.id);
        const prochain = next[0];

        setModeleEditionId(prochain.id);
        setTitreEdition(prochain.title);
        setExerciceDrafts(
            Object.fromEntries(prochain.exercises.map((exercice) => [exercice.id, exercice.label]))
        );

        if (workoutChoisiId === modeleEdition.id) {
            nouveauWorkout();
        }

        await sauvegarderModeles(next);
    }

    // Ajout d'un exercice dans la liste selectionnee.
    async function ajouterExercice() {
        if (!modeleEdition) return;

        const label = nouvelExercice.trim();
        if (!label) return;

        const exercice = { id: creerId("exercise"), label };
        const next = modeles.map((modele) =>
            modele.id === modeleEdition.id
                ? { ...modele, exercises: [...modele.exercises, exercice] }
                : modele
        );

        setNouvelExercice("");
        setExerciceDrafts((current) => ({ ...current, [exercice.id]: exercice.label }));
        await sauvegarderModeles(next);
    }

    // Renommage d'un exercice existant.
    async function renommerExercice(exerciceId: string) {
        if (!modeleEdition) return;

        const label = (exerciceDrafts[exerciceId] || "").trim();
        if (!label) return;

        const next = modeles.map((modele) =>
            modele.id === modeleEdition.id
                ? {
                    ...modele,
                    exercises: modele.exercises.map((exercice) =>
                        exercice.id === exerciceId ? { ...exercice, label } : exercice
                    ),
                }
                : modele
        );

        await sauvegarderModeles(next);
    }

    // Suppression d'un exercice existant.
    async function supprimerExercice(exerciceId: string) {
        if (!modeleEdition) return;

        const next = modeles.map((modele) =>
            modele.id === modeleEdition.id
                ? {
                    ...modele,
                    exercises: modele.exercises.filter((exercice) => exercice.id !== exerciceId),
                }
                : modele
        );

        setCompletes((current) => current.filter((id) => id !== exerciceId));
        setExerciceDrafts((current) => {
            const copy = { ...current };
            delete copy[exerciceId];
            return copy;
        });
        await sauvegarderModeles(next);
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 140 }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 8,
                    }}
                >
                    Workout
                </Text>

                <Text style={{ color: ui.textMuted, fontSize: 15, marginBottom: 18 }}>
                    Choisis une séance
                </Text>

                <SectionCard ui={ui}>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Tes stats
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <StatCard label="Total workouts" value={totalWorkouts} ui={ui} />
                        <StatCard label="Aujourd'hui" value={workoutsAujourdhui} ui={ui} />
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <StatCard
                            label="Exos complétés"
                            value={totalExercicesCompletes}
                            ui={ui}
                        />
                        <StatCard
                            label="Dernier workout"
                            value={dernierWorkout ? dernierWorkout.title : "Aucun"}
                            ui={ui}
                        />
                    </View>
                </SectionCard>

                <SectionCard ui={ui}>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Liste de workouts
                    </Text>

                    {modeles.map((modele) => (
                        <TouchableOpacity
                            key={modele.id}
                            onPress={() => choisirWorkout(modele.id)}
                            style={{
                                backgroundColor:
                                    workoutChoisiId === modele.id ? ui.selectedCard : ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: workoutChoisiId === modele.id ? ui.accent : ui.border,
                            }}
                        >
                            <Text
                                style={{
                                    color: ui.textPrimary,
                                    fontSize: 16,
                                    fontWeight: "800",
                                }}
                            >
                                {modele.title}
                            </Text>
                            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                {modele.exercises.length} exercice(s)
                            </Text>
                        </TouchableOpacity>
                    ))}
                </SectionCard>

                {modeleChoisi &&
                    exercices.map((exercice) => {
                        const fait = completes.includes(exercice.id);

                        return (
                            <TouchableOpacity
                                key={exercice.id}
                                onPress={() => basculerExercice(exercice.id)}
                                style={{
                                    backgroundColor: fait ? ui.successCard : ui.cardSecondary,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                    opacity: demarre ? 1 : 0.6,
                                }}
                            >
                                <Text style={{ color: ui.textPrimary, fontSize: 16 }}>
                                    {exercice.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                {modeleChoisi && !demarre && (
                    <View style={{ alignItems: "center", marginTop: 20 }}>
                        <TouchableOpacity
                            onPress={demarrerWorkout}
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                backgroundColor: ui.accent,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ fontWeight: "800", color: ui.accentText }}>
                                DÉMARRER
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {modeleChoisi && (
                    <SectionCard ui={ui}>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 18,
                                fontWeight: "700",
                                marginBottom: 10,
                            }}
                        >
                            Progression : {pourcentage}%
                        </Text>

                        <ProgressBar value={pourcentage} ui={ui} />

                        <Text style={{ color: ui.textMuted, marginTop: 10 }}>
                            {completes.length} / {exercices.length} exercices complétés
                        </Text>
                    </SectionCard>
                )}

                {demarre && !termine && (
                    <>
                        {error ? (
                            <View
                                style={{
                                    backgroundColor: "#3B0D0D",
                                    borderColor: "#EF4444",
                                    borderWidth: 1,
                                    borderRadius: 14,
                                    padding: 12,
                                    marginTop: 12,
                                }}
                            >
                                <Text style={{ color: "#FCA5A5", textAlign: "center" }}>
                                    {error}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            onPress={terminerWorkout}
                            style={{
                                backgroundColor: ui.accent,
                                borderRadius: 16,
                                padding: 16,
                                alignItems: "center",
                                marginTop: 20,
                            }}
                        >
                            <Text style={{ fontWeight: "800", color: ui.accentText }}>
                                {saving ? "Sauvegarde..." : "Terminer l'entraînement"}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {workouts.length > 0 && (
                    <SectionCard ui={ui}>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 18,
                                fontWeight: "700",
                                marginBottom: 14,
                            }}
                        >
                            Historique
                        </Text>

                        {workouts.slice(0, 5).map((item) => (
                            <View
                                key={item.id}
                                style={{
                                    backgroundColor: ui.cardSecondary,
                                    borderRadius: 16,
                                    padding: 14,
                                    marginBottom: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: ui.textPrimary,
                                        fontSize: 16,
                                        fontWeight: "700",
                                    }}
                                >
                                    {item.title}
                                </Text>

                                <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                    {item.exercises.length} exercice(s) • {item.duration} min
                                </Text>

                                <Text style={{ color: ui.textMuted, marginTop: 2 }}>
                                    {item.date}
                                </Text>
                            </View>
                        ))}
                    </SectionCard>
                )}

                <TouchableOpacity
                    onPress={ouvrirEdition}
                    style={{
                        backgroundColor: ui.cardSecondary,
                        borderRadius: 16,
                        padding: 16,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 10,
                    }}
                >
                    <Text style={{ color: ui.textPrimary, fontWeight: "800", fontSize: 15 }}>
                        Modifier liste de workouts
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={modalEditionVisible} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        padding: 20,
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: ui.border,
                            maxHeight: "90%",
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 22,
                                fontWeight: "800",
                                marginBottom: 14,
                            }}
                        >
                            Modifier les workouts
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={{ color: ui.textMuted, marginBottom: 8 }}>
                                Choisir une liste
                            </Text>

                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                                {modeles.map((modele) => (
                                    <TouchableOpacity
                                        key={modele.id}
                                        onPress={() => choisirModeleEdition(modele.id)}
                                        style={{
                                            backgroundColor:
                                                modeleEditionId === modele.id ? ui.accent : ui.cardSecondary,
                                            borderRadius: 12,
                                            paddingVertical: 10,
                                            paddingHorizontal: 12,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color:
                                                    modeleEditionId === modele.id
                                                        ? ui.accentText
                                                        : ui.textPrimary,
                                                fontWeight: "800",
                                            }}
                                        >
                                            {modele.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                                Nom du workout
                            </Text>
                            <TextInput
                                value={titreEdition}
                                onChangeText={setTitreEdition}
                                style={{
                                    backgroundColor: ui.cardSecondary,
                                    color: ui.textPrimary,
                                    borderRadius: 14,
                                    padding: 14,
                                    borderWidth: 1,
                                    borderColor: ui.border,
                                    marginBottom: 10,
                                }}
                            />

                            <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
                                <TouchableOpacity
                                    onPress={renommerWorkout}
                                    style={{
                                        flex: 1,
                                        backgroundColor: ui.accent,
                                        borderRadius: 14,
                                        padding: 14,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                                        Renommer
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={supprimerWorkoutModele}
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#3B0D0D",
                                        borderRadius: 14,
                                        padding: 14,
                                        alignItems: "center",
                                        opacity: modeles.length <= 1 ? 0.5 : 1,
                                    }}
                                >
                                    <Text style={{ color: "#FCA5A5", fontWeight: "800" }}>
                                        Supprimer
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: ui.textMuted, marginBottom: 8 }}>
                                Exercices
                            </Text>

                            {modeleEdition?.exercises.map((exercice) => (
                                <View
                                    key={exercice.id}
                                    style={{
                                        backgroundColor: ui.cardSecondary,
                                        borderRadius: 14,
                                        padding: 12,
                                        marginBottom: 10,
                                    }}
                                >
                                    <TextInput
                                        value={exerciceDrafts[exercice.id] ?? exercice.label}
                                        onChangeText={(value) =>
                                            setExerciceDrafts((current) => ({
                                                ...current,
                                                [exercice.id]: value,
                                            }))
                                        }
                                        onEndEditing={() => renommerExercice(exercice.id)}
                                        style={{
                                            color: ui.textPrimary,
                                            fontSize: 15,
                                            fontWeight: "700",
                                            borderBottomWidth: 1,
                                            borderBottomColor: ui.border,
                                            paddingBottom: 8,
                                            marginBottom: 10,
                                        }}
                                    />

                                    <TouchableOpacity
                                        onPress={() => supprimerExercice(exercice.id)}
                                        style={{
                                            alignSelf: "flex-start",
                                            backgroundColor: "#3B0D0D",
                                            borderRadius: 12,
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                        }}
                                    >
                                        <Text style={{ color: "#FCA5A5", fontWeight: "800" }}>
                                            Supprimer exercice
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TextInput
                                value={nouvelExercice}
                                onChangeText={setNouvelExercice}
                                placeholder="Nouvel exercice"
                                placeholderTextColor={ui.textMuted}
                                style={{
                                    backgroundColor: ui.cardSecondary,
                                    color: ui.textPrimary,
                                    borderRadius: 14,
                                    padding: 14,
                                    borderWidth: 1,
                                    borderColor: ui.border,
                                    marginTop: 6,
                                    marginBottom: 10,
                                }}
                            />

                            <TouchableOpacity
                                onPress={ajouterExercice}
                                style={{
                                    backgroundColor: ui.accent,
                                    borderRadius: 14,
                                    padding: 14,
                                    alignItems: "center",
                                    marginBottom: 18,
                                }}
                            >
                                <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                                    Ajouter exercice
                                </Text>
                            </TouchableOpacity>

                            <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                                Ajouter une nouvelle liste
                            </Text>
                            <TextInput
                                value={nouveauTitreWorkout}
                                onChangeText={setNouveauTitreWorkout}
                                placeholder="Nom du nouveau workout"
                                placeholderTextColor={ui.textMuted}
                                style={{
                                    backgroundColor: ui.cardSecondary,
                                    color: ui.textPrimary,
                                    borderRadius: 14,
                                    padding: 14,
                                    borderWidth: 1,
                                    borderColor: ui.border,
                                    marginBottom: 10,
                                }}
                            />

                            <TouchableOpacity
                                onPress={ajouterWorkoutModele}
                                style={{
                                    backgroundColor: ui.cardSecondary,
                                    borderRadius: 14,
                                    padding: 14,
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: ui.border,
                                    marginBottom: 18,
                                }}
                            >
                                <Text style={{ color: ui.textPrimary, fontWeight: "800" }}>
                                    Ajouter workout
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setModalEditionVisible(false)}
                            style={{
                                backgroundColor: ui.accent,
                                borderRadius: 14,
                                padding: 14,
                                alignItems: "center",
                                marginTop: 12,
                            }}
                        >
                            <Text style={{ color: ui.accentText, fontWeight: "900" }}>
                                Fermer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {termine && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: ui.overlay,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 30,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 40,
                            color: ui.successText,
                            fontWeight: "900",
                            marginBottom: 12,
                        }}
                    >
                        Bel effort
                    </Text>

                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            marginBottom: 24,
                        }}
                    >
                        Tu as complété {completes.length} exercice(s)
                    </Text>

                    <TouchableOpacity
                        onPress={nouveauWorkout}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 16,
                            paddingVertical: 14,
                            paddingHorizontal: 22,
                        }}
                    >
                        <Text style={{ fontWeight: "800", color: ui.accentText }}>
                            Faire une autre séance
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
