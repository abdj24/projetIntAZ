//Cette classe est générée par IA

import { Text, TouchableOpacity, View } from "react-native";
import { Workout } from "@/types/models";

type Props = {
    ui: any;
    recentWorkouts: Workout[];
    selectedWorkoutId: string | null;
    setSelectedWorkoutId: (id: string) => void;
};

export default function RecentWorkouts({
                                           ui,
                                           recentWorkouts,
                                           selectedWorkoutId,
                                           setSelectedWorkoutId,
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
                Séances récentes
            </Text>

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
        </View>
    );
}