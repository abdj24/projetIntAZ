import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

export default function TabLayout() {
    const { theme } = useTheme();

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