//Généré par IA

import React, { createContext, useContext, useState } from "react";

type ThemeType = "light" | "dark";

// Contexte global du theme.
const ThemeContext = createContext({
    theme: "dark" as ThemeType,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialisation du theme par defaut.
    const [theme, setTheme] = useState<ThemeType>("dark");

    // Changement entre theme clair et sombre.
    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook d'acces au theme courant.
export function useTheme() {
    return useContext(ThemeContext);
}
