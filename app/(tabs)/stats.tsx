//Cette classe est générée par IA

import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { mockUser, mockWeightHistory, mockWorkouts } from "@/data/mockData";
import { Workout } from "@/types/models";
import {
    getSessionWorkouts,
    subscribeSessionWorkouts,
    clearSessionWorkouts,
} from "@/data/workoutSession";
import {
    getEffectiveToday,
    getTodayOverride,
    setTodayOverride,
    subscribeTodayOverride,
} from "@/data/testToday";
import { useTheme } from "@/context/context";

import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { getUiColors } from "@/components/utils/themeUtils";

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
    const { theme } = useTheme();
    const ui = getUiColors(theme);

    const [today, setToday] = useState<string>(getEffectiveToday());
    const [dateChoisie, setDateChoisie] = useState<string>(getEffectiveToday());
    const [workoutChoisiId, setWorkoutChoisiId] = useState<string | null>(null);
    const [sessionWorkouts, setSessionWorkouts] = useState<Workout[]>(
        getSessionWorkouts()
    );

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
            if (!groupes[workout.date]) groupes[workout.date] = [];
            groupes[workout.date].push(workout);
        }

        return groupes;
    }, [tousLesWorkouts]);

    const workoutsDuJour = workoutsParDate[dateChoisie] || [];
    const statsAujourdhui = workoutsParDate[today] || [];

    const totalWorkoutsAujourdhui = statsAujourdhui.length;

    const totalExercicesAujourdhui = statsAujourdhui.reduce(
        (total, workout) => total + workout.exercises.length,
        0
    );

    const workoutsCompletes = tousLesWorkouts.filter((workout) => workout.completed);

    const totalWorkoutsCompletes = workoutsCompletes.length;

    const dureeTotaleCompletee = workoutsCompletes.reduce(
        (total, workout) => total + workout.duration,
        0
    );

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
                dotColor: ui.accent,
            };
        }

        if (today) {
            marked[today] = {
                ...(marked[today] || {}),
                marked: true,
                dotColor: ui.accent,
                selected: true,
                selectedColor: ui.accent,
            };
        }

        if (dateChoisie !== today) {
            marked[dateChoisie] = {
                ...(marked[dateChoisie] || {}),
                marked: true,
                dotColor: ui.accent,
                selected: true,
                selectedColor: ui.accent,
            };
        }

        return marked;
    }, [workoutsParDate, dateChoisie, today, ui.accent]);

    const workoutChoisi =
        workoutsDuJour.find((workout) => workout.id === workoutChoisiId) || null;

    useEffect(() => {
        if (workoutsDuJour.length > 0) {
            const existeEncore = workoutsDuJour.some(
                (workout) => workout.id === workoutChoisiId
            );

            if (!existeEncore) setWorkoutChoisiId(workoutsDuJour[0].id);
        } else {
            setWorkoutChoisiId(null);
        }
    }, [dateChoisie, workoutChoisiId, workoutsDuJour]);

    function choisirJour(day: JourCalendrier) {
        setDateChoisie(day.dateString);
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
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 8,
                    }}
                >
                    Stats
                </Text>

                <Text style={{ color: ui.textMuted, fontSize: 15, marginBottom: 18 }}>
                    Ton activité réelle à partir des données utilisateur
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
                        Aujourd’hui
                    </Text>

                    <Text style={{ color: ui.textMuted, marginBottom: 14 }}>
                        Jour utilisé pour les stats : {today}
                        {getTodayOverride() ? " (mode test)" : ""}
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <StatCard label="Workouts" value={totalWorkoutsAujourdhui} ui={ui} />
                        <StatCard label="Exercices" value={totalExercicesAujourdhui} ui={ui} />
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <StatCard label="Poids actuel" value={`${poidsActuel} kg`} ui={ui} />
                        <StatCard
                            label="Évolution"
                            value={`${evolutionPoids > 0 ? "+" : ""}${evolutionPoids} kg`}
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
                        Vue d’ensemble
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <StatCard label="Complétés" value={totalWorkoutsCompletes} ui={ui} />
                        <StatCard label="Temps total" value={`${dureeTotaleCompletee} min`} ui={ui} />
                    </View>

                    <TouchableOpacity
                        onPress={viderSeancesDeTest}
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 14,
                            padding: 14,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                            Vider les séances de test
                        </Text>
                    </TouchableOpacity>
                </SectionCard>

                <SectionCard ui={ui}>
                    <Calendar
                        current={dateChoisie}
                        onDayPress={choisirJour}
                        markedDates={markedDates}
                        enableSwipeMonths={true}
                        hideExtraDays={false}
                        firstDay={1}
                        theme={{
                            backgroundColor: ui.cardBackground,
                            calendarBackground: ui.cardBackground,
                            textSectionTitleColor: ui.textMuted,
                            selectedDayBackgroundColor: ui.accent,
                            selectedDayTextColor: ui.accentText,
                            todayTextColor: ui.accent,
                            dayTextColor: ui.textPrimary,
                            textDisabledColor: ui.disabledText,
                            monthTextColor: ui.textPrimary,
                            arrowColor: ui.accent,
                        }}
                        style={{
                            borderRadius: 16,
                        }}
                    />
                </SectionCard>

                <SectionCard ui={ui}>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 8,
                        }}
                    >
                        Test calendrier 🧪
                    </Text>

                    <Text style={{ color: ui.textMuted, fontSize: 14, marginBottom: 14 }}>
                        Date sélectionnée : {dateChoisie}
                    </Text>

                    <TouchableOpacity
                        onPress={definirJourSelectionneCommeAujourdhui}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                            Définir ce jour comme aujourd’hui
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={revenirAuVraiAujourdhui}
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                            Revenir au vrai aujourd’hui
                        </Text>
                    </TouchableOpacity>
                </SectionCard>

                <SectionCard ui={ui} marginBottom={0}>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 8,
                        }}
                    >
                        Résumé du {dateChoisie}
                    </Text>

                    {workoutsDuJour.length === 0 && (
                        <Text style={{ color: ui.textMuted, fontSize: 15, marginTop: 6 }}>
                            Aucun workout pour cette date.
                        </Text>
                    )}

                    {workoutsDuJour.length > 0 && (
                        <>
                            <Text
                                style={{
                                    color: ui.textMuted,
                                    fontSize: 14,
                                    marginBottom: 14,
                                }}
                            >
                                {workoutsDuJour.length} workout(s) prévu(s) ou enregistré(s)
                            </Text>

                            {workoutsDuJour.map((workout) => (
                                <TouchableOpacity
                                    key={workout.id}
                                    onPress={() => setWorkoutChoisiId(workout.id)}
                                    style={{
                                        backgroundColor:
                                            workoutChoisiId === workout.id ? ui.accent : ui.cardSecondary,
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                workoutChoisiId === workout.id
                                                    ? ui.accentText
                                                    : ui.textPrimary,
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
                                                workoutChoisiId === workout.id
                                                    ? ui.selfSubtext
                                                    : ui.textMuted,
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
                                        backgroundColor: ui.cardSecondary,
                                        borderRadius: 16,
                                        padding: 16,
                                        marginTop: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: ui.textPrimary,
                                            fontSize: 22,
                                            fontWeight: "800",
                                            marginBottom: 8,
                                        }}
                                    >
                                        {workoutChoisi.title}
                                    </Text>

                                    <Text
                                        style={{
                                            color: ui.textMuted,
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
                                                backgroundColor: ui.cardTertiary,
                                                borderRadius: 12,
                                                padding: 14,
                                                marginBottom: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: ui.textPrimary,
                                                    fontSize: 15,
                                                    fontWeight: "700",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {exercise.name}
                                            </Text>

                                            <Text style={{ color: ui.textMuted, fontSize: 14 }}>
                                                {exercise.sets} séries • {exercise.reps} reps
                                                {exercise.weight ? ` • ${exercise.weight} kg` : ""}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </SectionCard>
            </ScrollView>
        </View>
    );
}