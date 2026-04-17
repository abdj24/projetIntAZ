import { useEffect, useMemo, useState } from "react";
import {Modal, ScrollView, Text, TextInput, TouchableOpacity, View,} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";
import { mockUser } from "@/data/mockData";
import {getSessionWorkouts, subscribeSessionWorkouts,} from "@/data/workoutSession";
import { Workout } from "@/types/models";

function getMonthName(date: Date) {
    return date.toLocaleDateString("fr-CA", {
        month: "long",
        year: "numeric",
    });
}

function toLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
    return new Date(year, monthIndex + 1, 0).getDate();
}

export default function ProfileScreen() {
    const { theme } = useTheme();
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

    const [sessionWorkouts, setSessionWorkouts] = useState<Workout[]>(
        getSessionWorkouts()
    );

    const [prenomAffiche, setPrenomAffiche] = useState<string>("Jougbouny");
    const [usernameAffiche, setUsernameAffiche] = useState<string>("jougbounyfit");
    const [objectifAffiche, setObjectifAffiche] = useState<string>(
        String(mockUser.goal ?? "Perdre du gras / gagner en discipline")
    );

    const [nomDraft, setNomDraft] = useState<string>(prenomAffiche);
    const [usernameDraft, setUsernameDraft] = useState<string>(usernameAffiche);
    const [objectifDraft, setObjectifDraft] = useState<string>(objectifAffiche);

    const [profilModalVisible, setProfilModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    useEffect(() => {
        const unsubscribe = subscribeSessionWorkouts(() => {
            setSessionWorkouts([...getSessionWorkouts()]);
        });
        return () => unsubscribe();
    }, []);

    const allWorkouts = useMemo(() => {
        return [...sessionWorkouts]
            .filter((workout) => workout.completed)
            .sort((a, b) =>
                `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)
            );
    }, [sessionWorkouts]);

    const totalWorkouts = allWorkouts.length;

    const totalExercises = allWorkouts.reduce((total, workout) => {
        return total + workout.exercises.length;
    }, 0);

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

    const rank = useMemo(() => {
        if (totalWorkouts >= 20) return "Diamant";
        if (totalWorkouts >= 12) return "Or";
        if (totalWorkouts >= 7) return "Argent";
        return "Bronze";
    }, [totalWorkouts]);

    const badges = useMemo(() => {
        const list: string[] = [];

        if (streak >= 7) list.push("🔥 7 jours d’affilée");
        if (totalWorkouts >= 1) list.push("✅ Premier workout");
        if (totalExercises >= 100) list.push("💯 100 exercices");
        if (totalWorkouts >= 20) list.push("🏆 Niveau Diamant");

        return list;
    }, [streak, totalWorkouts, totalExercises]);

    const workoutsThisMonth = useMemo(() => {
        const year = selectedMonth.getFullYear();
        const monthIndex = selectedMonth.getMonth();

        return allWorkouts.filter((workout) => {
            const d = new Date(workout.date);
            return d.getFullYear() === year && d.getMonth() === monthIndex;
        });
    }, [allWorkouts, selectedMonth]);

    const monthlyTotal = workoutsThisMonth.length;

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

    const maxChartValue = useMemo(() => {
        const max = Math.max(...monthlyChartData.map((item) => item.value), 0);
        return max < 4 ? 4 : max;
    }, [monthlyChartData]);

    const recentWorkouts = useMemo(() => {
        return allWorkouts.slice(0, 6);
    }, [allWorkouts]);

    const selectedWorkout =
        recentWorkouts.find((workout) => workout.id === selectedWorkoutId) || null;

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

    function previousMonth() {
        setSelectedMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        );
    }

    function nextMonth() {
        setSelectedMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        );
    }

    function openEditProfile() {
        setNomDraft(prenomAffiche);
        setUsernameDraft(usernameAffiche);
        setObjectifDraft(objectifAffiche);
        setProfilModalVisible(true);
    }

    function saveProfile() {
        const cleanName = nomDraft.trim();
        const cleanUsername = usernameDraft.trim().replace(/^@+/, "");
        const cleanGoal = objectifDraft.trim();

        if (cleanName.length > 0) setPrenomAffiche(cleanName);
        if (cleanUsername.length > 0) setUsernameAffiche(cleanUsername);
        if (cleanGoal.length > 0) setObjectifAffiche(cleanGoal);

        setProfilModalVisible(false);
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 140 }}
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

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 92,
                            height: 92,
                            borderRadius: 46,
                            backgroundColor: ui.accent,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 14,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: "900",
                                color: ui.accentText,
                            }}
                        >
                            {prenomAffiche.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 24,
                            fontWeight: "800",
                            marginBottom: 4,
                        }}
                    >
                        {prenomAffiche}
                    </Text>

                    <Text
                        style={{
                            color: ui.textMuted,
                            fontSize: 15,
                            marginBottom: 10,
                        }}
                    >
                        @{usernameAffiche}
                    </Text>

                    <View
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 999,
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.badgeText,
                                fontSize: 15,
                                fontWeight: "800",
                            }}
                        >
                            {rank}
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
                        Mes stats
                    </Text>

                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontSize: 24, fontWeight: "800" }}>
                                {totalWorkouts}
                            </Text>
                            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                Workouts complétés
                            </Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontSize: 24, fontWeight: "800" }}>
                                {activeDays}
                            </Text>
                            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                Jours actifs
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontSize: 24, fontWeight: "800" }}>
                                {totalExercises}
                            </Text>
                            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                Exercices
                            </Text>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontSize: 24, fontWeight: "800" }}>
                                {streak}
                            </Text>
                            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                Streak
                            </Text>
                        </View>
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
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 14,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 18,
                                fontWeight: "700",
                            }}
                        >
                            Workouts du mois
                        </Text>

                        <Text
                            style={{
                                color: ui.accent,
                                fontSize: 18,
                                fontWeight: "800",
                            }}
                        >
                            {monthlyTotal}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <TouchableOpacity
                            onPress={previousMonth}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 12,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                                ←
                            </Text>
                        </TouchableOpacity>

                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 16,
                                fontWeight: "700",
                                textTransform: "capitalize",
                            }}
                        >
                            {getMonthName(selectedMonth)}
                        </Text>

                        <TouchableOpacity
                            onPress={nextMonth}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 12,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                                →
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            key={`${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}-${monthlyChartData.length}-${monthlyTotal}`}
                            data={monthlyChartData}
                            barWidth={16}
                            spacing={10}
                            initialSpacing={10}
                            endSpacing={28}
                            roundedTop
                            roundedBottom
                            hideRules={false}
                            rulesColor={ui.chartGrid}
                            xAxisColor={ui.chartAxis}
                            yAxisColor={ui.chartAxis}
                            yAxisTextStyle={{ color: ui.textMuted, fontSize: 11 }}
                            xAxisLabelTextStyle={{ color: ui.textMuted, fontSize: 10 }}
                            noOfSections={4}
                            maxValue={maxChartValue}
                            height={180}
                            width={Math.max(monthlyChartData.length * 30, 360)}
                        />
                    </ScrollView>
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
                        Séances récentes
                    </Text>

                    {recentWorkouts.length === 0 && (
                        <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                            Aucune séance enregistrée.
                        </Text>
                    )}

                    {recentWorkouts.length > 0 && (
                        <>
                            {recentWorkouts.map((workout) => (
                                <TouchableOpacity
                                    key={workout.id}
                                    onPress={() => setSelectedWorkoutId(workout.id)}
                                    style={{
                                        backgroundColor:
                                            selectedWorkoutId === workout.id
                                                ? ui.accent
                                                : ui.cardSecondary,
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                selectedWorkoutId === workout.id
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
                                                selectedWorkoutId === workout.id
                                                    ? ui.selectedSubtext
                                                    : ui.textMuted,
                                            fontSize: 13,
                                        }}
                                    >
                                        {workout.date} • {workout.duration} min •{" "}
                                        {workout.exercises.length} exo(s)
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {selectedWorkout && (
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
                                            fontSize: 21,
                                            fontWeight: "800",
                                            marginBottom: 14,
                                        }}
                                    >
                                        {selectedWorkout.title}
                                    </Text>

                                    {selectedWorkout.exercises.map((exercise) => (
                                        <View
                                            key={exercise.id}
                                            style={{
                                                backgroundColor: ui.cardBackground,
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

                                            <Text
                                                style={{
                                                    color: ui.textMuted,
                                                    fontSize: 14,
                                                }}
                                            >
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

                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>Username</Text>
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

                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>Objectif</Text>
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
                            <Text style={{ color: ui.textPrimary, fontWeight: "700", marginBottom: 4 }}>
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
                            <Text style={{ color: ui.textPrimary, fontWeight: "700", marginBottom: 4 }}>
                                Notifications
                            </Text>
                            <Text style={{ color: ui.textMuted }}>
                                Option à brancher plus tard.
                            </Text>
                        </View>

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