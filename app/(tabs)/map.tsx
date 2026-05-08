//Cette classe est générée par IA

import React, { useMemo, useState } from "react";
import {Linking, Platform, ScrollView, Text, TouchableOpacity, View, useColorScheme,} from "react-native";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

type TypeLieu = "Gym" | "Parc";
type FiltreType = "Tous" | "Gym" | "Parc";

type Lieu = {
    id: string;
    nom: string;
    type: TypeLieu;
    description: string;
    latitude: number;
    longitude: number;
};

const lieux: Lieu[] = [
    {
        id: "1",
        nom: "Gym Downtown",
        type: "Gym",
        description: "Salle complète proche du centre-ville",
        latitude: 45.5017,
        longitude: -73.5673,
    },
    {
        id: "2",
        nom: "Parc Montcalm",
        type: "Parc",
        description: "Bon endroit pour courir",
        latitude: 45.508,
        longitude: -73.56,
    },
    {
        id: "3",
        nom: "Fit Club",
        type: "Gym",
        description: "Musculation et cardio",
        latitude: 45.51,
        longitude: -73.58,
    },
    {
        id: "4",
        nom: "Parc du Lac",
        type: "Parc",
        description: "Petit parc calme",
        latitude: 45.49,
        longitude: -73.55,
    },
];

function MapIframe({
                       cardBackground,
                       textPrimary,
                   }: {
    cardBackground: string;
    textPrimary: string;
}) {
    const src =
        "https://www.google.com/maps?q=45.5017,-73.5673&z=13&output=embed";

    if (Platform.OS !== "web") {
        return (
            <View
                style={{
                    height: 400,
                    borderRadius: 20,
                    backgroundColor: cardBackground,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                }}
            >
                <Text style={{ color: textPrimary, textAlign: "center" }}>
                    La carte intégrée est disponible sur le web.
                </Text>
            </View>
        );
    }

    return React.createElement("iframe", {
        src,
        width: "100%",
        height: "100%",
        style: {
            border: "0",
            borderRadius: "20px",
        },
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
    });
}

export default function MapScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const ui = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        textSecondary: theme === "dark" ? "#93A1B5" : "#5F6B7A",
        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        border: theme === "dark" ? "#162033" : "#D8E0EA",
        accent: "#2EE6D6",
        accentText: "#070B14",
    };

    const [filtre, setFiltre] = useState<FiltreType>("Tous");

    const lieuxFiltres = useMemo(() => {
        if (filtre === "Tous") return lieux;
        return lieux.filter((lieu) => lieu.type === filtre);
    }, [filtre]);

    const ouvrirGoogleMaps = async (lieu: Lieu) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lieu.latitude},${lieu.longitude}`;
        await Linking.openURL(url);
    };

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 20,
                    paddingTop: 30,
                    paddingBottom: 120,
                }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 8,
                    }}
                >
                    Map
                </Text>

                <Text
                    style={{
                        color: ui.textMuted,
                        fontSize: 15,
                        marginBottom: 18,
                    }}
                >
                    Trouve des gyms et des parcs proches
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 20,
                    }}
                >
                    {(["Tous", "Gym", "Parc"] as FiltreType[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setFiltre(type)}
                            style={{
                                backgroundColor:
                                    filtre === type ? ui.accent : ui.cardSecondary,
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 14,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        filtre === type
                                            ? ui.accentText
                                            : ui.textPrimary,
                                    fontWeight: "700",
                                }}
                            >
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View
                    style={{
                        height: 400,
                        borderRadius: 20,
                        overflow: "hidden",
                        marginBottom: 20,
                        backgroundColor: ui.cardBackground,
                        borderWidth: 1,
                        borderColor: ui.border,
                    }}
                >
                    <MapIframe
                        cardBackground={ui.cardBackground}
                        textPrimary={ui.textPrimary}
                    />
                </View>

                {lieuxFiltres.map((lieu) => (
                    <View
                        key={lieu.id}
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: ui.border,
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 18,
                                fontWeight: "800",
                                marginBottom: 6,
                            }}
                        >
                            {lieu.nom}
                        </Text>

                        <Text
                            style={{
                                color: ui.accent,
                                fontSize: 14,
                                fontWeight: "700",
                                marginBottom: 8,
                            }}
                        >
                            {lieu.type}
                        </Text>

                        <Text
                            style={{
                                color: ui.textMuted,
                                fontSize: 14,
                                marginBottom: 12,
                            }}
                        >
                            {lieu.description}
                        </Text>

                        <TouchableOpacity
                            onPress={() => ouvrirGoogleMaps(lieu)}
                            style={{
                                backgroundColor: ui.accent,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 12,
                                alignSelf: "flex-start",
                            }}
                        >
                            <Text
                                style={{
                                    color: ui.accentText,
                                    fontWeight: "800",
                                }}
                            >
                                Voir sur Google Maps
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}