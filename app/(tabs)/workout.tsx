import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type TypeWorkout = "Haut du corps" | "Bas du corps" | "Cardio";

type Exercice = {
    id: string;
    label: string;
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

    const [workoutChoisi, setWorkoutChoisi] = useState<TypeWorkout | null>(null);
    const [demarre, setDemarre] = useState(false);
    const [termine, setTermine] = useState(false);
    const [completes, setCompletes] = useState<string[]>([]);

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
        if (!demarre) {
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
        setTermine(true);
    }

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

                {/* Barre de progression */}

                <View style={{
                    backgroundColor: "#0D1524",
                    borderRadius: 20,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: "#162033",
                    marginBottom: 20
                }}>

                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
                        Progression : {pourcentage}%
                    </Text>

                    <View style={{
                        height: 10,
                        backgroundColor: "#162033",
                        borderRadius: 999,
                        overflow: "hidden"
                    }}>
                        <View style={{
                            width: `${pourcentage}%`,
                            height: "100%",
                            backgroundColor: "#2EE6D6"
                        }}/>
                    </View>

                </View>

                {/* Choix du workout */}

                <View style={{
                    backgroundColor: "#0D1524",
                    borderRadius: 20,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: "#162033",
                    marginBottom: 20
                }}>

                    {(["Haut du corps", "Bas du corps", "Cardio"] as TypeWorkout[]).map((type) => (

                        <TouchableOpacity
                            key={type}
                            onPress={() => choisirWorkout(type)}
                            style={{
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                                {type}
                            </Text>

                        </TouchableOpacity>

                    ))}

                </View>

                {/* Liste des exercices */}

                {workoutChoisi && exercices.map((exercice) => {

                    const fait = completes.includes(exercice.id);

                    return (

                        <TouchableOpacity
                            key={exercice.id}
                            onPress={() => basculerExercice(exercice.id)}
                            style={{
                                backgroundColor: fait ? "#163228" : "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12
                            }}
                        >

                            <Text style={{ color: "white", fontSize: 16 }}>
                                {exercice.label}
                            </Text>

                        </TouchableOpacity>

                    );

                })}

                {/* Bouton démarrer */}

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
                                justifyContent: "center"
                            }}
                        >

                            <Text style={{ fontWeight: "800" }}>
                                DÉMARRER
                            </Text>

                        </TouchableOpacity>

                    </View>

                )}

                {/* Bouton terminer */}

                {demarre && !termine && (

                    <TouchableOpacity
                        onPress={terminerWorkout}
                        style={{
                            backgroundColor: "#2EE6D6",
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                            marginTop: 20
                        }}
                    >

                        <Text style={{ fontWeight: "800" }}>
                            Terminer l’entraînement
                        </Text>

                    </TouchableOpacity>

                )}

            </ScrollView>

            {/* Message final */}

            {termine && (

                <View style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#070B14",
                    alignItems: "center",
                    justifyContent: "center"
                }}>

                    <Text style={{
                        fontSize: 40,
                        color: "#35D07F",
                        fontWeight: "900"
                    }}>
                        Bel effort 🎉
                    </Text>

                </View>

            )}

        </View>
    );
}