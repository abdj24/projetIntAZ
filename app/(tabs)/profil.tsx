//Généré par IA

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";
import { useAuth } from "@/context/AuthContext";
import { useWorkouts } from "@/context/WorkoutContext";
import { Workout } from "@/types/models";

import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsGrid from "@/components/profile/StatsGrid";
import MonthlyWorkoutChart from "@/components/profile/MonthlyWorkoutChart";
import RecentWorkouts from "@/components/profile/RecentWorkouts";

// Formatage du mois affiche dans le graphique du profil.
function getMonthName(date: Date) {
    return date.toLocaleDateString("fr-CA", {
        month: "long",
        year: "numeric",
    });
}

// Conversion d'une date en format local YYYY-MM-DD.
function toLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Nombre de jours dans le mois selectionne.
function getDaysInMonth(year: number, monthIndex: number) {
    return new Date(year, monthIndex + 1, 0).getDate();
}

export default function ProfileScreen() {
    // Initialisation du theme, du profil et des workouts.
    const { theme } = useTheme();
    const { user, updateProfile, logout } = useAuth();
    const { workouts, refreshWorkouts } = useWorkouts();
    const colors = Colors[theme];

    const ui = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        textSecondary: theme === "dark" ? "#93A1B5" : "#5F6B7A",
        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        cardTertiary: theme === "dark" ? "#182335" : "#DCE6F5",
        border: theme === "dark" ? "#162033" : "#D8E0EA",
        accent: "#2EE6D6",
        accentText: "#070B14",
        badgeText: theme === "dark" ? "#7DD3FC" : "#0a7ea4",
        chartAxis: theme === "dark" ? "#7C8799" : "#6B7280",
        chartGrid: theme === "dark" ? "#162033" : "#D8E0EA",
        selectedSubtext: theme === "dark" ? "#0B2F2B" : "#0B5F58",
    };

    // Initialisation des informations affichees dans le profil.
    const [prenomAffiche, setPrenomAffiche] = useState(user?.name ?? "");
    const [usernameAffiche, setUsernameAffiche] = useState(user?.username ?? "");
    const [objectifAffiche, setObjectifAffiche] = useState(
        String(user?.goal ?? "Devenir plus actif")
    );
    const [poidsAffiche, setPoidsAffiche] = useState<number | null>(
        user?.weight ?? null
    );

    const [nomDraft, setNomDraft] = useState(prenomAffiche);
    const [usernameDraft, setUsernameDraft] = useState(usernameAffiche);
    const [objectifDraft, setObjectifDraft] = useState(objectifAffiche);
    const [poidsDraft, setPoidsDraft] = useState(
        user?.weight != null ? String(user.weight) : ""
    );
    const [profilError, setProfilError] = useState("");

    // Initialisation des modales et du mois selectionne.
    const [profilModalVisible, setProfilModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    // Rechargement des workouts quand le profil redevient actif.
    useFocusEffect(
        useCallback(() => {
            void refreshWorkouts();
        }, [refreshWorkouts])
    );

    // Synchronisation du profil local avec l'utilisateur connecte.
    useEffect(() => {
        if (!user) return;

        setPrenomAffiche(user.name);
        setUsernameAffiche(user.username ?? "");
        setObjectifAffiche(String(user.goal ?? "Devenir plus actif"));
        setPoidsAffiche(user.weight ?? null);
    }, [user]);

    // Liste des workouts completes, du plus recent au plus ancien.
    const allWorkouts = useMemo(() => {
        return [...workouts]
            .filter((workout) => workout.completed)
            .sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));
    }, [workouts]);

    const totalWorkouts = allWorkouts.length;

    // Calcul du total d'exercices effectues.
    const totalExercises = allWorkouts.reduce((total, workout) => {
        return total + workout.exercises.length;
    }, 0);

    // Regroupement des workouts par date.
    const workoutsByDate = useMemo(() => {
        const grouped: { [date: string]: Workout[] } = {};

        for (const workout of allWorkouts) {
            if (!grouped[workout.date]) {
                grouped[workout.date] = [];
            }

            grouped[workout.date].push(workout);
        }

        return grouped;
    }, [allWorkouts]);

    const activeDays = Object.keys(workoutsByDate).length;

    // Calcul de la serie de jours actifs.
    const streak = useMemo(() => {
        const uniqueDates = [...new Set(allWorkouts.map((w) => w.date))]
            .sort()
            .reverse();

        if (uniqueDates.length === 0) return 0;

        let count = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);

            const diffDays = Math.round(
                (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
                count++;
            } else {
                break;
            }
        }

        return count;
    }, [allWorkouts]);

    // Calcul du rang utilisateur.
    const rank = useMemo(() => {
        if (totalWorkouts >= 20) return "Diamant";
        if (totalWorkouts >= 12) return "Or";
        if (totalWorkouts >= 7) return "Argent";
        return "Bronze";
    }, [totalWorkouts]);

    // Construction de la liste des badges debloques.
    const badges = useMemo(() => {
        const list: string[] = [];

        if (streak >= 7) list.push("🔥 7 jours d’affilée");
        if (totalWorkouts >= 1) list.push("✅ Premier workout");
        if (totalExercises >= 100) list.push("💯 100 exercices");
        if (totalWorkouts >= 20) list.push("🏆 Niveau Diamant");

        return list;
    }, [streak, totalWorkouts, totalExercises]);

    // Workouts du mois selectionne.
    const workoutsThisMonth = useMemo(() => {
        const year = selectedMonth.getFullYear();
        const monthIndex = selectedMonth.getMonth();

        return allWorkouts.filter((workout) => {
            const d = new Date(workout.date);
            return d.getFullYear() === year && d.getMonth() === monthIndex;
        });
    }, [allWorkouts, selectedMonth]);

    const monthlyTotal = workoutsThisMonth.length;

    // Donnees du graphique mensuel.
    const monthlyChartData = useMemo(() => {
        const year = selectedMonth.getFullYear();
        const monthIndex = selectedMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, monthIndex);

        const counts: Record<string, number> = {};

        for (const workout of workoutsThisMonth) {
            counts[workout.date] = (counts[workout.date] || 0) + 1;
        }

        return Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const key = toLocalDateString(new Date(year, monthIndex, day));

            return {
                value: counts[key] || 0,
                label: String(day),
                frontColor: ui.accent,
            };
        });
    }, [selectedMonth, workoutsThisMonth, ui.accent]);

    // Valeur maximale utilisee pour l'echelle du graphique.
    const maxChartValue = useMemo(() => {
        const max = Math.max(...monthlyChartData.map((item) => item.value), 0);
        return max < 4 ? 4 : max;
    }, [monthlyChartData]);

    // Selection des workouts recents affiches sur le profil.
    const recentWorkouts = useMemo(() => {
        return allWorkouts.slice(0, 6);
    }, [allWorkouts]);

    // Garde un workout recent selectionne si la liste change.
    useEffect(() => {
        if (recentWorkouts.length > 0) {
            const stillExists = recentWorkouts.some(
                (workout) => workout.id === selectedWorkoutId
            );

            if (!stillExists) {
                setSelectedWorkoutId(recentWorkouts[0].id);
            }
        } else {
            setSelectedWorkoutId(null);
        }
    }, [recentWorkouts, selectedWorkoutId]);

    // Navigation vers le mois precedent.
    function previousMonth() {
        setSelectedMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        );
    }

    // Navigation vers le mois suivant.
    function nextMonth() {
        setSelectedMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        );
    }

    // Ouverture de la modale de modification du profil.
    function openEditProfile() {
        setNomDraft(prenomAffiche);
        setUsernameDraft(usernameAffiche);
        setObjectifDraft(objectifAffiche);
        setPoidsDraft(poidsAffiche != null ? String(poidsAffiche) : "");
        setProfilError("");
        setProfilModalVisible(true);
    }

    // Sauvegarde du profil et du poids dans MongoDB.
    async function saveProfile() {
        const cleanName = nomDraft.trim();
        const cleanUsername = usernameDraft.trim().replace(/^@+/, "");
        const cleanGoal = objectifDraft.trim();
        const cleanWeight = poidsDraft.trim().replace(",", ".");
        const parsedWeight = cleanWeight.length > 0 ? Number(cleanWeight) : null;

        if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 400)) {
            setProfilError("Entre un poids valide en kg.");
            return;
        }

        await updateProfile({
            name: cleanName.length > 0 ? cleanName : prenomAffiche,
            username: cleanUsername.length > 0 ? cleanUsername : usernameAffiche,
            goal: cleanGoal.length > 0 ? cleanGoal : objectifAffiche,
            weight: parsedWeight,
        });

        setProfilModalVisible(false);
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 20,
                    paddingTop: 30,
                    paddingBottom: 140,
                }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 18,
                    }}
                >
                    Profil
                </Text>

                <ProfileHeader
                    ui={ui}
                    prenom={prenomAffiche}
                    username={usernameAffiche}
                    rank={rank}
                />

                <StatsGrid
                    ui={ui}
                    totalWorkouts={totalWorkouts}
                    activeDays={activeDays}
                    totalExercises={totalExercises}
                    streak={streak}
                />

                <MonthlyWorkoutChart
                    ui={ui}
                    selectedMonth={selectedMonth}
                    previousMonth={previousMonth}
                    nextMonth={nextMonth}
                    monthlyTotal={monthlyTotal}
                    monthlyChartData={monthlyChartData}
                    maxChartValue={maxChartValue}
                    getMonthName={getMonthName}
                />

                <RecentWorkouts
                    ui={ui}
                    recentWorkouts={recentWorkouts}
                    selectedWorkoutId={selectedWorkoutId}
                    setSelectedWorkoutId={setSelectedWorkoutId}
                />

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Poids actuel
                    </Text>

                    <View
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 22,
                                fontWeight: "800",
                            }}
                        >
                            {poidsAffiche != null ? `${poidsAffiche} kg` : "Non renseigné"}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Objectif actuel
                    </Text>

                    <View
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 16,
                                lineHeight: 24,
                            }}
                        >
                            {objectifAffiche}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Badges
                    </Text>

                    {badges.length === 0 && (
                        <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                            Aucun badge débloqué pour le moment.
                        </Text>
                    )}

                    {badges.map((badge) => (
                        <View
                            key={badge}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: ui.textPrimary,
                                    fontSize: 16,
                                    fontWeight: "700",
                                }}
                            >
                                {badge}
                            </Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={openEditProfile}
                    style={{
                        backgroundColor: ui.accent,
                        borderRadius: 16,
                        padding: 16,
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <Text
                        style={{
                            color: ui.accentText,
                            fontWeight: "800",
                            fontSize: 15,
                        }}
                    >
                        Modifier le profil
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSettingsModalVisible(true)}
                    style={{
                        backgroundColor: ui.cardSecondary,
                        borderRadius: 16,
                        padding: 16,
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontWeight: "800",
                            fontSize: 15,
                        }}
                    >
                        Paramètres
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={profilModalVisible} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: ui.border,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 22,
                                fontWeight: "800",
                                marginBottom: 16,
                            }}
                        >
                            Modifier le profil
                        </Text>

                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>Nom</Text>
                        <TextInput
                            value={nomDraft}
                            onChangeText={setNomDraft}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                color: ui.textPrimary,
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: ui.border,
                            }}
                        />

                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                            Username
                        </Text>
                        <TextInput
                            value={usernameDraft}
                            onChangeText={setUsernameDraft}
                            autoCapitalize="none"
                            style={{
                                backgroundColor: ui.cardSecondary,
                                color: ui.textPrimary,
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: ui.border,
                            }}
                        />

                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                            Objectif
                        </Text>
                        <TextInput
                            value={objectifDraft}
                            onChangeText={setObjectifDraft}
                            multiline
                            style={{
                                backgroundColor: ui.cardSecondary,
                                color: ui.textPrimary,
                                borderRadius: 14,
                                padding: 14,
                                minHeight: 90,
                                textAlignVertical: "top",
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: ui.border,
                            }}
                        />

                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                            Poids actuel (kg)
                        </Text>
                        <TextInput
                            value={poidsDraft}
                            onChangeText={setPoidsDraft}
                            keyboardType="numeric"
                            placeholder="Ex: 82.5"
                            placeholderTextColor={ui.textMuted}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                color: ui.textPrimary,
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: ui.border,
                            }}
                        />

                        {profilError ? (
                            <Text style={{ color: "#EF4444", marginBottom: 12 }}>
                                {profilError}
                            </Text>
                        ) : null}

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setProfilModalVisible(false)}
                                style={{
                                    flex: 1,
                                    backgroundColor: ui.cardSecondary,
                                    borderRadius: 14,
                                    padding: 14,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveProfile}
                                style={{
                                    flex: 1,
                                    backgroundColor: ui.accent,
                                    borderRadius: 14,
                                    padding: 14,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                                    Sauvegarder
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={settingsModalVisible} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: ui.border,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 22,
                                fontWeight: "800",
                                marginBottom: 16,
                            }}
                        >
                            Paramètres
                        </Text>

                        <View
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    color: ui.textPrimary,
                                    fontWeight: "700",
                                    marginBottom: 4,
                                }}
                            >
                                Thème
                            </Text>
                            <Text style={{ color: ui.textMuted }}>
                                Le thème se change depuis Home.
                            </Text>
                        </View>

                        <View
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 12,
                            }}
                        >
                        </View>

                        <TouchableOpacity
                            onPress={async () => {
                                await logout();
                                setSettingsModalVisible(false);
                            }}
                            style={{
                                backgroundColor: "#3B0D0D",
                                borderRadius: 14,
                                padding: 14,
                                alignItems: "center",
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: "#EF4444",
                            }}
                        >
                            <Text style={{ color: "#FCA5A5", fontWeight: "800" }}>
                                Se déconnecter
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSettingsModalVisible(false)}
                            style={{
                                backgroundColor: ui.accent,
                                borderRadius: 14,
                                padding: 14,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                                Fermer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
