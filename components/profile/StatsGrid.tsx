//Généré par IA

import { Text, View } from "react-native";

type Props = {
    ui: any;
    totalWorkouts: number;
    activeDays: number;
    totalExercises: number;
    streak: number;
};

// Grille des statistiques principales du profil.
export default function StatsGrid({
                                      ui,
                                      totalWorkouts,
                                      activeDays,
                                      totalExercises,
                                      streak,
                                  }: Props) {
    return (
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
    );
}
