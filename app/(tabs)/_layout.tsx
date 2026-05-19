//Généré par IA

import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/context";

export default function TabLayout() {
    // Initialisation du theme et verification de la session.
    const { theme } = useTheme();
    const { user, token, loading } = useAuth();

    if (loading) return null;

    if (!user || !token) {
        return <Redirect href="/login" />;
    }

    // Declaration des onglets principaux de l'application.
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[theme].tint,
                tabBarInactiveTintColor: Colors[theme].icon,
                tabBarStyle: {
                    backgroundColor: Colors[theme].background,
                    borderTopColor: Colors[theme].icon,
                },
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="chart.bar.fill" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="workout"
                options={{
                    title: "Workout",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="dumbbell.fill" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="social"
                options={{
                    title: "Social",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="person.2.fill" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="map"
                options={{
                    title: "Map",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="map.fill" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="assistant"
                options={{
                    title: "Assistant",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="sparkles" color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profil"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="person.crop.circle.fill" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
