import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

type Exercice = {
    id: string;
    label: string;
};

type WorkoutJour = {
    id: string;
    titre: string;
    exercices: Exercice[];
};

type WorkoutsParDate = {
    [date: string]: WorkoutJour[];
};

type JourCalendrier = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

const workoutsParDate: WorkoutsParDate = {
    "2026-03-13": [
        {
            id: "w1",
            titre: "Haut du corps",
            exercices: [
                { id: "e1", label: "3x12 Push-ups" },
                { id: "e2", label: "3x10 Développé haltères" },
                { id: "e3", label: "3x12 Développé épaules" },
            ],
        },
    ],
    "2026-03-14": [
        {
            id: "w2",
            titre: "Bas du corps",
            exercices: [
                { id: "e4", label: "4x12 Squats" },
                { id: "e5", label: "3x10 Fentes" },
                { id: "e6", label: "3x12 Ponts fessiers" },
            ],
        },
    ],
    "2026-03-15": [
        {
            id: "w3",
            titre: "Cardio",
            exercices: [
                { id: "e7", label: "3x40 Jumping Jacks" },
                { id: "e8", label: "3x20 Burpees" },
                { id: "e9", label: "4x30 Montées de genoux" },
            ],
        },
        {
            id: "w4",
            titre: "Abdos",
            exercices: [
                { id: "e10", label: "3x20 Crunchs" },
                { id: "e11", label: "3x30s Planche" },
            ],
        },
    ],
};

export default function ProfileScreen() {
    const today = "2026-03-13";

    const [dateChoisie, setDateChoisie] = useState<string>(today);
    const [workoutChoisiId, setWorkoutChoisiId] = useState<string | null>(null);

    const workoutsDuJour = workoutsParDate[dateChoisie] || [];

    let totalWorkouts = 0;
    let totalExercices = 0;

    for (const date in workoutsParDate) {
        totalWorkouts += workoutsParDate[date].length;

        for (let i = 0; i < workoutsParDate[date].length; i++) {
            totalExercices += workoutsParDate[date][i].exercices.length;
        }
    }

    const joursActifs = Object.keys(workoutsParDate).length;
    const amis = 12;
    const streak = 7;

    let markedDates: {
        [date: string]: {
            marked?: boolean;
            dotColor?: string;
            selected?: boolean;
            selectedColor?: string;
        };
    } = {};

    for (const date in workoutsParDate) {
        markedDates[date] = {
            marked: true,
            dotColor: "#2EE6D6",
        };
    }

    markedDates[dateChoisie] = {
        ...(markedDates[dateChoisie] || {}),
        selected: true,
        selectedColor: "#2EE6D6",
    };

    let workoutChoisi: WorkoutJour | null = null;

    if (workoutChoisiId !== null) {
        const trouve = workoutsDuJour.find((item) => item.id === workoutChoisiId);
        if (trouve) {
            workoutChoisi = trouve;
        }
    }

    function choisirJour(day: JourCalendrier) {
        setDateChoisie(day.dateString);

        const liste = workoutsParDate[day.dateString] || [];
        if (liste.length > 0) {
            setWorkoutChoisiId(liste[0].id);
        } else {
            setWorkoutChoisiId(null);
        }
    }

    function choisirWorkout(id: string) {
        setWorkoutChoisiId(id);
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#070B14" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 140 }}
            >
                <Text style={{ color: "white", fontSize: 34, fontWeight: "800", marginBottom: 18 }}>
                    Profil
                </Text>

                {/* Haut du profil */}

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 92,
                            height: 92,
                            borderRadius: 46,
                            backgroundColor: "#2EE6D6",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 14,
                        }}
                    >
                        <Text style={{ fontSize: 30, fontWeight: "900", color: "#070B14" }}>
                            J
                        </Text>
                    </View>

                    <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 4 }}>
                        Jougbouny
                    </Text>

                    <Text style={{ color: "#7C8799", fontSize: 15, marginBottom: 10 }}>
                        @jougbounyfit
                    </Text>

                    <View
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 999,
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                        }}
                    >
                        <Text style={{ color: "#7DD3FC", fontSize: 15, fontWeight: "800" }}>
                            Diamant
                        </Text>
                    </View>
                </View>

                {/* Stats */}

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
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Mes stats
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
                                {totalWorkouts}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Workouts complétés</Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
                                {joursActifs}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Jours actifs</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
                                {amis}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Amis</Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
                                {streak}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Streak</Text>
                        </View>
                    </View>
                </View>

                {/* Calendrier + liste */}

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
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Workouts complétés
                    </Text>

                    <Calendar
                        current={today}
                        onDayPress={choisirJour}
                        markedDates={markedDates}
                        enableSwipeMonths={true}
                        hideExtraDays={false}
                        firstDay={1}
                        theme={{
                            backgroundColor: "#0D1524",
                            calendarBackground: "#0D1524",
                            textSectionTitleColor: "#7C8799",
                            selectedDayBackgroundColor: "#2EE6D6",
                            selectedDayTextColor: "#070B14",
                            todayTextColor: "#2EE6D6",
                            dayTextColor: "#FFFFFF",
                            textDisabledColor: "#3A465C",
                            monthTextColor: "#FFFFFF",
                            arrowColor: "#2EE6D6",
                        }}
                        style={{
                            borderRadius: 16,
                            marginBottom: 16,
                        }}
                    />

                    {workoutsDuJour.length === 0 && (
                        <Text style={{ color: "#7C8799", fontSize: 15 }}>
                            Aucun workout pour cette date
                        </Text>
                    )}

                    {workoutsDuJour.length > 0 && (
                        <>
                            {workoutsDuJour.map((workout) => (
                                <TouchableOpacity
                                    key={workout.id}
                                    onPress={() => choisirWorkout(workout.id)}
                                    style={{
                                        backgroundColor:
                                            workoutChoisiId === workout.id ? "#2EE6D6" : "#121C2D",
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: workoutChoisiId === workout.id ? "#070B14" : "white",
                                            fontSize: 16,
                                            fontWeight: "700",
                                        }}
                                    >
                                        {workout.titre}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {workoutChoisi && (
                                <View
                                    style={{
                                        backgroundColor: "#121C2D",
                                        borderRadius: 16,
                                        padding: 16,
                                        marginTop: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "white",
                                            fontSize: 21,
                                            fontWeight: "800",
                                            marginBottom: 14,
                                        }}
                                    >
                                        {workoutChoisi.titre}
                                    </Text>

                                    {workoutChoisi.exercices.map((exercice) => (
                                        <View
                                            key={exercice.id}
                                            style={{
                                                backgroundColor: "#182335",
                                                borderRadius: 12,
                                                padding: 14,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <Text style={{ color: "white", fontSize: 15 }}>
                                                {exercice.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* Objectif */}

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
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Objectif actuel
                    </Text>

                    <View
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 16, lineHeight: 24 }}>
                            Perdre du gras / gagner en discipline
                        </Text>
                    </View>
                </View>

                {/* Badges */}

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
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Badges
                    </Text>

                    <View
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 10,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                            🔥 7 jours d’affilée
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 10,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                            ✅ Premier workout
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                            💯 100 exercices
                        </Text>
                    </View>
                </View>

                {/* Boutons bas */}

                <TouchableOpacity
                    style={{
                        backgroundColor: "#2EE6D6",
                        borderRadius: 16,
                        padding: 16,
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ color: "#070B14", fontWeight: "800", fontSize: 15 }}>
                        Modifier le profil
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        backgroundColor: "#121C2D",
                        borderRadius: 16,
                        padding: 16,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "800", fontSize: 15 }}>
                        Paramètres
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}