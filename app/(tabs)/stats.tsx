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

export default function StatsScreen() {
    const today = "2026-03-13";

    const [dateChoisie, setDateChoisie] = useState<string>(today);
    const [workoutChoisiId, setWorkoutChoisiId] = useState<string | null>(null);

    const workoutsDuJour = workoutsParDate[dateChoisie] || [];
    const statsAujourdhui = workoutsParDate[today] || [];

    let totalWorkouts = statsAujourdhui.length;
    let totalExercices = 0;

    for (let i = 0; i < statsAujourdhui.length; i++) {
        totalExercices += statsAujourdhui[i].exercices.length;
    }

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
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
            >
                <Text style={{ color: "white", fontSize: 34, fontWeight: "800", marginBottom: 8 }}>
                    Stats
                </Text>

                <Text style={{ color: "#7C8799", fontSize: 15, marginBottom: 18 }}>
                    Ton activité récente
                </Text>

                {/* Carte stats aujourd’hui */}

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
                        Aujourd’hui
                    </Text>

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
                                {totalWorkouts}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Workouts</Text>
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
                                {totalExercices}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Exercices</Text>
                        </View>
                    </View>
                </View>

                {/* Calendrier */}

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
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
                        }}
                    />
                </View>

                {/* Résumé */}

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
                        Résumé
                    </Text>

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
                                            fontSize: 22,
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
            </ScrollView>
        </View>
    );
}
