//Cette classe est générée par IA

import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mockWorkouts } from "@/data/mockData";
import { getSessionWorkouts, subscribeSessionWorkouts } from "@/data/workoutSession";
import { getEffectiveToday, subscribeTodayOverride } from "@/data/testToday";
import { Workout } from "@/types/models";
import { useTheme } from "@/context/context";

import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getUiColors } from "@/components/utils/themeUtils";
import { formaterDate } from "@/components/utils/dateUtils";

type Habitudes = {
    meditation: boolean;
    eau: boolean;
    marche: boolean;
};

const OBJECTIF_SEMAINE = 4;

function calculerSalutation(): string {
    const heure = new Date().getHours();
    if (heure < 12) return "Bonjour";
    if (heure < 18) return "Bon après-midi";
    return "Bonsoir";
}

function calculerMessageAssistant(
    totalWorkoutsAujourdhui: number,
    habitudes: Habitudes
): string {
    if (totalWorkoutsAujourdhui === 0) {
        return "Tu n'as encore rien log aujourd'hui. Une petite séance rapide serait parfaite 👀";
    }
    if (!habitudes.meditation) {
        return "Belle progression aujourd'hui. Tu peux compléter avec 5 minutes de méditation 🧘";
    }
    if (habitudes.meditation && habitudes.eau && habitudes.marche) {
        return "Très propre aujourd'hui. Continue comme ça 🔥";
    }
    return "Bonne journée pour une courte séance 💪";
}

function calculerRang(totalWorkouts: number): string {
    if (totalWorkouts >= 20) return "Diamond";
    if (totalWorkouts >= 12) return "Platinum";
    if (totalWorkouts >= 7) return "Gold";
    if (totalWorkouts >= 3) return "Silver";
    return "Bronze";
}

function calculerProgressionRang(totalWorkouts: number): number {
    if (totalWorkouts >= 20) return 100;
    if (totalWorkouts >= 12) return Math.round(((totalWorkouts - 12) / 8) * 100);
    if (totalWorkouts >= 7) return Math.round(((totalWorkouts - 7) / 5) * 100);
    if (totalWorkouts >= 3) return Math.round(((totalWorkouts - 3) / 4) * 100);
    return Math.round((totalWorkouts / 3) * 100);
}

export default function HomeScreen() {
    const { theme, toggleTheme } = useTheme();
    const ui = getUiColors(theme);

    const [today, setToday] = useState<string>(getEffectiveToday());
    const [sessionWorkouts, setSessionWorkouts] = useState<Workout[]>(getSessionWorkouts());
    const [habitudes, setHabitudes] = useState<Habitudes>({
        meditation: false,
        eau: false,
        marche: false,
    });

    useEffect(() => {
        const unsubscribeWorkouts = subscribeSessionWorkouts(() => {
            setSessionWorkouts([...getSessionWorkouts()]);
        });

        const unsubscribeToday = subscribeTodayOverride(() => {
            setToday(getEffectiveToday());
        });

        return () => {
            unsubscribeWorkouts();
            unsubscribeToday();
        };
    }, []);

    const tousLesWorkouts = useMemo(
        () => [...sessionWorkouts, ...mockWorkouts],
        [sessionWorkouts]
    );

    const workoutsAujourdhui = useMemo(
        () => tousLesWorkouts.filter((w) => w.date === today),
        [tousLesWorkouts, today]
    );

    const workouts7Jours = useMemo(() => {
        const dateAujourdhui = new Date(today);

        return tousLesWorkouts.filter((workout) => {
            const dateWorkout = new Date(workout.date);
            const diffJours =
                (dateAujourdhui.getTime() - dateWorkout.getTime()) / (1000 * 60 * 60 * 24);

            return diffJours >= 0 && diffJours < 7;
        });
    }, [tousLesWorkouts, today]);

    const activitesRecentes = useMemo(
        () =>
            [...tousLesWorkouts]
                .sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`))
                .slice(0, 4),
        [tousLesWorkouts]
    );

    const totalWorkoutsAujourdhui = workoutsAujourdhui.length;

    const totalExercicesAujourdhui = workoutsAujourdhui.reduce(
        (total, w) => total + w.exercises.length,
        0
    );

    const dureeAujourdhui = workoutsAujourdhui.reduce(
        (total, w) => total + w.duration,
        0
    );

    const seancesSemaine = workouts7Jours.length;
    const progressionSemaine = Math.min(
        Math.round((seancesSemaine / OBJECTIF_SEMAINE) * 100),
        100
    );

    const totalWorkouts = tousLesWorkouts.length;
    const rang = calculerRang(totalWorkouts);
    const progressionRang = calculerProgressionRang(totalWorkouts);

    const salutation = calculerSalutation();
    const messageAssistant = calculerMessageAssistant(totalWorkoutsAujourdhui, habitudes);
    const habitudesValidees = Object.values(habitudes).filter(Boolean).length;

    function basculerHabitude(cle: keyof Habitudes) {
        setHabitudes((ancien) => ({ ...ancien, [cle]: !ancien[cle] }));
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: ui.screenBackground }}
            contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
        >
            <Text
                style={{
                    color: ui.textPrimary,
                    fontSize: 34,
                    fontWeight: "800",
                    marginBottom: 6,
                }}
            >
                Home
            </Text>

            <Text style={{ color: ui.textMuted, fontSize: 15, marginBottom: 14 }}>
                {salutation} — voici ton aperçu du jour
            </Text>

            <TouchableOpacity
                onPress={toggleTheme}
                style={{
                    backgroundColor: ui.cardSecondary,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    alignSelf: "flex-start",
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: ui.border,
                }}
            >
                <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                    Changer le thème {theme === "dark" ? "☀️" : "🌙"}
                </Text>
            </TouchableOpacity>

            <SectionCard ui={ui} marginBottom={18}>
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 20,
                        fontWeight: "700",
                        marginBottom: 8,
                    }}
                >
                    Objectif de la semaine
                </Text>

                <Text
                    style={{
                        color: ui.accent,
                        fontSize: 28,
                        fontWeight: "800",
                    }}
                >
                    {seancesSemaine}/{OBJECTIF_SEMAINE} séances
                </Text>

                <Text
                    style={{
                        color: ui.textSecondary,
                        fontSize: 14,
                        marginTop: 6,
                        marginBottom: 14,
                    }}
                >
                    {seancesSemaine >= OBJECTIF_SEMAINE
                        ? "Objectif atteint 🎉"
                        : "Continue, tu avances bien"}
                </Text>

                <ProgressBar value={progressionSemaine} ui={ui} />
            </SectionCard>

            <SectionCard ui={ui} marginBottom={18}>
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 20,
                        fontWeight: "700",
                        marginBottom: 10,
                    }}
                >
                    Assistant bien-être
                </Text>

                <Text
                    style={{
                        color: ui.textSecondary,
                        fontSize: 14,
                        lineHeight: 20,
                        marginBottom: 18,
                    }}
                >
                    {messageAssistant}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                    {[
                        ["meditation", "Faire méditation", "Méditation faite"],
                        ["eau", "Boire de l'eau", "Hydratation OK"],
                        ["marche", "Faire une marche", "Marche faite"],
                    ].map(([cle, label, labelActif]) => {
                        const key = cle as keyof Habitudes;
                        const actif = habitudes[key];

                        return (
                            <TouchableOpacity
                                key={cle}
                                onPress={() => basculerHabitude(key)}
                                style={{
                                    backgroundColor: actif ? ui.accent : ui.habitInactive,
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: actif ? ui.habitActiveText : ui.textPrimary,
                                        fontWeight: "700",
                                        fontSize: 14,
                                    }}
                                >
                                    {actif ? labelActif : label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </SectionCard>

            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
                <StatCard label="Workouts du jour" value={totalWorkoutsAujourdhui} ui={ui} />
                <StatCard label="Exercices du jour" value={totalExercicesAujourdhui} ui={ui} />
            </View>

            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
                <StatCard label="Minutes du jour" value={dureeAujourdhui} ui={ui} />
                <StatCard label="Habitudes validées" value={`${habitudesValidees}/3`} ui={ui} />
            </View>

            <SectionCard ui={ui} marginBottom={18}>
                <Text style={{ color: ui.textMuted, fontSize: 13, marginBottom: 10 }}>
                    TON RANG
                </Text>

                <Text style={{ color: ui.textPrimary, fontSize: 26, fontWeight: "800" }}>
                    {rang}
                </Text>

                <Text style={{ color: ui.textSecondary, marginTop: 6, fontSize: 14, marginBottom: 14 }}>
                    Basé sur tes séances enregistrées
                </Text>

                <ProgressBar value={progressionRang} ui={ui} height={8} />
            </SectionCard>

            <SectionCard ui={ui} marginBottom={0}>
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 19,
                        fontWeight: "700",
                        marginBottom: 14,
                    }}
                >
                    Activité récente
                </Text>

                {activitesRecentes.length === 0 ? (
                    <Text style={{ color: ui.textMuted, fontSize: 14 }}>
                        Aucune activité récente.
                    </Text>
                ) : (
                    activitesRecentes.map((workout) => (
                        <View
                            key={workout.id}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: ui.textPrimary,
                                    fontSize: 16,
                                    fontWeight: "700",
                                    marginBottom: 4,
                                }}
                            >
                                {workout.title}
                            </Text>

                            <Text style={{ color: ui.textMuted, fontSize: 13 }}>
                                {formaterDate(workout.date)} • {workout.duration} min •{" "}
                                {workout.exercises.length} exo(s)
                            </Text>
                        </View>
                    ))
                )}
            </SectionCard>
        </ScrollView>
    );
}