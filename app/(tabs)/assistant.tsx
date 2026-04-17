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
// Contenu des réponses
// ─────────────────────────────────────────────

const REPONSES_QUESTIONS: Record<NonNullable<ChoixQuestion>, string> = {
    "Comment perdre du gras":
        "Pour perdre du gras :\n\n- mange un peu moins de calories\n- garde beaucoup de protéines\n- marche plus\n- fais de la musculation\n- reste constant plusieurs semaines\n\nLe plus important, ce n'est pas être parfait 2 jours. C'est être sérieux longtemps.",
    "Comment prendre du muscle":
        "Pour prendre du muscle :\n\n- entraîne-toi avec progression\n- mange assez de protéines\n- dors bien\n- garde un léger surplus calorique\n- répète les mêmes exercices assez longtemps pour progresser\n\nSans progression à l'entraînement, tu limites beaucoup les résultats.",
    "Comment rester motivé":
        "La motivation monte et descend. Ce qu'il te faut surtout, c'est une routine.\n\n- fixe des jours précis\n- commence petit\n- note tes progrès\n- évite de négocier avec toi-même\n- pense long terme\n\nLa discipline bat la motivation.",
};

const REPONSES_PLANIFICATIONS: Record<NonNullable<ChoixPlanification>, string> = {
    "Plan 3 jours":
        "Plan 3 jours :\n\nJour 1 : Haut du corps\nJour 2 : Bas du corps\nJour 3 : Cardio + abdos\n\nC'est un bon choix pour débuter ou reprendre sérieusement.",
    "Plan 4 jours":
        "Plan 4 jours :\n\nJour 1 : Push\nJour 2 : Pull\nJour 3 : Legs\nJour 4 : Cardio + core\n\nTrès bon équilibre entre progression et récupération.",
    "Plan 5 jours":
        "Plan 5 jours :\n\nJour 1 : Pecs / triceps\nJour 2 : Dos / biceps\nJour 3 : Jambes\nJour 4 : Épaules / abdos\nJour 5 : Cardio ou rappel point faible\n\nC'est bien si tu es déjà régulier.",
};

const INVITES_REGIME: Record<NonNullable<ChoixRegime>, string> = {
    Cut: "Objectif cut choisi. Entre ton poids en kg et je vais te donner une estimation simple de calories et protéines.",
    Maintien: "Objectif maintien choisi. Entre ton poids en kg et je vais te donner une estimation simple.",
    Bulk: "Objectif bulk choisi. Entre ton poids en kg et je vais te donner une estimation simple.",
};

// ─────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────

function calculerRegime(
    poids: number,
    regime: NonNullable<ChoixRegime>
): { calories: number; proteines: number; conseil: string } {
    const maintien = poids * 33;

    const configs = {
        Cut: {
            calories: maintien - 400,
            proteines: poids * 2.2,
            conseil:
                "Vise une perte progressive, garde beaucoup de protéines et évite de couper trop brutalement.",
        },
        Maintien: {
            calories: maintien,
            proteines: poids * 2,
            conseil:
                "Le maintien est utile pour stabiliser ton poids, mieux récupérer et progresser proprement.",
        },
        Bulk: {
            calories: maintien + 300,
            proteines: poids * 2,
            conseil:
                "Vise une prise de masse lente. Si tu montes trop vite, tu prendras surtout du gras.",
        },
    };

    const { calories, proteines, conseil } = configs[regime];

    return {
        calories: Math.round(calories),
        proteines: Math.round(proteines),
        conseil,
    };
}

function formaterResultatRegime(
    poids: number,
    regime: NonNullable<ChoixRegime>
): string {
    const maintien = Math.round(poids * 33);
    const { calories, proteines, conseil } = calculerRegime(poids, regime);

    return (
        "Voici ton estimation 👇\n\n" +
        `Poids : ${poids} kg\n` +
        `Calories de maintien estimées : ${maintien} kcal\n` +
        `Calories pour ton objectif : ${calories} kcal\n` +
        `Protéines recommandées : ${proteines} g / jour\n\n` +
        conseil
    );
}

// ─────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────

function BulleMessage({ message, ui }: { message: Message; ui: UiColors }) {
    const estAssistant = message.auteur === "assistant";

    return (
        <View
            style={{
                alignItems: estAssistant ? "flex-start" : "flex-end",
                marginBottom: 12,
            }}
        >
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

function CarteChoix({
                        children,
                        ui,
                    }: {
    children: React.ReactNode;
    ui: UiColors;
}) {
    return (
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
            {children}
        </View>
    );
}

function SaisiePoidsForm({
                             valeur,
                             onChange,
                             onEnvoyer,
                             ui,
                         }: {
    valeur: string;
    onChange: (v: string) => void;
    onEnvoyer: () => void;
    ui: UiColors;
}) {
    return (
        <View style={{ marginTop: 8 }}>
            <TextInput
                value={valeur}
                onChangeText={onChange}
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
                onPress={onEnvoyer}
                style={{
                    backgroundColor: ui.accent,
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                }}
            >
                <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                    Envoyer
                </Text>
            </TouchableOpacity>
        </View>
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

    // ── États ──────────────────────────────────

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
            texte: "Bienvenue 👋 Qu'est-ce que je peux faire pour toi aujourd'hui ?",
        },
    ]);

    // ── Actions ────────────────────────────────

    function ajouterMessage(auteur: "assistant" | "user", texte: string) {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString() + Math.random().toString(),
                auteur,
                texte,
            },
        ]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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

        if (!categorie) return;

        ajouterMessage("user", categorie);

        const invites: Record<NonNullable<Categorie>, string> = {
            Questions: "Choisis une question et je vais te répondre plus clairement.",
            Planifications: "Choisis un plan et je vais te proposer une structure simple et efficace.",
            Régime: "Choisis ton objectif alimentaire. Ensuite je te demanderai ton poids pour faire un petit calcul.",
        };

        ajouterMessage("assistant", invites[categorie]);
    }

    function choisirQuestion(question: ChoixQuestion) {
        if (!question) return;
        setChoixQuestion(question);
        setTexteEntree("");
        ajouterMessage("user", question);
        ajouterMessage("assistant", REPONSES_QUESTIONS[question]);
    }

    function choisirPlanification(plan: ChoixPlanification) {
        if (!plan) return;
        setChoixPlanification(plan);
        setTexteEntree("");
        ajouterMessage("user", plan);
        ajouterMessage("assistant", REPONSES_PLANIFICATIONS[plan]);
    }

    function choisirRegime(regime: ChoixRegime) {
        if (!regime) return;
        setChoixRegime(regime);
        setTexteEntree("");
        setDemandePoids(false);
        ajouterMessage("user", regime);
        ajouterMessage("assistant", INVITES_REGIME[regime]);
        setDemandePoids(true);
    }

    function envoyerPoids() {
        if (texteEntree.trim() === "" || !choixRegime) return;

        ajouterMessage("user", texteEntree);

        const poids = parseFloat(texteEntree);

        if (isNaN(poids) || poids < 30 || poids > 400) {
            ajouterMessage("assistant", "Entre un poids valide en kg (entre 30 et 400).");
            setTexteEntree("");
            return;
        }

        ajouterMessage("assistant", formaterResultatRegime(poids, choixRegime));
        setTexteEntree("");
        setDemandePoids(false);
    }

    // ── Rendu ──────────────────────────────────

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            {/* En-tête */}
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

            {/* Conversation */}
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((message) => (
                    <BulleMessage key={message.id} message={message} ui={ui} />
                ))}

                {/* Catégories */}
                <CarteChoix ui={ui}>
                    {(["Questions", "Planifications", "Régime"] as NonNullable<Categorie>[]).map(
                        (categorie) => (
                            <BoutonChoix
                                key={categorie}
                                label={categorie}
                                actif={categorieChoisie === categorie}
                                onPress={() => choisirCategorie(categorie)}
                                ui={ui}
                            />
                        )
                    )}
                </CarteChoix>

                {/* Questions */}
                {categorieChoisie === "Questions" && (
                    <CarteChoix ui={ui}>
                        {(
                            [
                                "Comment perdre du gras",
                                "Comment prendre du muscle",
                                "Comment rester motivé",
                            ] as NonNullable<ChoixQuestion>[]
                        ).map((question) => (
                            <BoutonChoix
                                key={question}
                                label={question}
                                actif={choixQuestion === question}
                                onPress={() => choisirQuestion(question)}
                                ui={ui}
                            />
                        ))}
                    </CarteChoix>
                )}

                {/* Planifications */}
                {categorieChoisie === "Planifications" && (
                    <CarteChoix ui={ui}>
                        {(["Plan 3 jours", "Plan 4 jours", "Plan 5 jours"] as NonNullable<ChoixPlanification>[]).map(
                            (plan) => (
                                <BoutonChoix
                                    key={plan}
                                    label={plan}
                                    actif={choixPlanification === plan}
                                    onPress={() => choisirPlanification(plan)}
                                    ui={ui}
                                />
                            )
                        )}
                    </CarteChoix>
                )}

                {/* Régime */}
                {categorieChoisie === "Régime" && (
                    <CarteChoix ui={ui}>
                        {(["Cut", "Maintien", "Bulk"] as NonNullable<ChoixRegime>[]).map((regime) => (
                            <BoutonChoix
                                key={regime}
                                label={regime}
                                actif={choixRegime === regime}
                                onPress={() => choisirRegime(regime)}
                                ui={ui}
                            />
                        ))}

                        {demandePoids && (
                            <SaisiePoidsForm
                                valeur={texteEntree}
                                onChange={setTexteEntree}
                                onEnvoyer={envoyerPoids}
                                ui={ui}
                            />
                        )}
                    </CarteChoix>
                )}
            </ScrollView>
        </View>
    );
}
