import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function HomeScreen() {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#070B14" }}
            contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
        >
            <Text
                style={{
                    color: "white",
                    fontSize: 34,
                    fontWeight: "800",
                    marginBottom: 6,
                }}
            >
                Home
            </Text>

            <Text
                style={{
                    color: "#7C8799",
                    fontSize: 15,
                    marginBottom: 20,
                }}
            >
                Stay balanced and connected
            </Text>

            <View
                style={{
                    backgroundColor: "#0D1524",
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: "#162033",
                }}
            >
                <Text
                    style={{
                        color: "#2EE6D6",
                        fontSize: 24,
                        fontWeight: "800",
                    }}
                >
                    4/4 Séances
                </Text>
                <Text
                    style={{
                        color: "#8190A5",
                        marginTop: 6,
                        fontSize: 14,
                    }}
                >
                    Weekly goal completed
                </Text>
            </View>

            <View
                style={{
                    backgroundColor: "#0D1524",
                    borderRadius: 22,
                    padding: 18,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: "#162033",
                }}
            >
                <Text
                    style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "700",
                        marginBottom: 10,
                    }}
                >
                    AI Wellness Assistant
                </Text>

                <Text
                    style={{
                        color: "#93A1B5",
                        fontSize: 14,
                        lineHeight: 20,
                        marginBottom: 18,
                    }}
                >
                    Need to wind down? Try a short evening meditation session.
                </Text>

                <TouchableOpacity
                    style={{
                        backgroundColor: "#1D2A44",
                        alignSelf: "flex-start",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                            fontWeight: "600",
                            fontSize: 14,
                        }}
                    >
                        Start Meditation
                    </Text>
                </TouchableOpacity>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    gap: 14,
                    marginBottom: 18,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "#0D1524",
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "#162033",
                    }}
                >
                    <Text style={{ color: "#7C8799", fontSize: 13 }}>Calories</Text>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 24,
                            fontWeight: "800",
                            marginTop: 8,
                        }}
                    >
                        520
                    </Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: "#0D1524",
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "#162033",
                    }}
                >
                    <Text style={{ color: "#7C8799", fontSize: 13 }}>Sleep</Text>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 24,
                            fontWeight: "800",
                            marginTop: 8,
                        }}
                    >
                        6h 55m
                    </Text>
                </View>
            </View>

            <View
                style={{
                    backgroundColor: "#0D1524",
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#162033",
                }}
            >
                <Text
                    style={{
                        color: "#7C8799",
                        fontSize: 13,
                        marginBottom: 10,
                    }}
                >
                    YOUR RANK
                </Text>

                <Text
                    style={{
                        color: "white",
                        fontSize: 26,
                        fontWeight: "800",
                    }}
                >
                    Diamond
                </Text>

                <View
                    style={{
                        height: 8,
                        backgroundColor: "#162033",
                        borderRadius: 999,
                        marginTop: 14,
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            width: "72%",
                            height: "100%",
                            backgroundColor: "#2EE6D6",
                            borderRadius: 999,
                        }}
                    />
                </View>
            </View>
        </ScrollView>
    );
}