//Généré par IA

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "@/context/context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WorkoutProvider } from "@/context/WorkoutContext";

export const unstable_settings = {
    anchor: "(tabs)",
};

function AppNavigator() {
    const { theme } = useTheme();
    const { loading } = useAuth();

    if (loading) return null;

    return (
        <NavigationThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
        </NavigationThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <WorkoutProvider>
                    <AppNavigator />
                </WorkoutProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
