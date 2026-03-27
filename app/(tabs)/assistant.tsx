import { useRef, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

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

type ChoixRegime =
    | "Cut"
    | "Maintien"
    | "Bulk"
    | null;

type Message = {
    id: string;
    auteur: "assistant" | "user";
    texte: string;
};

export default function AssistantScreen() {
    const scrollRef = useRef<ScrollView | null>(null);

    const [categorieChoisie, setCategorieChoisie] = useState<Categorie>(null);
    const [choixQuestion, setChoixQuestion] = useState<ChoixQuestion>(null);
    const [choixPlanification, setChoixPlanification] = useState<ChoixPlanification>(null);
    const [choixRegime, setChoixRegime] = useState<ChoixRegime>(null);

    const [texteEntree, setTexteEntree] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "m1",
            auteur: "assistant",
            texte: "Bienvenue 👋 Qu’est-ce que je peux faire pour toi aujourd’hui ?",
        },
    ]);

    function allerEnBas() {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollToEnd({ animated: true });
            }
        }, 100);
    }

    function ajouterMessageAssistant(texte: string) {
        const nouveauMessage: Message = {
            id: Date.now().toString() + Math.random().toString(),
            auteur: "assistant",
            texte: texte,
        };

        setMessages((prev) => [...prev, nouveauMessage]);
        allerEnBas();
    }

    function ajouterMessageUser(texte: string) {
        const nouveauMessage: Message = {
            id: Date.now().toString() + Math.random().toString(),
            auteur: "user",
            texte: texte,
        };

        setMessages((prev) => [...prev, nouveauMessage]);
        allerEnBas();
    }

    function choisirCategorie(categorie: Categorie) {
        setCategorieChoisie(categorie);
        setChoixQuestion(null);
        setChoixPlanification(null);
        setChoixRegime(null);
        setTexteEntree("");

        if (categorie !== null) {
            ajouterMessageUser(categorie);
        }

        if (categorie === "Questions") {
            ajouterMessageAssistant("Choisis une question et je vais te répondre clairement.");
        }

        if (categorie === "Planifications") {
            ajouterMessageAssistant("Choisis un type de planification et je vais te proposer un programme.");
        }

        if (categorie === "Régime") {
            ajouterMessageAssistant("Choisis un objectif alimentaire. Si besoin, je te demanderai une valeur.");
        }
    }

    function choisirQuestion(question: ChoixQuestion) {
        setChoixQuestion(question);
        setTexteEntree("");

        if (question !== null) {
            ajouterMessageUser(question);
        }

        if (question === "Comment perdre du gras") {
            ajouterMessageAssistant(
                "Pour perdre du gras efficacement : mange un peu moins de calories, garde beaucoup de protéines, marche plus, et reste constant plusieurs semaines."
            );
        }

        if (question === "Comment prendre du muscle") {
            ajouterMessageAssistant(
                "Pour prendre du muscle : fais une surcharge progressive, mange assez de protéines, dors bien et garde un léger surplus calorique."
            );
        }

        if (question === "Comment rester motivé") {
            ajouterMessageAssistant(
                "La motivation aide, mais la discipline est plus importante. Fixe-toi un horaire simple, commence petit et répète."
            );
        }
    }

    function choisirPlanification(plan: ChoixPlanification) {
        setChoixPlanification(plan);
        setTexteEntree("");

        if (plan !== null) {
            ajouterMessageUser(plan);
        }

        if (plan === "Plan 3 jours") {
            ajouterMessageAssistant(
                "Plan 3 jours :\n\nJour 1 : Haut du corps\nJour 2 : Bas du corps\nJour 3 : Cardio + abdos\n\nC’est simple et efficace pour commencer."
            );
        }

        if (plan === "Plan 4 jours") {
            ajouterMessageAssistant(
                "Plan 4 jours :\n\nJour 1 : Push\nJour 2 : Pull\nJour 3 : Legs\nJour 4 : Cardio + core\n\nBon équilibre entre récupération et progression."
            );
        }

        if (plan === "Plan 5 jours") {
            ajouterMessageAssistant(
                "Plan 5 jours :\n\nJour 1 : Pectoraux / triceps\nJour 2 : Dos / biceps\nJour 3 : Jambes\nJour 4 : Épaules / abdos\nJour 5 : Cardio ou rappel point faible"
            );
        }
    }

    function choisirRegime(regime: ChoixRegime) {
        setChoixRegime(regime);
        setTexteEntree("");

        if (regime !== null) {
            ajouterMessageUser(regime);
        }

        if (regime === "Cut") {
            ajouterMessageAssistant(
                "Objectif cut choisi. Combien de kilos veux-tu perdre ? Écris seulement le nombre."
            );
        }

        if (regime === "Maintien") {
            ajouterMessageAssistant(
                "Objectif maintien choisi. Tu peux viser une alimentation stable avec protéines élevées, glucides modérés et repas réguliers."
            );
        }

        if (regime === "Bulk") {
            ajouterMessageAssistant(
                "Objectif bulk choisi. Tu peux viser un léger surplus calorique, beaucoup de protéines et une progression régulière à l’entraînement."
            );
        }
    }

    function envoyerValeur() {
        if (texteEntree.trim() === "") {
            return;
        }

        ajouterMessageUser(texteEntree);

        if (choixRegime === "Cut") {
            const kilos = parseFloat(texteEntree);

            if (isNaN(kilos) || kilos <= 0) {
                ajouterMessageAssistant("Entre un nombre valide de kilos à perdre.");
                setTexteEntree("");
                return;
            }

            if (kilos <= 3) {
                ajouterMessageAssistant(
                    "Pour perdre " +
                    kilos +
                    " kg :\n\n- déficit léger\n- beaucoup de protéines\n- légumes à chaque repas\n- marche quotidienne\n- 3 à 4 séances par semaine\n\nC’est l’approche la plus efficace pour perdre sans trop sacrifier le muscle."
                );
            } else if (kilos <= 8) {
                ajouterMessageAssistant(
                    "Pour perdre " +
                    kilos +
                    " kg :\n\n- déficit modéré\n- repas simples et répétables\n- protéines élevées\n- réduire boissons sucrées et snacks\n- 8 000 à 10 000 pas par jour\n- 4 entraînements par semaine\n\nLe plus important sera la constance."
                );
            } else {
                ajouterMessageAssistant(
                    "Pour perdre " +
                    kilos +
                    " kg :\n\n- vise une perte progressive\n- déficit raisonnable, pas extrême\n- protéines élevées\n- beaucoup d’eau\n- cardio léger régulier\n- suivi du poids chaque semaine\n\nNe coupe pas trop brutalement, sinon tu risques de craquer."
                );
            }

            setTexteEntree("");
            return;
        }

        ajouterMessageAssistant("Choisis d’abord une option qui demande une valeur.");
        setTexteEntree("");
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#070B14" }}>
            <View style={{ padding: 20, paddingTop: 30, paddingBottom: 10 }}>
                <Text style={{ color: "white", fontSize: 34, fontWeight: "800", marginBottom: 8 }}>
                    Assistant
                </Text>

                <Text style={{ color: "#7C8799", fontSize: 15 }}>
                    Conseils, planifications et régime
                </Text>
            </View>

            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                onContentSizeChange={() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollToEnd({ animated: true });
                    }
                }}
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
                                backgroundColor: message.auteur === "assistant" ? "#0D1524" : "#2EE6D6",
                                borderRadius: 20,
                                padding: 16,
                                maxWidth: "85%",
                                borderWidth: message.auteur === "assistant" ? 1 : 0,
                                borderColor: "#162033",
                            }}
                        >
                            <Text
                                style={{
                                    color: message.auteur === "assistant" ? "#2EE6D6" : "#070B14",
                                    fontSize: 13,
                                    fontWeight: "700",
                                    marginBottom: 6,
                                }}
                            >
                                {message.auteur === "assistant" ? "Assistant" : "Toi"}
                            </Text>

                            <Text
                                style={{
                                    color: message.auteur === "assistant" ? "white" : "#070B14",
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
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginTop: 8,
                        marginBottom: 16,
                    }}
                >
                    {(["Questions", "Planifications", "Régime"] as Categorie[]).map((categorie) => (
                        <TouchableOpacity
                            key={categorie ?? ""}
                            onPress={() => choisirCategorie(categorie)}
                            style={{
                                backgroundColor: categorieChoisie === categorie ? "#2EE6D6" : "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    color: categorieChoisie === categorie ? "#070B14" : "white",
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
                            backgroundColor: "#0D1524",
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: "#162033",
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
                                    backgroundColor: choixQuestion === question ? "#2EE6D6" : "#121C2D",
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: choixQuestion === question ? "#070B14" : "white",
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
                            backgroundColor: "#0D1524",
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: "#162033",
                            marginBottom: 16,
                        }}
                    >
                        {(["Plan 3 jours", "Plan 4 jours", "Plan 5 jours"] as ChoixPlanification[]).map(
                            (plan) => (
                                <TouchableOpacity
                                    key={plan ?? ""}
                                    onPress={() => choisirPlanification(plan)}
                                    style={{
                                        backgroundColor: choixPlanification === plan ? "#2EE6D6" : "#121C2D",
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: choixPlanification === plan ? "#070B14" : "white",
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
                            backgroundColor: "#0D1524",
                            borderRadius: 20,
                            padding: 18,
                            borderWidth: 1,
                            borderColor: "#162033",
                            marginBottom: 16,
                        }}
                    >
                        {(["Cut", "Maintien", "Bulk"] as ChoixRegime[]).map((regime) => (
                            <TouchableOpacity
                                key={regime ?? ""}
                                onPress={() => choisirRegime(regime)}
                                style={{
                                    backgroundColor: choixRegime === regime ? "#2EE6D6" : "#121C2D",
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        color: choixRegime === regime ? "#070B14" : "white",
                                        fontSize: 15,
                                        fontWeight: "700",
                                    }}
                                >
                                    {regime}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {choixRegime === "Cut" && (
                            <View style={{ marginTop: 8 }}>
                                <TextInput
                                    value={texteEntree}
                                    onChangeText={setTexteEntree}
                                    placeholder="Entre le nombre de kilos"
                                    placeholderTextColor="#7C8799"
                                    keyboardType="numeric"
                                    style={{
                                        backgroundColor: "#121C2D",
                                        color: "white",
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={envoyerValeur}
                                    style={{
                                        backgroundColor: "#2EE6D6",
                                        borderRadius: 16,
                                        padding: 16,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: "#070B14", fontWeight: "800" }}>
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