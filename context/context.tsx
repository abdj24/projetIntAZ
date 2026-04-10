import React, { createContext, useContext, useState } from "react";

type ThemeType = "light" | "dark";

const ThemeContext = createContext({
    theme: "dark" as ThemeType,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>("dark");

    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}