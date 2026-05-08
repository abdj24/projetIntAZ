//Généré par IA

import { Colors } from "@/constants/theme";
import { UiColors } from "../types/ui";
export function getUiColors(theme: "light" | "dark"): UiColors {
    const colors = Colors[theme];

    return {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textSecondary: theme === "dark" ? "#93A1B5" : "#5F6B7A",
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",

        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        cardTertiary: theme === "dark" ? "#182335" : "#DCE6F5",

        border: theme === "dark" ? "#162033" : "#D8E0EA",
        progressTrack: theme === "dark" ? "#162033" : "#D8E0EA",

        accent: "#2EE6D6",
        accentText: "#070B14",

        selectedCard: theme === "dark" ? "#1A2740" : "#D7E7FA",
        successCard: theme === "dark" ? "#163228" : "#DDF6E8",
        successText: theme === "dark" ? "#35D07F" : "#1F9D5C",
        overlay: theme === "dark" ? "#070B14" : "#FFFFFF",

        badgeText: theme === "dark" ? "#7DD3FC" : "#0a7ea4",
        chartAxis: theme === "dark" ? "#7C8799" : "#6B7280",
        chartGrid: theme === "dark" ? "#162033" : "#D8E0EA",

        selectedSubtext: theme === "dark" ? "#0B2F2B" : "#0B5F58",
        selfSubtext: theme === "dark" ? "#0B2F2B" : "#0B5F58",
        disabledText: theme === "dark" ? "#3A465C" : "#A0AEC0",

        inputBackground: theme === "dark" ? "#121C2D" : "#FFFFFF",
        assistantBubble: theme === "dark" ? "#0D1524" : "#F4F7FB",
        userBubble: "#2EE6D6",
        assistantLabel: "#2EE6D6",
        assistantText: theme === "dark" ? "#FFFFFF" : colors.text,
        userText: "#070B14",

        habitInactive: theme === "dark" ? "#1D2A44" : "#DCE6F5",
        habitActiveText: "#070B14",
    };
}