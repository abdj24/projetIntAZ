import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Lieu = {
    id: string;
    nom: string;
    type: "Gym" | "Parc";
    description: string;
};

const lieuxProches: Lieu[] = [
    {
        id: "l1",
        nom: "Gym Downtown",
        type: "Gym",
        description: "Salle complète proche du centre-ville",
    },
    {
        id: "l2",
        nom: "Parc Montcalm",
        type: "Parc",
        description: "Bon endroit pour courir et marcher",
    },
    {
        id: "l3",
        nom: "Fit Club",
        type: "Gym",
        description: "Musculation et cardio",
    },
    {
        id: "l4",
        nom: "Parc du Lac",
        type: "Parc",
        description: "Petit parc calme pour s’entraîner dehors",
    },
];

export default function MapScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: "#070B14" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 120 }}
            >
                <Text style={{ color: "white", fontSize: 34, fontWeight: "800", marginBottom: 8 }}>
                    Map
                </Text>

                <Text style={{ color: "#7C8799", fontSize: 15, marginBottom: 18 }}>
                    La carte interactive fonctionne sur mobile
                </Text>

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 260,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 22, fontWeight: "800", marginBottom: 10 }}>
                        Carte indisponible sur web
                    </Text>

                    <Text style={{ color: "#7C8799", fontSize: 15, textAlign: "center", lineHeight: 22 }}>
                        Lance l’application sur Android, iPhone ou Expo Go pour voir la vraie carte interactive.
                    </Text>
                </View>

                {lieuxProches.map((lieu) => (
                    <TouchableOpacity
                        key={lieu.id}
                        style={{
                            backgroundColor: "#0D1524",
                            borderRadius: 20,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#162033",
                            marginBottom: 12,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 18, fontWeight: "800", marginBottom: 6 }}>
                            {lieu.nom}
                        </Text>

                        <Text style={{ color: "#2EE6D6", fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
                            {lieu.type}
                        </Text>

                        <Text style={{ color: "#7C8799", fontSize: 14, lineHeight: 20 }}>
                            {lieu.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}