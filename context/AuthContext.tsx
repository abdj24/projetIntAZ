//Généré par IA
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getMe, login as apiLogin, register as apiRegister, updateMe } from "@/services/api";
import { User } from "@/types/models";

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSession();
    }, []);

    async function clearSession() {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }

    async function loadSession() {
        try {
            const savedToken = await AsyncStorage.getItem("token");
            const savedUser = await AsyncStorage.getItem("user");

            if (!savedToken || !savedUser) {
                await clearSession();
                return;
            }

            setToken(savedToken);
            setUser(JSON.parse(savedUser));

            try {
                const freshUser = await getMe(savedToken);
                await AsyncStorage.setItem("user", JSON.stringify(freshUser));
                setUser(freshUser);
            } catch {
                await clearSession();
            }
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const data = await apiLogin(email, password);

        if (!data.token) {
            throw new Error(data.message || "Erreur de connexion");
        }

        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
    }

    async function register(
        name: string,
        username: string,
        email: string,
        password: string
    ) {
        const data = await apiRegister(name, username, email, password);

        if (!data.token) {
            throw new Error(data.message || "Erreur d'inscription");
        }

        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
    }

    async function updateProfile(updates: Partial<User>) {
        const currentToken = token || (await AsyncStorage.getItem("token"));

        if (!currentToken) {
            throw new Error("Session expirée. Déconnecte-toi puis reconnecte-toi.");
        }

        const updatedUser = await updateMe(currentToken, updates);

        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
    }

    async function logout() {
        await clearSession();
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                updateProfile,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth doit être utilisé dans AuthProvider");
    }

    return context;
}
