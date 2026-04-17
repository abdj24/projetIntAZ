import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mockWorkouts } from "@/data/mockData";
import { getSessionWorkouts, subscribeSessionWorkouts } from "@/data/workoutSession";
import { getEffectiveToday, subscribeTodayOverride } from "@/data/testToday";
import { Workout } from "@/types/models";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Habitudes = {
    meditation: boolean;
    eau: boolean;
    marche: boolean;
};

type UiColors = {
    screenBackground: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    cardBackground: string;
    cardSecondary: string;
    border: string;
    progressTrack: string;
    accent: string;
    habitInactive: string;
    habitActiveText: string;
};

// ─────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────

function formaterDate(date: string): string {
    const [annee, mois, jour] = date.split("-");
    return `${jour}/${mois}/${annee}`;
}

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

// ─────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────

function CarteStats({
                        label,
                        valeur,
                        ui,
                    }: {
    label: string;
    valeur: string | number;
    ui: UiColors;
}) {
    return (
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
            <Text style={{ color: ui.textMuted, fontSize: 13 }}>{label}</Text>
            <Text
                style={{
                    color: ui.textPrimary,
                    fontSize: 24,
                    fontWeight: "800",
                    marginTop: 8,
                }}
            >
                {valeur}
            </Text>
        </View>
    );
}

function CarteProgression({
                              titre,
                              sousTitre,
                              valeurAffichee,
                              progression,
                              hauteurBarre = 10,
                              ui,
                          }: {
    titre: string;
    sousTitre?: string;
    valeurAffichee?: string;
    progression: number;
    hauteurBarre?: number;
    ui: UiColors;
}) {
    return (
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
                {titre}
            </Text>

            {valeurAffichee && (
                <Text
                    style={{
                        color: ui.accent,
                        fontSize: 28,
                        fontWeight: "800",
                    }}
                >
                    {valeurAffichee}
                </Text>
            )}

            {sousTitre && (
                <Text
                    style={{
                        color: ui.textSecondary,
                        fontSize: 14,
                        marginTop: 6,
                        marginBottom: 14,
                    }}
                >
                    {sousTitre}
                </Text>
            )}

            <View
                style={{
                    height: hauteurBarre,
                    backgroundColor: ui.progressTrack,
                    borderRadius: 999,
                    marginTop: valeurAffichee ? 0 : 14,
                    overflow: "hidden",
                }}
            >
                <View
                    style={{
                        width: `${progression}%`,
                        height: "100%",
                        backgroundColor: ui.accent,
                        borderRadius: 999,
                    }}
                />
            </View>
        </View>
    );
}

function BoutonHabitude({
                            label,
                            labelActif,
                            actif,
                            onPress,
                            ui,
                        }: {
    label: string;
    labelActif: string;
    actif: boolean;
    onPress: () => void;
    ui: UiColors;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
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
}

function CarteHabitudes({
                            habitudes,
                            message,
                            onBasculer,
                            ui,
                        }: {
    habitudes: Habitudes;
    message: string;
    onBasculer: (cle: keyof Habitudes) => void;
    ui: UiColors;
}) {
    return (
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
                {message}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                <BoutonHabitude
                    label="Faire méditation"
                    labelActif="Méditation faite"
                    actif={habitudes.meditation}
                    onPress={() => onBasculer("meditation")}
                    ui={ui}
                />
                <BoutonHabitude
                    label="Boire de l'eau"
                    labelActif="Hydratation OK"
                    actif={habitudes.eau}
                    onPress={() => onBasculer("eau")}
                    ui={ui}
                />
                <BoutonHabitude
                    label="Faire une marche"
                    labelActif="Marche faite"
                    actif={habitudes.marche}
                    onPress={() => onBasculer("marche")}
                    ui={ui}
                />
            </View>
        </View>
    );
}

function CarteActiviteRecente({
                                  workouts,
                                  ui,
                              }: {
    workouts: Workout[];
    ui: UiColors;
}) {
    return (
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

            {workouts.length === 0 ? (
                <Text style={{ color: ui.textMuted, fontSize: 14 }}>
                    Aucune activité récente.
                </Text>
            ) : (
                workouts.map((workout) => (
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
        </View>
    );
}

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────

const OBJECTIF_SEMAINE = 4;

export default function HomeScreen() {
    const { theme, toggleTheme } = useTheme();
    const colors = Colors[theme];

    const ui: UiColors = {
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

    // ── États ──────────────────────────────────

    const [today, setToday] = useState<string>(getEffectiveToday());
    const [sessionWorkouts, setSessionWorkouts] = useState<Workout[]>(getSessionWorkouts());
    const [habitudes, setHabitudes] = useState<Habitudes>({
        meditation: false,
        eau: false,
        marche: false,
    });

    // ── Subscriptions ──────────────────────────

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

    // ── Calculs mémoïsés ───────────────────────

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
                .sort((a, b) =>
                    `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)
                )
                .slice(0, 4),
        [tousLesWorkouts]
    );

    // ── Valeurs dérivées ───────────────────────

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

    // ── Actions ────────────────────────────────

    function basculerHabitude(cle: keyof Habitudes) {
        setHabitudes((ancien) => ({ ...ancien, [cle]: !ancien[cle] }));
    }

    // ── Rendu ──────────────────────────────────

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: ui.screenBackground }}
            contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
        >
            {/* En-tête */}
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

            {/* Bouton thème */}
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

            {/* Objectif semaine */}
            <CarteProgression
                titre="Objectif de la semaine"
                valeurAffichee={`${seancesSemaine}/${OBJECTIF_SEMAINE} séances`}
                sousTitre={
                    seancesSemaine >= OBJECTIF_SEMAINE
                        ? "Objectif atteint 🎉"
                        : "Continue, tu avances bien"
                }
                progression={progressionSemaine}
                hauteurBarre={10}
                ui={ui}
            />

            {/* Habitudes */}
            <CarteHabitudes
                habitudes={habitudes}
                message={messageAssistant}
                onBasculer={basculerHabitude}
                ui={ui}
            />

            {/* Stats du jour */}
            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
                <CarteStats label="Workouts du jour" valeur={totalWorkoutsAujourdhui} ui={ui} />
                <CarteStats label="Exercices du jour" valeur={totalExercicesAujourdhui} ui={ui} />
            </View>

            <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
                <CarteStats label="Minutes du jour" valeur={dureeAujourdhui} ui={ui} />
                <CarteStats label="Habitudes validées" valeur={`${habitudesValidees}/3`} ui={ui} />
            </View>

            {/* Rang */}
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
                <Text style={{ color: ui.textMuted, fontSize: 13, marginBottom: 10 }}>
                    TON RANG
                </Text>

                <Text style={{ color: ui.textPrimary, fontSize: 26, fontWeight: "800" }}>
                    {rang}
                </Text>

                <Text style={{ color: ui.textSecondary, marginTop: 6, fontSize: 14 }}>
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

            {/* Activité récente */}
            <CarteActiviteRecente workouts={activitesRecentes} ui={ui} />
        </ScrollView>
    );
}
