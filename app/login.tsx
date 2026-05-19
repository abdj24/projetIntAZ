//Généré par IA
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
    // Initialisation du contexte d'authentification et du routeur.
    const { login, register, logout, user, token, loading } = useAuth();
    const router = useRouter();

    // Initialisation des champs du formulaire.
    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Connexion d'un utilisateur existant.
    async function handleLogin() {
        try {
            setError("");
            await login(email, password);
            router.replace("/(tabs)");
        } catch (e: any) {
            setError(e.message || "Erreur de connexion");
        }
    }

    // Creation d'un nouveau compte utilisateur.
    async function handleRegister() {
        try {
            setError("");
            await register(name, username, email, password);
            router.replace("/(tabs)");
        } catch (e: any) {
            setError(e.message || "Erreur d'inscription");
        }
    }

    // Nettoyage de la session locale.
    async function handleResetSession() {
        setError("");
        await logout();
        setEmail("");
        setPassword("");
    }

    // Redirection si l'utilisateur est deja connecte.
    if (loading) return null;

    if (user && token) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>

            {mode === "register" ? (
                <>
                    <TextInput
                        placeholder="Nom"
                        placeholderTextColor="#888"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Username"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                        autoCapitalize="none"
                    />
                </>
            ) : null}

            <TextInput
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={styles.button}
                onPress={mode === "login" ? handleLogin : handleRegister}
            >
                <Text style={styles.buttonText}>
                    {mode === "login" ? "Se connecter" : "Créer le compte"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                    setError("");
                    setMode((current) => (current === "login" ? "register" : "login"));
                }}
            >
                <Text style={styles.switchButtonText}>
                    {mode === "login"
                        ? "Créer un nouveau compte"
                        : "J'ai déjà un compte"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleResetSession}>
                <Text style={styles.secondaryButtonText}>Effacer la session</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#111",
    },
    title: {
        fontSize: 32,
        color: "white",
        marginBottom: 24,
        fontWeight: "700",
        textAlign: "center",
    },
    input: {
        backgroundColor: "#222",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        color: "white",
    },
    switchButton: {
        padding: 14,
        marginTop: 8,
    },
    switchButtonText: {
        color: "#2EE6D6",
        textAlign: "center",
        fontWeight: "700",
    },
    button: {
        backgroundColor: "#2EE6D6",
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
    },
    buttonText: {
        textAlign: "center",
        fontWeight: "700",
    },
    secondaryButton: {
        padding: 14,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#444",
    },
    secondaryButtonText: {
        color: "#ddd",
        textAlign: "center",
        fontWeight: "700",
    },
    error: {
        color: "red",
        marginBottom: 10,
        textAlign: "center",
    },
});
