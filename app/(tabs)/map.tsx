//Généré par IA

import React, { useCallback, useMemo, useState } from "react";
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";
import { useAuth } from "@/context/AuthContext";
import { getPlaces } from "@/services/api";
import { Place } from "@/types/models";

type FiltreType = "Tous" | "Gym" | "Parc";

// Affichage de la carte Google Maps sur web.
function MapIframe({
                       cardBackground,
                       textPrimary,
                       latitude,
                       longitude,
                   }: {
    cardBackground: string;
    textPrimary: string;
    latitude: number;
    longitude: number;
}) {
    // Construction de l'URL de la carte a partir des coordonnees.
    const src =
        `https://www.google.com/maps?q=${latitude},${longitude}&z=13&output=embed`;

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
    // Initialisation du theme, de l'utilisateur et des couleurs.
    const { theme } = useTheme();
    const { token } = useAuth();
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

    // Initialisation des variables de la carte.
    const [filtre, setFiltre] = useState<FiltreType>("Tous");
    const [lieux, setLieux] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Chargement des lieux depuis MongoDB.
    const loadPlaces = useCallback(async () => {
        if (!token) return;

        const currentToken: string = token;

        try {
            setLoading(true);
            setError("");
            setLieux(await getPlaces(currentToken));
        } catch (e: any) {
            setError(e.message || "Erreur chargement lieux");
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Recharge les lieux quand l'onglet Map est ouvert.
    useFocusEffect(
        useCallback(() => {
            void loadPlaces();
        }, [loadPlaces])
    );

    // Application du filtre choisi par l'utilisateur.
    const lieuxFiltres = useMemo(() => {
        if (filtre === "Tous") return lieux;
        return lieux.filter((lieu) => lieu.type === filtre);
    }, [filtre, lieux]);

    const mapCenter = lieuxFiltres[0] || lieux[0];

    // Ouverture du lieu dans Google Maps.
    const ouvrirGoogleMaps = async (lieu: Place) => {
        if (lieu.latitude === undefined || lieu.longitude === undefined) return;

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
                    {mapCenter?.latitude !== undefined && mapCenter?.longitude !== undefined ? (
                        <MapIframe
                            cardBackground={ui.cardBackground}
                            textPrimary={ui.textPrimary}
                            latitude={mapCenter.latitude}
                            longitude={mapCenter.longitude}
                        />
                    ) : (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 20,
                            }}
                        >
                            <Text style={{ color: ui.textMuted, textAlign: "center" }}>
                                Aucun lieu dans MongoDB.
                            </Text>
                        </View>
                    )}
                </View>

                {loading ? (
                    <Text style={{ color: ui.textMuted, marginBottom: 12 }}>
                        Chargement des lieux...
                    </Text>
                ) : null}

                {error ? (
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: "#EF4444", marginBottom: 10 }}>
                            {error}
                        </Text>

                        <TouchableOpacity
                            onPress={loadPlaces}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 14,
                                padding: 14,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                                Reessayer
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {!loading && lieuxFiltres.length === 0 ? (
                    <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                        Aucun lieu à afficher pour ce filtre.
                    </Text>
                ) : null}

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
