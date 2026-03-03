import { View, Text } from "react-native";

export default function WorkoutScreen() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#0B0B0F",
            }}
        >
            <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>
                Workout
            </Text>
        </View>
    );
}