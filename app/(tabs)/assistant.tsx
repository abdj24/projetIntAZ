import { useRef, useState } from "react";
import {ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

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

export default function AssistantEcran() {
    const scrollRef = useRef<ScrollView | null>(null);

    const { theme } = useTheme();
    const colors = Colors[theme];

    const ui = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        textSecondary: theme === "dark" ? "#93A1B5" : "#5F6B7A",
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

    const [categorieChoisie, setCategorieChoisie] = useState<Categorie>(null);
    const [choixQuestion, setChoixQuestion] = useState<ChoixQuestion>(null);
    const [choixPlanification, setChoixPlanification] = useState<ChoixPlanification>(null);
    const [choixRegime, setChoixRegime] = useState<ChoixRegime>(null);

    const [texteEntree, setTexteEntree] = useState("");
    const [demandePoids, setDemandePoids] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "m1",
            auteur: "assistant",
            texte: "Bienvenue 👋 Qu’est-ce que je peux faire pour toi aujourd’hui ?",
        },
    ]);

    function allerEnBas() {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }

    function ajouterMessage(auteur: "assistant" | "user", texte: string) {
        const nouveauMessage: Message = {
            id: Date.now().toString() + Math.random().toString(),
            auteur,
            texte,
        };

        setMessages((prev) => [...prev, nouveauMessage]);
        allerEnBas();
    }

    function resetChoixSecondaires() {
        setChoixQuestion(null);
        setChoixPlanification(null);
        setChoixRegime(null);
        setTexteEntree("");
        setDemandePoids(false);
    }

    function choisirCategorie(categorie: Categorie) {
        setCategorieChoisie(categorie);
        resetChoixSecondaires();

        if (categorie) {
            ajouterMessage("user", categorie);
        }

        if (categorie === "Questions") {
            ajouterMessage(
                "assistant",
                "Choisis une question et je vais te répondre plus clairement."
            );
        }

        if (categorie === "Planifications") {
            ajouterMessage(
                "assistant",
                "Choisis un plan et je vais te proposer une structure simple et efficace."
            );
        }

        if (categorie === "Régime") {
            ajouterMessage(
                "assistant",
                "Choisis ton objectif alimentaire. Ensuite je te demanderai ton poids pour faire un petit calcul."
            );
        }
    }

    function choisirQuestion(question: ChoixQuestion) {
        setChoixQuestion(question);
        setTexteEntree("");

        if (!question) return;

        ajouterMessage("user", question);

        if (question === "Comment perdre du gras") {
            ajouterMessage(
                "assistant",
                "Pour perdre du gras :\n\n- mange un peu moins de calories\n- garde beaucoup de protéines\n- marche plus\n- fais de la musculation\n- reste constant plusieurs semaines\n\nLe plus important, ce n’est pas être parfait 2 jours. C’est être sérieux longtemps."
            );
        }

        if (question === "Comment prendre du muscle") {
            ajouterMessage(
                "assistant",
                "Pour prendre du muscle :\n\n- entraîne-toi avec progression\n- mange assez de protéines\n- dors bien\n- garde un léger surplus calorique\n- répète les mêmes exercices assez longtemps pour progresser\n\nSans progression à l’entraînement, tu limites beaucoup les résultats."
            );
        }

        if (question === "Comment rester motivé") {
            ajouterMessage(
                "assistant",
                "La motivation monte et descend. Ce qu’il te faut surtout, c’est une routine.\n\n- fixe des jours précis\n- commence petit\n- note tes progrès\n- évite de négocier avec toi-même\n- pense long terme\n\nLa discipline bat la motivation."
            );
        }
    }

    function choisirPlanification(plan: ChoixPlanification) {
        setChoixPlanification(plan);
        setTexteEntree("");

        if (!plan) return;

        ajouterMessage("user", plan);

        if (plan === "Plan 3 jours") {
            ajouterMessage(
                "assistant",
                "Plan 3 jours :\n\nJour 1 : Haut du corps\nJour 2 : Bas du corps\nJour 3 : Cardio + abdos\n\nC’est un bon choix pour débuter ou reprendre sérieusement."
            );
        }

        if (plan === "Plan 4 jours") {
            ajouterMessage(
                "assistant",
                "Plan 4 jours :\n\nJour 1 : Push\nJour 2 : Pull\nJour 3 : Legs\nJour 4 : Cardio + core\n\nTrès bon équilibre entre progression et récupération."
            );
        }

        if (plan === "Plan 5 jours") {
            ajouterMessage(
                "assistant",
                "Plan 5 jours :\n\nJour 1 : Pecs / triceps\nJour 2 : Dos / biceps\nJour 3 : Jambes\nJour 4 : Épaules / abdos\nJour 5 : Cardio ou rappel point faible\n\nC’est bien si tu es déjà régulier."
            );
        }
    }

    function choisirRegime(regime: ChoixRegime) {
        setChoixRegime(regime);
        setTexteEntree("");
        setDemandePoids(false);

        if (!regime) return;

        ajouterMessage("user", regime);

        if (regime === "Cut") {
            ajouterMessage(
                "assistant",
                "Objectif cut choisi. Entre ton poids en kg et je vais te donner une estimation simple de calories et protéines."
            );
            setDemandePoids(true);
        }

        if (regime === "Maintien") {
            ajouterMessage(
                "assistant",
                "Objectif maintien choisi. Entre ton poids en kg et je vais te donner une estimation simple."
            );
            setDemandePoids(true);
        }

        if (regime === "Bulk") {
            ajouterMessage(
                "assistant",
                "Objectif bulk choisi. Entre ton poids en kg et je vais te donner une estimation simple."
            );
            setDemandePoids(true);
        }
    }

    function envoyerPoids() {
        if (texteEntree.trim() === "") {
            return;
        }

        ajouterMessage("user", texteEntree);

        const poids = parseFloat(texteEntree);

        if (isNaN(poids) || poids <= 0 || poids > 400) {
            ajouterMessage("assistant", "Entre un poids valide en kg.");
            setTexteEntree("");
            return;
        }

        const maintien = poids * 33;
        let calories = maintien;
        let proteines = poids * 2;
        let conseil = "";

        if (choixRegime === "Cut") {
            calories = maintien - 400;
            proteines = poids * 2.2;
            conseil =
                "Vise une perte progressive, garde beaucoup de protéines et évite de couper trop brutalement.";
        }

        if (choixRegime === "Maintien") {
            calories = maintien;
            proteines = poids * 2;
            conseil =
                "Le maintien est utile pour stabiliser ton poids, mieux récupérer et progresser proprement.";
        }

        if (choixRegime === "Bulk") {
            calories = maintien + 300;
            proteines = poids * 2;
            conseil =
                "Vise une prise de masse lente. Si tu montes trop vite, tu prendras surtout du gras.";
        }

        ajouterMessage(
            "assistant",
            "Voici ton estimation 👇\n\n" +
            "Poids : " +
            poids +
            " kg\n" +
            "Calories de maintien estimées : " +
            Math.round(maintien) +
            " kcal\n" +
            "Calories pour ton objectif : " +
            Math.round(calories) +
            " kcal\n" +
            "Protéines recommandées : " +
            Math.round(proteines) +
            " g / jour\n\n" +
            conseil
        );

        setTexteEntree("");
        setDemandePoids(false);
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <View style={{ padding: 20, paddingTop: 30, paddingBottom: 10 }}>
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 8,
                    }}
                >
                    Assistant
                </Text>

                <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                    Conseils, planifications et régime
                </Text>
            </View>

            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={{
                            alignItems: message.auteur === "assistant" ? "flex-start" : "flex-end",
                            marginBottom: 12,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor:
                                    message.auteur === "assistant"
                                        ? ui.assistantBubble
                                        : ui.userBubble,
                                borderRadius: 20,
                                padding: 16,
                                maxWidth: "85%",
                                borderWidth: message.auteur === "assistant" ? 1 : 0,
                                borderColor: ui.border,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        message.auteur === "assistant"
                                            ? ui.assistantLabel
                                            : ui.userText,
                                    fontSize: 13,
                                    fontWeight: "700",
                                    marginBottom: 6,
                                }}
                            >
                                {message.auteur === "assistant" ? "Assistant" : "Toi"}
                            </Text>

                            <Text
                                style={{
                                    color:
                                        message.auteur === "assistant"
                                            ? ui.assistantText
                                            : ui.userText,
                                    fontSize: 16,
                                    lineHeight: 22,
                                }}
                            >
                                {message.texte}
                            </Text>
                        </View>
                    </View>
                ))}

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginTop: 8,
                        marginBottom: 16,
                    }}
                >
                    {(["Questions", "Planifications", "Régime"] as Categorie[]).map((categorie) => (
                        <TouchableOpacity
                            key={categorie ?? ""}
                            onPress={() => choisirCategorie(categorie)}
                            style={{
                                backgroundColor:
                                    categorieChoisie === categorie
                                        ? ui.accent
                                        : ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        categorieChoisie === categorie
                                            ? ui.accentText
                                            : ui.textPrimary,
                                    fontSize: 16,
                                    fontWeight: "700",
                                }}
                            >
                                {categorie}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {categorieChoisie === "Questions" && (
                    <View
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: ui.border,
                            marginBottom: 16,
                        }}
                    >
                        {(
                            [
                                "Comment perdre du gras",
                                "Comment prendre du muscle",
                                "Comment rester motivé",
                            ] as ChoixQuestion[]
                        ).map((question) => (
                            <TouchableOpacity
                                key={question ?? ""}
                                onPress={() => choisirQuestion(question)}
                                style={{
                                    backgroundColor:
                                        choixQuestion === question
                                            ? ui.accent
                                            : ui.cardSecondary,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            choixQuestion === question
                                                ? ui.accentText
                                                : ui.textPrimary,
                                        fontSize: 15,
                                        fontWeight: "700",
                                    }}
                                >
                                    {question}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {categorieChoisie === "Planifications" && (
                    <View
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: ui.border,
                            marginBottom: 16,
                        }}
                    >
                        {(["Plan 3 jours", "Plan 4 jours", "Plan 5 jours"] as ChoixPlanification[]).map(
                            (plan) => (
                                <TouchableOpacity
                                    key={plan ?? ""}
                                    onPress={() => choisirPlanification(plan)}
                                    style={{
                                        backgroundColor:
                                            choixPlanification === plan
                                                ? ui.accent
                                                : ui.cardSecondary,
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                choixPlanification === plan
                                                    ? ui.accentText
                                                    : ui.textPrimary,
                                            fontSize: 15,
                                            fontWeight: "700",
                                        }}
                                    >
                                        {plan}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                )}

                {categorieChoisie === "Régime" && (
                    <View
                        style={{
                            backgroundColor: ui.cardBackground,
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: ui.border,
                            marginBottom: 16,
                        }}
                    >
                        {(["Cut", "Maintien", "Bulk"] as ChoixRegime[]).map((regime) => (
                            <TouchableOpacity
                                key={regime ?? ""}
                                onPress={() => choisirRegime(regime)}
                                style={{
                                    backgroundColor:
                                        choixRegime === regime
                                            ? ui.accent
                                            : ui.cardSecondary,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            choixRegime === regime
                                                ? ui.accentText
                                                : ui.textPrimary,
                                        fontSize: 15,
                                        fontWeight: "700",
                                    }}
                                >
                                    {regime}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {demandePoids && (
                            <View style={{ marginTop: 8 }}>
                                <TextInput
                                    value={texteEntree}
                                    onChangeText={setTexteEntree}
                                    placeholder="Entre ton poids en kg"
                                    placeholderTextColor={ui.textMuted}
                                    keyboardType="numeric"
                                    style={{
                                        backgroundColor: ui.inputBackground,
                                        color: ui.textPrimary,
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: ui.border,
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={envoyerPoids}
                                    style={{
                                        backgroundColor: ui.accent,
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: ui.accentText,
                                            fontWeight: "800",
                                        }}
                                    >
                                        Envoyer
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}