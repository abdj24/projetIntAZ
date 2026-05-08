//Cette classe est générée par IA

import { useRef, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Categorie = "Questions" | "Planifications" | "Régime" | null;

type ChoixQuestion =
    | "Comment perdre du gras"
    | "Comment prendre du muscle"
    | "Comment rester motivé"
    | null;

type ChoixPlanification =
    | "Plan 3 jours"
    | "Plan 4 jours"
    | "Plan 5 jours"
    | null;

type ChoixRegime = "Cut" | "Maintien" | "Bulk" | null;

type Message = {
    id: string;
    auteur: "assistant" | "user";
    texte: string;
};

type UiColors = {
    screenBackground: string;
    textPrimary: string;
    textMuted: string;
    cardBackground: string;
    cardSecondary: string;
    border: string;
    accent: string;
    accentText: string;
    inputBackground: string;
    assistantBubble: string;
    userBubble: string;
    assistantLabel: string;
    assistantText: string;
    userText: string;
};

// ─────────────────────────────────────────────
// Contenu réponses
// ─────────────────────────────────────────────

const REPONSES_QUESTIONS: Record<NonNullable<ChoixQuestion>, string> = {
    "Comment perdre du gras":
        "Pour perdre du gras :\n\n- mange un peu moins de calories\n- garde beaucoup de protéines\n- marche plus\n- fais de la musculation\n- reste constant plusieurs semaines",
    "Comment prendre du muscle":
        "Pour prendre du muscle :\n\n- progression à l'entraînement\n- protéines suffisantes\n- bon sommeil\n- léger surplus calorique",
    "Comment rester motivé":
        "La motivation monte et descend.\n\n- fixe des jours précis\n- note tes progrès\n- discipline > motivation",
};

const REPONSES_PLANIFICATIONS: Record<NonNullable<ChoixPlanification>, string> = {
    "Plan 3 jours":
        "Plan 3 jours :\n\nJour 1 : Haut du corps\nJour 2 : Bas du corps\nJour 3 : Cardio + abdos",
    "Plan 4 jours":
        "Plan 4 jours :\n\nJour 1 : Push\nJour 2 : Pull\nJour 3 : Legs\nJour 4 : Cardio + core",
    "Plan 5 jours":
        "Plan 5 jours :\n\nJour 1 : Pecs / triceps\nJour 2 : Dos / biceps\nJour 3 : Jambes\nJour 4 : Épaules\nJour 5 : Cardio",
};

const INVITES_REGIME: Record<NonNullable<ChoixRegime>, string> = {
    Cut: "Objectif cut choisi. Entre ton poids en kg.",
    Maintien: "Objectif maintien choisi. Entre ton poids en kg.",
    Bulk: "Objectif bulk choisi. Entre ton poids en kg.",
};

// ─────────────────────────────────────────────
// Calcul régime
// ─────────────────────────────────────────────

function calculerRegime(poids: number, regime: NonNullable<ChoixRegime>) {
    const maintien = poids * 33;

    const configs = {
        Cut: { calories: maintien - 400, proteines: poids * 2.2 },
        Maintien: { calories: maintien, proteines: poids * 2 },
        Bulk: { calories: maintien + 300, proteines: poids * 2 },
    };

    const { calories, proteines } = configs[regime];

    return {
        calories: Math.round(calories),
        proteines: Math.round(proteines),
    };
}

// ─────────────────────────────────────────────
// Sous composants
// ─────────────────────────────────────────────

function BulleMessage({ message, ui }: { message: Message; ui: UiColors }) {
    const estAssistant = message.auteur === "assistant";

    return (
        <View style={{ alignItems: estAssistant ? "flex-start" : "flex-end", marginBottom: 12 }}>
            <View
                style={{
                    backgroundColor: estAssistant ? ui.assistantBubble : ui.userBubble,
                    borderRadius: 20,
                    padding: 16,
                    maxWidth: "85%",
                    borderWidth: estAssistant ? 1 : 0,
                    borderColor: ui.border,
                }}
            >
                <Text
                    style={{
                        color: estAssistant ? ui.assistantLabel : ui.userText,
                        fontSize: 13,
                        fontWeight: "700",
                        marginBottom: 6,
                    }}
                >
                    {estAssistant ? "Assistant" : "Toi"}
                </Text>

                <Text
                    style={{
                        color: estAssistant ? ui.assistantText : ui.userText,
                        fontSize: 16,
                        lineHeight: 22,
                    }}
                >
                    {message.texte}
                </Text>
            </View>
        </View>
    );
}

function BoutonChoix({
                         label,
                         actif,
                         onPress,
                         ui,
                     }: {
    label: string;
    actif: boolean;
    onPress: () => void;
    ui: UiColors;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor: actif ? ui.accent : ui.cardSecondary,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
            }}
        >
            <Text
                style={{
                    color: actif ? ui.accentText : ui.textPrimary,
                    fontSize: 15,
                    fontWeight: "700",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────

export default function AssistantEcran() {
    const scrollRef = useRef<ScrollView | null>(null);

    const { theme } = useTheme();
    const colors = Colors[theme];

    const ui: UiColors = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        border: theme === "dark" ? "#162033" : "#D8E0EA",
        accent: "#2EE6D6",
        accentText: "#070B14",
        inputBackground: theme === "dark" ? "#121C2D" : "#FFFFFF",
        assistantBubble: theme === "dark" ? "#0D1524" : "#F4F7FB",
        userBubble: "#2EE6D6",
        assistantLabel: "#2EE6D6",
        assistantText: theme === "dark" ? "#FFFFFF" : colors.text,
        userText: "#070B14",
    };

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            auteur: "assistant",
            texte: "Bienvenue 👋 Qu'est-ce que je peux faire pour toi aujourd'hui ?",
        },
    ]);

    const [categorieChoisie, setCategorieChoisie] = useState<Categorie>(null);
    const [choixQuestion, setChoixQuestion] = useState<ChoixQuestion>(null);
    const [choixPlanification, setChoixPlanification] =
        useState<ChoixPlanification>(null);
    const [choixRegime, setChoixRegime] = useState<ChoixRegime>(null);
    const [texteEntree, setTexteEntree] = useState("");
    const [demandePoids, setDemandePoids] = useState(false);

    function ajouterMessage(auteur: "assistant" | "user", texte: string) {
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), auteur, texte },
        ]);

        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 50);
    }

    function choisirCategorie(categorie: Categorie) {
        if (categorieChoisie === categorie) return;

        setCategorieChoisie(categorie);
        setChoixQuestion(null);
        setChoixPlanification(null);
        setChoixRegime(null);

        if (!categorie) return;

        ajouterMessage("user", categorie);

        const invites = {
            Questions: "Choisis une question.",
            Planifications: "Choisis un plan.",
            Régime: "Choisis ton objectif alimentaire.",
        };

        ajouterMessage("assistant", invites[categorie]);
    }

    function choisirQuestion(question: ChoixQuestion) {
        if (!question) return;

        setChoixQuestion(question);

        ajouterMessage("user", question);
        ajouterMessage("assistant", REPONSES_QUESTIONS[question]);
    }

    function choisirPlan(plan: ChoixPlanification) {
        if (!plan) return;

        setChoixPlanification(plan);

        ajouterMessage("user", plan);
        ajouterMessage("assistant", REPONSES_PLANIFICATIONS[plan]);
    }

    function choisirRegime(regime: ChoixRegime) {
        if (!regime) return;

        setChoixRegime(regime);

        ajouterMessage("user", regime);
        ajouterMessage("assistant", INVITES_REGIME[regime]);

        setDemandePoids(true);
    }

    function envoyerPoids() {
        if (!choixRegime) return;

        const poids = parseFloat(texteEntree);

        if (isNaN(poids)) return;

        ajouterMessage("user", texteEntree);

        const { calories, proteines } = calculerRegime(poids, choixRegime);

        ajouterMessage(
            "assistant",
            `Calories estimées : ${calories} kcal\nProtéines : ${proteines} g`
        );

        setTexteEntree("");
        setDemandePoids(false);
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <View style={{ padding: 20, paddingTop: 30 }}>
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                    }}
                >
                    Assistant
                </Text>

                <Text style={{ color: ui.textMuted }}>
                    Conseils fitness et nutrition
                </Text>
            </View>

            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
            >
                {messages.map((m) => (
                    <BulleMessage key={m.id} message={m} ui={ui} />
                ))}

                <BoutonChoix
                    label="Questions"
                    actif={categorieChoisie === "Questions"}
                    onPress={() => choisirCategorie("Questions")}
                    ui={ui}
                />

                <BoutonChoix
                    label="Planifications"
                    actif={categorieChoisie === "Planifications"}
                    onPress={() => choisirCategorie("Planifications")}
                    ui={ui}
                />

                <BoutonChoix
                    label="Régime"
                    actif={categorieChoisie === "Régime"}
                    onPress={() => choisirCategorie("Régime")}
                    ui={ui}
                />

                {categorieChoisie === "Questions" && (
                    <>
                        <BoutonChoix
                            label="Comment perdre du gras"
                            actif={false}
                            onPress={() =>
                                choisirQuestion("Comment perdre du gras")
                            }
                            ui={ui}
                        />

                        <BoutonChoix
                            label="Comment prendre du muscle"
                            actif={false}
                            onPress={() =>
                                choisirQuestion("Comment prendre du muscle")
                            }
                            ui={ui}
                        />
                    </>
                )}

                {categorieChoisie === "Régime" && demandePoids && (
                    <>
                        <TextInput
                            value={texteEntree}
                            onChangeText={setTexteEntree}
                            placeholder="Entre ton poids"
                            style={{
                                backgroundColor: ui.inputBackground,
                                padding: 16,
                                borderRadius: 16,
                                marginTop: 10,
                                marginBottom: 10,
                                borderWidth: 1,
                                borderColor: ui.border,
                            }}
                        />

                        <TouchableOpacity
                            onPress={envoyerPoids}
                            style={{
                                backgroundColor: ui.accent,
                                padding: 16,
                                borderRadius: 16,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: ui.accentText, fontWeight: "700" }}>
                                Envoyer
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
}