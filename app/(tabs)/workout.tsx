import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {addSessionWorkout, getSessionWorkouts, subscribeSessionWorkouts,} from "@/data/workoutSession";
import { getEffectiveToday, subscribeTodayOverride } from "@/data/testToday";

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

export default function WorkoutScreen() {
    const [workoutChoisi, setWorkoutChoisi] = useState<TypeWorkout | null>(null);
    const [demarre, setDemarre] = useState(false);
    const [termine, setTermine] = useState(false);
    const [completes, setCompletes] = useState<string[]>([]);
    const [historique, setHistorique] = useState<HistoriqueWorkout[]>([]);
    const [aujourdhui, setAujourdhui] = useState<string>(getEffectiveToday());
    const [sessionWorkouts, setSessionWorkouts] = useState(getSessionWorkouts());

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

    useEffect(() => {
        const unsubscribeToday = subscribeTodayOverride(() => {
            setAujourdhui(getEffectiveToday());
        });

        return () => {
            unsubscribeToday();
        };
    }, []);

    useEffect(() => {
        const unsubscribeWorkouts = subscribeSessionWorkouts(() => {
            setSessionWorkouts([...getSessionWorkouts()]);
        });

        return () => {
            unsubscribeWorkouts();
        };
    }, []);

    let exercices: Exercice[] = [];
    if (workoutChoisi !== null) {
        exercices = plansWorkout[workoutChoisi];
    }

    let pourcentage = 0;
    if (exercices.length > 0) {
        pourcentage = Math.round((completes.length / exercices.length) * 100);
    }

    function choisirWorkout(type: TypeWorkout) {
        setWorkoutChoisi(type);
        setDemarre(false);
        setTermine(false);
        setCompletes([]);
    }

    function demarrerWorkout() {
        if (workoutChoisi !== null) {
            setDemarre(true);
            setTermine(false);
            setCompletes([]);
        }
    }

    function basculerExercice(id: string) {
        if (!demarre || termine) {
            return;
        }

        if (completes.includes(id)) {
            const nouvelleListe = completes.filter((item) => item !== id);
            setCompletes(nouvelleListe);
        } else {
            const nouvelleListe = [...completes, id];
            setCompletes(nouvelleListe);
        }
    }

    function terminerWorkout() {
        if (!demarre || termine || workoutChoisi === null) {
            return;
        }

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

        const workoutPourStats = {
            id: `session-${Date.now()}`,
            title: workoutChoisi,
            date: dateLocale,
            duration: completes.length * 5,
            completed: true,
            exercises: exercicesCompletesPourStats,
        };

        addSessionWorkout(workoutPourStats);

        setTermine(true);
    }

    function nouveauWorkout() {
        setWorkoutChoisi(null);
        setDemarre(false);
        setTermine(false);
        setCompletes([]);
    }

    const workoutsAujourdhui = sessionWorkouts.filter((item) => {
        return item.date === aujourdhui;
    }).length;

    const totalWorkouts = sessionWorkouts.length;

    const totalExercicesCompletes = sessionWorkouts.reduce((total, item) => {
        return total + item.exercises.length;
    }, 0);

    const dernierWorkout = sessionWorkouts.length > 0 ? sessionWorkouts[0] : null;

    return (
        <View style={{ flex: 1, backgroundColor: "#070B14" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 140 }}
            >
                <Text style={{ color: "white", fontSize: 34, fontWeight: "800", marginBottom: 8 }}>
                    Workout
                </Text>

                <Text style={{ color: "#7C8799", fontSize: 15, marginBottom: 18 }}>
                    Choisis une séance
                </Text>

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Tes stats 📊
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 14,
                            }}
                        >
                            <Text style={{ color: "#7C8799", fontSize: 13, marginBottom: 6 }}>
                                Total workouts
                            </Text>
                            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                                {totalWorkouts}
                            </Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 14,
                            }}
                        >
                            <Text style={{ color: "#7C8799", fontSize: 13, marginBottom: 6 }}>
                                Aujourd’hui
                            </Text>
                            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                                {workoutsAujourdhui}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 14,
                            }}
                        >
                            <Text style={{ color: "#7C8799", fontSize: 13, marginBottom: 6 }}>
                                Exos complétés
                            </Text>
                            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                                {totalExercicesCompletes}
                            </Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 14,
                            }}
                        >
                            <Text style={{ color: "#7C8799", fontSize: 13, marginBottom: 6 }}>
                                Dernier workout
                            </Text>
                            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                                {dernierWorkout ? dernierWorkout.title : "Aucun"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
                    {(["Haut du corps", "Bas du corps", "Cardio"] as TypeWorkout[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => choisirWorkout(type)}
                            style={{
                                backgroundColor: workoutChoisi === type ? "#1A2740" : "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {workoutChoisi &&
                    exercices.map((exercice) => {
                        const fait = completes.includes(exercice.id);

                        return (
                            <TouchableOpacity
                                key={exercice.id}
                                onPress={() => basculerExercice(exercice.id)}
                                style={{
                                    backgroundColor: fait ? "#163228" : "#121C2D",
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                    opacity: demarre ? 1 : 0.6,
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16 }}>
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
                                backgroundColor: "#2EE6D6",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ fontWeight: "800" }}>DÉMARRER</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {workoutChoisi && (
                    <View
                        style={{
                            backgroundColor: "#0D1524",
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: "#162033",
                            marginBottom: 20,
                            marginTop: 20,
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 18,
                                fontWeight: "700",
                                marginBottom: 10,
                            }}
                        >
                            Progression : {pourcentage}%
                        </Text>

                        <View
                            style={{
                                height: 10,
                                backgroundColor: "#162033",
                                borderRadius: 999,
                                overflow: "hidden",
                            }}
                        >
                            <View
                                style={{
                                    width: `${pourcentage}%`,
                                    height: "100%",
                                    backgroundColor: "#2EE6D6",
                                }}
                            />
                        </View>

                        <Text style={{ color: "#7C8799", marginTop: 10 }}>
                            {completes.length} / {exercices.length} exercices complétés
                        </Text>
                    </View>
                )}

                {demarre && !termine && (
                    <TouchableOpacity
                        onPress={terminerWorkout}
                        style={{
                            backgroundColor: "#2EE6D6",
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                            marginTop: 20,
                        }}
                    >
                        <Text style={{ fontWeight: "800" }}>Terminer l’entraînement</Text>
                    </TouchableOpacity>
                )}

                {historique.length > 0 && (
                    <View
                        style={{
                            backgroundColor: "#0D1524",
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: "#162033",
                            marginTop: 20,
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
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
                                    backgroundColor: "#121C2D",
                                    borderRadius: 16,
                                    padding: 14,
                                    marginBottom: 10,
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                                    {item.type}
                                </Text>

                                <Text style={{ color: "#7C8799", marginTop: 4 }}>
                                    {item.exercicesCompletes}/{item.exercicesTotal} exercices
                                </Text>

                                <Text style={{ color: "#7C8799", marginTop: 2 }}>
                                    {item.date}
                                </Text>
                            </View>
                        ))}
                    </View>
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
                        backgroundColor: "#070B14",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 30,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 40,
                            color: "#35D07F",
                            fontWeight: "900",
                            marginBottom: 12,
                        }}
                    >
                        Bel effort 🎉
                    </Text>

                    <Text style={{ color: "white", fontSize: 18, marginBottom: 24 }}>
                        Tu as complété {completes.length} exercice(s)
                    </Text>

                    <TouchableOpacity
                        onPress={nouveauWorkout}
                        style={{
                            backgroundColor: "#2EE6D6",
                            borderRadius: 16,
                            paddingVertical: 14,
                            paddingHorizontal: 22,
                        }}
                    >
                        <Text style={{ fontWeight: "800" }}>Faire une autre séance</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}