//Généré par IA

import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";
import { Workout } from "@/types/models";
import { useTheme } from "@/context/context";
import { useAuth } from "@/context/AuthContext";
import { useWorkouts } from "@/context/WorkoutContext";

import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { getUiColors } from "@/components/utils/themeUtils";
import { toLocalDateString } from "@/components/utils/dateUtils";

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
    // Initialisation du theme, de l'utilisateur et des workouts.
    const { theme } = useTheme();
    const { user } = useAuth();
    const { workouts, refreshWorkouts } = useWorkouts();
    const ui = getUiColors(theme);

    // Initialisation des variables de selection.
    const today = toLocalDateString(new Date());
    const [dateChoisie, setDateChoisie] = useState<string>(today);
    const [workoutChoisiId, setWorkoutChoisiId] = useState<string | null>(null);

    // Rechargement des workouts quand l'onglet Stats est affiche.
    useFocusEffect(
        useCallback(() => {
            void refreshWorkouts();
        }, [refreshWorkouts])
    );

    // Copie locale des workouts pour les calculs.
    const tousLesWorkouts = useMemo(() => {
        return [...workouts];
    }, [workouts]);

    // Regroupement des workouts par date pour le calendrier.
    const workoutsParDate = useMemo(() => {
        const groupes: { [date: string]: Workout[] } = {};

        for (const workout of tousLesWorkouts) {
            if (!groupes[workout.date]) groupes[workout.date] = [];
            groupes[workout.date].push(workout);
        }

        return groupes;
    }, [tousLesWorkouts]);

    // Workouts de la date choisie.
    const workoutsDuJour = useMemo(
        () => workoutsParDate[dateChoisie] || [],
        [dateChoisie, workoutsParDate]
    );

    // Workouts de la journee actuelle.
    const statsAujourdhui = useMemo(
        () => workoutsParDate[today] || [],
        [today, workoutsParDate]
    );

    const totalWorkoutsAujourdhui = statsAujourdhui.length;

    const totalExercicesAujourdhui = statsAujourdhui.reduce(
        (total, workout) => total + workout.exercises.length,
        0
    );

    // Filtre des workouts completes pour les statistiques globales.
    const workoutsCompletes = tousLesWorkouts.filter((workout) => workout.completed);

    const totalWorkoutsCompletes = workoutsCompletes.length;

    const dureeTotaleCompletee = workoutsCompletes.reduce(
        (total, workout) => total + workout.duration,
        0
    );

    // Historique du poids trie du plus recent au plus ancien.
    const weightHistory = useMemo(() => {
        return [...(user?.weightHistory || [])].sort((a, b) =>
            `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)
        );
    }, [user?.weightHistory]);

    const poidsActuel = user?.weight ?? weightHistory[0]?.weight ?? null;
    const premierPoids = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : poidsActuel;
    const evolutionPoids =
        poidsActuel != null && premierPoids != null
            ? Number((poidsActuel - premierPoids).toFixed(1))
            : null;

    // Marquage des jours dans le calendrier.
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

    // Selection automatique du premier workout de la date choisie.
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

    // Changement du jour selectionne dans le calendrier.
    function choisirJour(day: JourCalendrier) {
        setDateChoisie(day.dateString);
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
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <StatCard label="Workouts" value={totalWorkoutsAujourdhui} ui={ui} />
                        <StatCard label="Exercices" value={totalExercicesAujourdhui} ui={ui} />
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <StatCard
                            label="Poids actuel"
                            value={poidsActuel != null ? `${poidsActuel} kg` : "Non renseigné"}
                            ui={ui}
                        />
                        <StatCard
                            label="Évolution"
                            value={
                                evolutionPoids != null
                                    ? `${evolutionPoids > 0 ? "+" : ""}${evolutionPoids} kg`
                                    : "Non renseigné"
                            }
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
                        Historique du poids
                    </Text>

                    {weightHistory.length === 0 ? (
                        <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                            Aucune pesée enregistrée. Ajoute ton poids depuis Profil.
                        </Text>
                    ) : (
                        weightHistory.slice(0, 8).map((entry, index) => {
                            const previous = weightHistory[index + 1];
                            const diff = previous
                                ? Number((entry.weight - previous.weight).toFixed(1))
                                : null;

                            return (
                                <View
                                    key={entry.id}
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
                                            fontSize: 18,
                                            fontWeight: "800",
                                        }}
                                    >
                                        {entry.weight} kg
                                    </Text>

                                    <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                        {entry.date}
                                        {diff != null
                                            ? ` • ${diff > 0 ? "+" : ""}${diff} kg depuis la pesée précédente`
                                            : " • première pesée"}
                                    </Text>
                                </View>
                            );
                        })
                    )}
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
