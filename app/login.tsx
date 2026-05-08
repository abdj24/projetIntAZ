import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin() {
        try {
            setError("");
            await login(email, password);
        } catch (e: any) {
            setError(e.message || "Erreur de connexion");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Se connecter</Text>
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
    error: {
        color: "red",
        marginBottom: 10,
        textAlign: "center",
    },
});