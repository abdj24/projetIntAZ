import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { mockUser, mockWeightHistory, mockWorkouts } from "@/data/mockData";
import { Workout } from "@/types/models";
import {getSessionWorkouts, subscribeSessionWorkouts, clearSessionWorkouts,} from "@/data/workoutSession";
import {getEffectiveToday, getTodayOverride, setTodayOverride, subscribeTodayOverride,} from "@/data/testToday";

type JourCalendrier = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

type MarkedDates = {
    [date: string]: {
        marked?: boolean;
        dotColor?: string;
        selected?: boolean;
        selectedColor?: string;
    };
};

export default function StatsScreen() {
    const [today, setToday] = useState<string>(getEffectiveToday());
    const [dateChoisie, setDateChoisie] = useState<string>(getEffectiveToday());
    const [workoutChoisiId, setWorkoutChoisiId] = useState<string | null>(null);
    const [sessionWorkouts, setSessionWorkouts] = useState<Workout[]>(getSessionWorkouts());

    useEffect(() => {
        const unsubscribeWorkouts = subscribeSessionWorkouts(() => {
            setSessionWorkouts([...getSessionWorkouts()]);
        });

        const unsubscribeToday = subscribeTodayOverride(() => {
            const nouveauToday = getEffectiveToday();
            setToday(nouveauToday);
            setDateChoisie(nouveauToday);
        });

        return () => {
            unsubscribeWorkouts();
            unsubscribeToday();
        };
    }, []);

    const tousLesWorkouts = useMemo(() => {
        return [...sessionWorkouts, ...mockWorkouts];
    }, [sessionWorkouts]);

    const workoutsParDate = useMemo(() => {
        const groupes: { [date: string]: Workout[] } = {};

        for (const workout of tousLesWorkouts) {
            if (!groupes[workout.date]) {
                groupes[workout.date] = [];
            }
            groupes[workout.date].push(workout);
        }

        return groupes;
    }, [tousLesWorkouts]);

    const workoutsDuJour = workoutsParDate[dateChoisie] || [];
    const statsAujourdhui = workoutsParDate[today] || [];

    const totalWorkoutsAujourdhui = statsAujourdhui.length;

    const totalExercicesAujourdhui = statsAujourdhui.reduce((total, workout) => {
        return total + workout.exercises.length;
    }, 0);

    const totalWorkoutsCompletes = tousLesWorkouts.filter(
        (workout) => workout.completed
    ).length;

    const dureeTotaleCompletee = tousLesWorkouts
        .filter((workout) => workout.completed)
        .reduce((total, workout) => total + workout.duration, 0);

    const poidsActuel =
        mockWeightHistory.length > 0
            ? mockWeightHistory[mockWeightHistory.length - 1].weight
            : mockUser.weight;

    const premierPoids =
        mockWeightHistory.length > 0 ? mockWeightHistory[0].weight : mockUser.weight;

    const evolutionPoids = Number((poidsActuel - premierPoids).toFixed(1));

    const markedDates: MarkedDates = useMemo(() => {
        const marked: MarkedDates = {};

        for (const date in workoutsParDate) {
            marked[date] = {
                marked: true,
                dotColor: "#2EE6D6",
            };
        }

        if (today) {
            marked[today] = {
                ...(marked[today] || {}),
                marked: true,
                dotColor: "#2EE6D6",
                selected: true,
                selectedColor: "#2EE6D6",
            };
        }

        if (dateChoisie !== today) {
            marked[dateChoisie] = {
                ...(marked[dateChoisie] || {}),
                marked: true,
                dotColor: "#2EE6D6",
                selected: true,
                selectedColor: "#2EE6D6",
            };
        }

        return marked;
    }, [workoutsParDate, dateChoisie, today]);

    const workoutChoisi =
        workoutsDuJour.find((workout) => workout.id === workoutChoisiId) || null;

    useEffect(() => {
        if (workoutsDuJour.length > 0) {
            const existeEncore = workoutsDuJour.some(
                (workout) => workout.id === workoutChoisiId
            );

            if (!existeEncore) {
                setWorkoutChoisiId(workoutsDuJour[0].id);
            }
        } else {
            setWorkoutChoisiId(null);
        }
    }, [dateChoisie, workoutChoisiId, workoutsDuJour]);

    function choisirJour(day: JourCalendrier) {
        setDateChoisie(day.dateString);
    }

    function choisirWorkout(id: string) {
        setWorkoutChoisiId(id);
    }

    function definirJourSelectionneCommeAujourdhui() {
        setTodayOverride(dateChoisie);
        setToday(dateChoisie);
        setDateChoisie(dateChoisie);
    }

    function revenirAuVraiAujourdhui() {
        setTodayOverride(null);
        const vraiToday = getEffectiveToday();
        setToday(vraiToday);
        setDateChoisie(vraiToday);
    }

    function viderSeancesDeTest() {
        clearSessionWorkouts();
        setTodayOverride(null);
        const vraiToday = getEffectiveToday();
        setToday(vraiToday);
        setDateChoisie(vraiToday);
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#070B14" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
            >
                <Text
                    style={{
                        color: "white",
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 8,
                    }}
                >
                    Stats
                </Text>

                <Text style={{ color: "#7C8799", fontSize: 15, marginBottom: 18 }}>
                    Ton activité réelle à partir des données utilisateur
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
                        Aujourd’hui
                    </Text>

                    <Text style={{ color: "#7C8799", marginBottom: 14 }}>
                        Jour utilisé pour les stats : {today}
                        {getTodayOverride() ? " (mode test)" : ""}
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
                                {totalWorkoutsAujourdhui}
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
                                {totalExercicesAujourdhui}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Exercices</Text>
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
                                {poidsActuel} kg
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Poids actuel</Text>
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
                                {evolutionPoids > 0 ? `+${evolutionPoids}` : evolutionPoids} kg
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>Évolution</Text>
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
                    <Text
                        style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Vue d’ensemble
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
                                {totalWorkoutsCompletes}
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>
                                Complétés
                            </Text>
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
                                {dureeTotaleCompletee} min
                            </Text>
                            <Text style={{ color: "#7C8799", marginTop: 4 }}>
                                Temps total
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={viderSeancesDeTest}
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 14,
                            padding: 14,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "700" }}>
                            Vider les séances de test
                        </Text>
                    </TouchableOpacity>
                </View>

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
                        current={dateChoisie}
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
                            marginBottom: 8,
                        }}
                    >
                        Test calendrier 🧪
                    </Text>

                    <Text style={{ color: "#7C8799", fontSize: 14, marginBottom: 14 }}>
                        Date sélectionnée : {dateChoisie}
                    </Text>

                    <TouchableOpacity
                        onPress={definirJourSelectionneCommeAujourdhui}
                        style={{
                            backgroundColor: "#2EE6D6",
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <Text style={{ color: "#070B14", fontWeight: "800" }}>
                            Définir ce jour comme aujourd’hui
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={revenirAuVraiAujourdhui}
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "700" }}>
                            Revenir au vrai aujourd’hui
                        </Text>
                    </TouchableOpacity>
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
                    <Text
                        style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 8,
                        }}
                    >
                        Résumé du {dateChoisie}
                    </Text>

                    {workoutsDuJour.length === 0 && (
                        <Text style={{ color: "#7C8799", fontSize: 15, marginTop: 6 }}>
                            Aucun workout pour cette date.
                        </Text>
                    )}

                    {workoutsDuJour.length > 0 && (
                        <>
                            <Text
                                style={{
                                    color: "#7C8799",
                                    fontSize: 14,
                                    marginBottom: 14,
                                }}
                            >
                                {workoutsDuJour.length} workout(s) prévu(s) ou enregistré(s)
                            </Text>

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
                                            marginBottom: 4,
                                        }}
                                    >
                                        {workout.title}
                                    </Text>

                                    <Text
                                        style={{
                                            color:
                                                workoutChoisiId === workout.id ? "#0B2F2B" : "#7C8799",
                                            fontSize: 13,
                                        }}
                                    >
                                        {workout.duration} min •{" "}
                                        {workout.completed ? "complété" : "à faire"}
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
                                            marginBottom: 8,
                                        }}
                                    >
                                        {workoutChoisi.title}
                                    </Text>

                                    <Text
                                        style={{
                                            color: "#7C8799",
                                            fontSize: 14,
                                            marginBottom: 14,
                                        }}
                                    >
                                        {workoutChoisi.duration} min •{" "}
                                        {workoutChoisi.completed ? "Workout complété ✅" : "Workout à faire"}
                                    </Text>

                                    {workoutChoisi.exercises.map((exercise) => (
                                        <View
                                            key={exercise.id}
                                            style={{
                                                backgroundColor: "#182335",
                                                borderRadius: 12,
                                                padding: 14,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: "white",
                                                    fontSize: 15,
                                                    fontWeight: "700",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {exercise.name}
                                            </Text>

                                            <Text style={{ color: "#7C8799", fontSize: 14 }}>
                                                {exercise.sets} séries • {exercise.reps} reps
                                                {exercise.weight ? ` • ${exercise.weight} kg` : ""}
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