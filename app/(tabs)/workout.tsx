//Cette classe est générée par IA

import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
    addSessionWorkout,
    getSessionWorkouts,
    subscribeSessionWorkouts,
} from "@/data/workoutSession";
import { getEffectiveToday, subscribeTodayOverride } from "@/data/testToday";
import { useTheme } from "@/context/context";

import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getUiColors } from "@/components/utils/themeUtils";

type TypeWorkout = "Haut du corps" | "Bas du corps" | "Cardio";

type Exercice = {
    id: string;
    label: string;
};

type HistoriqueWorkout = {
    id: string;
    type: TypeWorkout;
    date: string;
    exercicesCompletes: number;
    exercicesTotal: number;
};

const plansWorkout: Record<TypeWorkout, Exercice[]> = {
    "Haut du corps": [
        { id: "hc1", label: "3x12 Push-ups" },
        { id: "hc2", label: "3x10 Développé haltères" },
        { id: "hc3", label: "3x12 Développé épaules" },
        { id: "hc4", label: "3x10 Dips triceps" },
    ],
    "Bas du corps": [
        { id: "bc1", label: "4x12 Squats" },
        { id: "bc2", label: "3x10 Fentes" },
        { id: "bc3", label: "3x12 Ponts fessiers" },
        { id: "bc4", label: "3x15 Mollets debout" },
    ],
    Cardio: [
        { id: "c1", label: "3x40 Jumping Jacks" },
        { id: "c2", label: "3x20 Burpees" },
        { id: "c3", label: "4x30 Montées de genoux" },
        { id: "c4", label: "3x45s Mountain Climbers" },
    ],
};

export default function WorkoutScreen() {
    const { theme } = useTheme();
    const ui = getUiColors(theme);

    const [workoutChoisi, setWorkoutChoisi] = useState<TypeWorkout | null>(null);
    const [demarre, setDemarre] = useState(false);
    const [termine, setTermine] = useState(false);
    const [completes, setCompletes] = useState<string[]>([]);
    const [historique, setHistorique] = useState<HistoriqueWorkout[]>([]);
    const [aujourdhui, setAujourdhui] = useState<string>(getEffectiveToday());
    const [sessionWorkouts, setSessionWorkouts] = useState(getSessionWorkouts());

    useEffect(() => {
        const unsubscribeToday = subscribeTodayOverride(() => {
            setAujourdhui(getEffectiveToday());
        });

        return () => unsubscribeToday();
    }, []);

    useEffect(() => {
        const unsubscribeWorkouts = subscribeSessionWorkouts(() => {
            setSessionWorkouts([...getSessionWorkouts()]);
        });

        return () => unsubscribeWorkouts();
    }, []);

    const exercices = workoutChoisi ? plansWorkout[workoutChoisi] : [];
    const pourcentage =
        exercices.length > 0 ? Math.round((completes.length / exercices.length) * 100) : 0;

    const workoutsAujourdhui = sessionWorkouts.filter(
        (item) => item.date === aujourdhui
    ).length;

    const totalWorkouts = sessionWorkouts.length;

    const totalExercicesCompletes = sessionWorkouts.reduce(
        (total, item) => total + item.exercises.length,
        0
    );

    const dernierWorkout = sessionWorkouts.length > 0 ? sessionWorkouts[0] : null;

    function choisirWorkout(type: TypeWorkout) {
        setWorkoutChoisi(type);
        setDemarre(false);
        setTermine(false);
        setCompletes([]);
    }

    function demarrerWorkout() {
        if (!workoutChoisi) return;

        setDemarre(true);
        setTermine(false);
        setCompletes([]);
    }

    function basculerExercice(id: string) {
        if (!demarre || termine) return;

        setCompletes((ancienneListe) =>
            ancienneListe.includes(id)
                ? ancienneListe.filter((item) => item !== id)
                : [...ancienneListe, id]
        );
    }

    function terminerWorkout() {
        if (!demarre || termine || !workoutChoisi) return;

        const dateLocale = getEffectiveToday();

        const nouveauWorkoutHistorique: HistoriqueWorkout = {
            id: Date.now().toString(),
            type: workoutChoisi,
            date: dateLocale,
            exercicesCompletes: completes.length,
            exercicesTotal: exercices.length,
        };

        setHistorique((ancienneListe) => [nouveauWorkoutHistorique, ...ancienneListe]);

        const exercicesCompletesPourStats = exercices
            .filter((exercice) => completes.includes(exercice.id))
            .map((exercice) => ({
                id: exercice.id,
                name: exercice.label,
                sets: 1,
                reps: 1,
                weight: undefined,
            }));

        addSessionWorkout({
            id: `session-${Date.now()}`,
            title: workoutChoisi,
            date: dateLocale,
            duration: completes.length * 5,
            completed: true,
            exercises: exercicesCompletesPourStats,
        });

        setTermine(true);
    }

    function nouveauWorkout() {
        setWorkoutChoisi(null);
        setDemarre(false);
        setTermine(false);
        setCompletes([]);
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
                        Tes stats 📊
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <StatCard label="Total workouts" value={totalWorkouts} ui={ui} />
                        <StatCard label="Aujourd’hui" value={workoutsAujourdhui} ui={ui} />
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
                    {(["Haut du corps", "Bas du corps", "Cardio"] as TypeWorkout[]).map(
                        (type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => choisirWorkout(type)}
                                style={{
                                    backgroundColor:
                                        workoutChoisi === type ? ui.selectedCard : ui.cardSecondary,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: ui.textPrimary,
                                        fontSize: 16,
                                        fontWeight: "700",
                                    }}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </SectionCard>

                {workoutChoisi &&
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

                {workoutChoisi && !demarre && (
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

                {workoutChoisi && (
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
                            Terminer l’entraînement
                        </Text>
                    </TouchableOpacity>
                )}

                {historique.length > 0 && (
                    <SectionCard ui={ui} marginBottom={0}>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 18,
                                fontWeight: "700",
                                marginBottom: 14,
                            }}
                        >
                            Historique 🕓
                        </Text>

                        {historique.map((item) => (
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
                                    {item.type}
                                </Text>

                                <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                    {item.exercicesCompletes}/{item.exercicesTotal} exercices
                                </Text>

                                <Text style={{ color: ui.textMuted, marginTop: 2 }}>
                                    {item.date}
                                </Text>
                            </View>
                        ))}
                    </SectionCard>
                )}
            </ScrollView>

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
                        Bel effort 🎉
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