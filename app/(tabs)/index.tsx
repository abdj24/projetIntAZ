import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mockWorkouts } from "@/data/mockData";
import { getSessionWorkouts, subscribeSessionWorkouts } from "@/data/workoutSession";
import { getEffectiveToday, subscribeTodayOverride } from "@/data/testToday";
import { Workout } from "@/types/models";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

type Habitudes = {
    meditation: boolean;
    eau: boolean;
    marche: boolean;
};

export default function HomeScreen() {
    const { theme, toggleTheme } = useTheme();
    const colors = Colors[theme];

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

    const tousLesWorkouts = useMemo(() => {
        return [...sessionWorkouts, ...mockWorkouts];
    }, [sessionWorkouts]);

    const workoutsAujourdhui = useMemo(() => {
        return tousLesWorkouts.filter((workout) => workout.date === today);
    }, [tousLesWorkouts, today]);

    const totalWorkoutsAujourdhui = workoutsAujourdhui.length;

    const totalExercicesAujourdhui = workoutsAujourdhui.reduce((total, workout) => {
        return total + workout.exercises.length;
    }, 0);

    const dureeAujourdhui = workoutsAujourdhui.reduce((total, workout) => {
        return total + workout.duration;
    }, 0);

    const workouts7Jours = useMemo(() => {
        const dateAujourdhui = new Date(today);

        return tousLesWorkouts.filter((workout) => {
            const dateWorkout = new Date(workout.date);
            const diffTemps = dateAujourdhui.getTime() - dateWorkout.getTime();
            const diffJours = diffTemps / (1000 * 60 * 60 * 24);

            return diffJours >= 0 && diffJours < 7;
        });
    }, [tousLesWorkouts, today]);

    const objectifSemaine = 4;
    const seancesSemaine = workouts7Jours.length;
    const progressionSemaine = Math.min(
        Math.round((seancesSemaine / objectifSemaine) * 100),
        100
    );

    const activitesRecentes = useMemo(() => {
        return [...tousLesWorkouts]
            .sort((a, b) => {
                return `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`);
            })
            .slice(0, 4);
    }, [tousLesWorkouts]);

    const totalWorkouts = tousLesWorkouts.length;

    const rang = useMemo(() => {
        if (totalWorkouts >= 20) {
            return "Diamond";
        }
        if (totalWorkouts >= 12) {
            return "Platinum";
        }
        if (totalWorkouts >= 7) {
            return "Gold";
        }
        if (totalWorkouts >= 3) {
            return "Silver";
        }
        return "Bronze";
    }, [totalWorkouts]);

    const progressionRang = useMemo(() => {
        if (totalWorkouts >= 20) {
            return 100;
        }
        if (totalWorkouts >= 12) {
            return Math.round(((totalWorkouts - 12) / 8) * 100);
        }
        if (totalWorkouts >= 7) {
            return Math.round(((totalWorkouts - 7) / 5) * 100);
        }
        if (totalWorkouts >= 3) {
            return Math.round(((totalWorkouts - 3) / 4) * 100);
        }
        return Math.round((totalWorkouts / 3) * 100);
    }, [totalWorkouts]);

    const heure = new Date().getHours();

    let salutation = "Bonsoir";
    if (heure < 12) {
        salutation = "Bonjour";
    } else if (heure < 18) {
        salutation = "Bon après-midi";
    }

    let messageAssistant = "Bonne journée pour une courte séance 💪";
    if (totalWorkoutsAujourdhui === 0) {
        messageAssistant =
            "Tu n’as encore rien log aujourd’hui. Une petite séance rapide serait parfaite 👀";
    } else if (totalWorkoutsAujourdhui > 0 && !habitudes.meditation) {
        messageAssistant =
            "Belle progression aujourd’hui. Tu peux compléter avec 5 minutes de méditation 🧘";
    } else if (habitudes.meditation && habitudes.eau && habitudes.marche) {
        messageAssistant = "Très propre aujourd’hui. Continue comme ça 🔥";
    }

    function basculerHabitude(cle: keyof Habitudes) {
        setHabitudes((ancien) => ({
            ...ancien,
            [cle]: !ancien[cle],
        }));
    }

    function formaterDate(date: string) {
        const dateObjet = new Date(date);
        return dateObjet.toLocaleDateString();
    }

    const ui = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textSecondary: theme === "dark" ? "#93A1B5" : "#5F6B7A",
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        border: theme === "dark" ? "#162033" : "#D8E0EA",
        progressTrack: theme === "dark" ? "#162033" : "#D8E0EA",
        accent: "#2EE6D6",
        habitInactive: theme === "dark" ? "#1D2A44" : "#DCE6F5",
        habitActiveText: "#070B14",
    };

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

            <Text
                style={{
                    color: ui.textMuted,
                    fontSize: 15,
                    marginBottom: 14,
                }}
            >
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
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontWeight: "700",
                    }}
                >
                    Changer le thème {theme === "dark" ? "☀️" : "🌙"}
                </Text>
            </TouchableOpacity>

            <View
                style={{
                    backgroundColor: ui.cardBackground,
                    borderRadius: 22,
                    padding: 18,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: ui.border,
                }}
            >
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
                    {seancesSemaine}/{objectifSemaine} séances
                </Text>

                <Text
                    style={{
                        color: ui.textSecondary,
                        fontSize: 14,
                        marginTop: 6,
                        marginBottom: 14,
                    }}
                >
                    {seancesSemaine >= objectifSemaine
                        ? "Objectif atteint 🎉"
                        : "Continue, tu avances bien"}
                </Text>

                <View
                    style={{
                        height: 10,
                        backgroundColor: ui.progressTrack,
                        borderRadius: 999,
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            width: `${progressionSemaine}%`,
                            height: "100%",
                            backgroundColor: ui.accent,
                            borderRadius: 999,
                        }}
                    />
                </View>
            </View>

            <View
                style={{
                    backgroundColor: ui.cardBackground,
                    borderRadius: 22,
                    padding: 18,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: ui.border,
                }}
            >
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
                    <TouchableOpacity
                        onPress={() => basculerHabitude("meditation")}
                        style={{
                            backgroundColor: habitudes.meditation ? ui.accent : ui.habitInactive,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                    >
                        <Text
                            style={{
                                color: habitudes.meditation ? ui.habitActiveText : ui.textPrimary,
                                fontWeight: "700",
                                fontSize: 14,
                            }}
                        >
                            {habitudes.meditation ? "Méditation faite" : "Faire méditation"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => basculerHabitude("eau")}
                        style={{
                            backgroundColor: habitudes.eau ? ui.accent : ui.habitInactive,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                    >
                        <Text
                            style={{
                                color: habitudes.eau ? ui.habitActiveText : ui.textPrimary,
                                fontWeight: "700",
                                fontSize: 14,
                            }}
                        >
                            {habitudes.eau ? "Hydratation OK" : "Boire de l’eau"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => basculerHabitude("marche")}
                        style={{
                            backgroundColor: habitudes.marche ? ui.accent : ui.habitInactive,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                    >
                        <Text
                            style={{
                                color: habitudes.marche ? ui.habitActiveText : ui.textPrimary,
                                fontWeight: "700",
                                fontSize: 14,
                            }}
                        >
                            {habitudes.marche ? "Marche faite" : "Faire une marche"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: ui.cardBackground,
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: ui.border,
                    }}
                >
                    <Text style={{ color: ui.textMuted, fontSize: 13 }}>Workouts du jour</Text>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 24,
                            fontWeight: "800",
                            marginTop: 8,
                        }}
                    >
                        {totalWorkoutsAujourdhui}
                    </Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: ui.cardBackground,
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: ui.border,
                    }}
                >
                    <Text style={{ color: ui.textMuted, fontSize: 13 }}>Exercices du jour</Text>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 24,
                            fontWeight: "800",
                            marginTop: 8,
                        }}
                    >
                        {totalExercicesAujourdhui}
                    </Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: ui.cardBackground,
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: ui.border,
                    }}
                >
                    <Text style={{ color: ui.textMuted, fontSize: 13 }}>Minutes du jour</Text>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 24,
                            fontWeight: "800",
                            marginTop: 8,
                        }}
                    >
                        {dureeAujourdhui}
                    </Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: ui.cardBackground,
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: ui.border,
                    }}
                >
                    <Text style={{ color: ui.textMuted, fontSize: 13 }}>Habitudes validées</Text>
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 24,
                            fontWeight: "800",
                            marginTop: 8,
                        }}
                    >
                        {Object.values(habitudes).filter(Boolean).length}/3
                    </Text>
                </View>
            </View>

            <View
                style={{
                    backgroundColor: ui.cardBackground,
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: ui.border,
                    marginBottom: 18,
                }}
            >
                <Text
                    style={{
                        color: ui.textMuted,
                        fontSize: 13,
                        marginBottom: 10,
                    }}
                >
                    TON RANG
                </Text>

                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 26,
                        fontWeight: "800",
                    }}
                >
                    {rang}
                </Text>

                <Text
                    style={{
                        color: ui.textSecondary,
                        marginTop: 6,
                        fontSize: 14,
                    }}
                >
                    Basé sur tes séances enregistrées
                </Text>

                <View
                    style={{
                        height: 8,
                        backgroundColor: ui.progressTrack,
                        borderRadius: 999,
                        marginTop: 14,
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            width: `${progressionRang}%`,
                            height: "100%",
                            backgroundColor: ui.accent,
                            borderRadius: 999,
                        }}
                    />
                </View>
            </View>

            <View
                style={{
                    backgroundColor: ui.cardBackground,
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: ui.border,
                }}
            >
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

                {activitesRecentes.length === 0 && (
                    <Text style={{ color: ui.textMuted, fontSize: 14 }}>
                        Aucune activité récente.
                    </Text>
                )}

                {activitesRecentes.map((workout) => (
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
                ))}
            </View>
        </ScrollView>
    );
}