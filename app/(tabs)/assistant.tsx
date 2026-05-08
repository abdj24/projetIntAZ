//Généré par IA
import { useMemo, useRef, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";
import { useWorkouts } from "@/context/WorkoutContext";
import { toLocalDateString } from "@/components/utils/dateUtils";

type Categorie = "Questions" | "Programmes" | "Nutrition" | "Analyse" | null;

type Question =
    | "Perdre du gras"
    | "Prendre du muscle"
    | "Rester motive"
    | "Courbatures"
    | "Plateau"
    | "Cardio";

type Plan = "3 jours" | "4 jours" | "5 jours";
type ObjectifNutrition = "Cut" | "Maintien" | "Bulk";

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

// Reponses predefinies pour les questions rapides de l'assistant.
const REPONSES_QUESTIONS: Record<Question, string> = {
    "Perdre du gras":
        "Objectif perte de gras:\n\n1. Garde un deficit leger: environ -300 a -500 kcal par jour.\n2. Proteines hautes: 1.8 a 2.2 g/kg.\n3. Musculation 3 a 5 fois/semaine pour garder le muscle.\n4. Marche: vise 7 000 a 10 000 pas quand possible.\n5. Suis ton poids sur 2 a 4 semaines, pas juste une journee.\n\nLe but est de perdre lentement mais regulierement.",
    "Prendre du muscle":
        "Objectif prise de muscle:\n\n1. Progresse sur tes exercices: plus de reps, plus de charge ou meilleure execution.\n2. Mange assez: maintien + 200 a 300 kcal.\n3. Proteines: 1.6 a 2.2 g/kg.\n4. Sommeil: 7h+ si possible.\n5. Chaque muscle devrait etre travaille environ 2 fois/semaine.\n\nSi ton poids ne monte pas apres 2 semaines, ajoute un peu de calories.",
    "Rester motive":
        "La motivation n'est pas fiable, donc on construit un systeme:\n\n1. Choisis des jours fixes.\n2. Prepare une version courte: 15 minutes minimum les jours difficiles.\n3. Note chaque seance dans Endorphine.\n4. Ne rate jamais deux fois de suite.\n5. Mesure le progres: seances, charges, energie, sommeil.\n\nObjectif: rendre l'entrainement facile a demarrer.",
    Courbatures:
        "Pour les courbatures:\n\n- C'est normal apres une reprise ou un nouveau mouvement.\n- Bouge legerement: marche, mobilite, velo tranquille.\n- Evite de refaire tres lourd sur le meme muscle si la douleur limite le mouvement.\n- Hydrate-toi et dors bien.\n\nSi douleur vive, gonflement, blessure ou douleur articulaire persistante: reduis l'intensite et demande un avis medical.",
    Plateau:
        "Si tu stagnes:\n\n1. Verifie que tu notes tes seances.\n2. Garde les memes exercices 4 a 8 semaines.\n3. Ajoute une repetition avant d'ajouter du poids.\n4. Reduis un peu le volume si tu es fatigue tout le temps.\n5. Regarde ton sommeil et ton alimentation.\n\nUn plateau se corrige souvent avec plus de regularite, pas avec un programme totalement nouveau.",
    Cardio:
        "Cardio simple:\n\n- Pour la sante: 2 a 4 sessions de 20 a 40 min/semaine.\n- Pour perdre du gras: utile, mais l'alimentation reste centrale.\n- Pour prendre du muscle: garde le cardio modere pour ne pas nuire a la recuperation.\n\nBon choix: marche rapide, velo, incline treadmill, course legere.",
};

// Programmes proposes selon le nombre de jours disponibles.
const REPONSES_PLANS: Record<Plan, string> = {
    "3 jours":
        "Plan 3 jours, simple et efficace:\n\nJour 1 - Haut du corps\n- Push-ups ou bench press\n- Rowing\n- Shoulder press\n- Curl biceps\n- Triceps\n\nJour 2 - Bas du corps\n- Squat ou leg press\n- Fentes\n- Romanian deadlift\n- Mollets\n- Gainage\n\nJour 3 - Full body + cardio\n- Tirage\n- Presse ou squat leger\n- Developpe epaules\n- Abdos\n- 20 min cardio\n\nProgression: ajoute 1 rep par serie avant d'augmenter la charge.",
    "4 jours":
        "Plan 4 jours:\n\nJour 1 - Push\n- Pecs\n- Epaules\n- Triceps\n\nJour 2 - Pull\n- Dos\n- Arriere epaules\n- Biceps\n\nJour 3 - Legs\n- Quadriceps\n- Ischios\n- Fessiers\n- Mollets\n\nJour 4 - Cardio + core\n- 25 a 35 min cardio\n- Gainage\n- Crunch controle\n- Mobilite\n\nC'est un bon plan si tu veux progresser sans t'epuiser.",
    "5 jours":
        "Plan 5 jours:\n\nJour 1 - Pecs / triceps\nJour 2 - Dos / biceps\nJour 3 - Jambes\nJour 4 - Epaules / abdos\nJour 5 - Full body leger + cardio\n\nGarde 1 a 2 jours de repos. Si tu es fatigue, transforme le jour 5 en marche + mobilite.",
};

// Messages de depart pour le module nutrition.
const INVITES_NUTRITION: Record<ObjectifNutrition, string> = {
    Cut: "Objectif cut choisi. Entre ton poids en kg pour estimer calories et proteines.",
    Maintien: "Objectif maintien choisi. Entre ton poids en kg.",
    Bulk: "Objectif bulk choisi. Entre ton poids en kg.",
};

// Calcul simple des calories et macros selon l'objectif choisi.
function calculerNutrition(poids: number, objectif: ObjectifNutrition) {
    const maintien = poids * 33;
    const configs = {
        Cut: { calories: maintien - 450, proteines: poids * 2.1, lipides: poids * 0.8 },
        Maintien: { calories: maintien, proteines: poids * 1.9, lipides: poids * 0.9 },
        Bulk: { calories: maintien + 300, proteines: poids * 1.8, lipides: poids },
    };

    const config = configs[objectif];
    const calories = Math.round(config.calories);
    const proteines = Math.round(config.proteines);
    const lipides = Math.round(config.lipides);
    const caloriesProteines = proteines * 4;
    const caloriesLipides = lipides * 9;
    const glucides = Math.max(0, Math.round((calories - caloriesProteines - caloriesLipides) / 4));

    return { calories, proteines, lipides, glucides };
}

// Analyse du texte libre pour choisir la meilleure reponse.
function analyserTexte(texte: string) {
    const t = texte.toLowerCase();

    if (t.includes("gras") || t.includes("maigrir") || t.includes("poids")) {
        return REPONSES_QUESTIONS["Perdre du gras"];
    }
    if (t.includes("muscle") || t.includes("bulk") || t.includes("masse")) {
        return REPONSES_QUESTIONS["Prendre du muscle"];
    }
    if (t.includes("motivation") || t.includes("motive") || t.includes("flemme")) {
        return REPONSES_QUESTIONS["Rester motive"];
    }
    if (t.includes("courbature") || t.includes("douleur")) {
        return REPONSES_QUESTIONS.Courbatures;
    }
    if (t.includes("plateau") || t.includes("stagne")) {
        return REPONSES_QUESTIONS.Plateau;
    }
    if (t.includes("cardio") || t.includes("course")) {
        return REPONSES_QUESTIONS.Cardio;
    }
    if (t.includes("plan") || t.includes("programme")) {
        return "Je peux te proposer un plan 3, 4 ou 5 jours. Choisis la categorie Programmes, puis le nombre de jours qui correspond a ton horaire.";
    }

    return "Je peux t'aider sur la perte de gras, la prise de muscle, la motivation, les courbatures, le cardio, les plateaux ou un programme. Essaie une question comme: \"comment perdre du gras ?\" ou \"donne-moi un plan 4 jours\".";
}

// Affichage d'un message de conversation.
function BulleMessage({ message, ui }: { message: Message; ui: UiColors }) {
    const estAssistant = message.auteur === "assistant";

    return (
        <View style={{ alignItems: estAssistant ? "flex-start" : "flex-end", marginBottom: 12 }}>
            <View
                style={{
                    backgroundColor: estAssistant ? ui.assistantBubble : ui.userBubble,
                    borderRadius: 18,
                    padding: 16,
                    maxWidth: "88%",
                    borderWidth: estAssistant ? 1 : 0,
                    borderColor: ui.border,
                }}
            >
                <Text
                    style={{
                        color: estAssistant ? ui.assistantLabel : ui.userText,
                        fontSize: 13,
                        fontWeight: "800",
                        marginBottom: 6,
                    }}
                >
                    {estAssistant ? "Assistant" : "Toi"}
                </Text>

                <Text
                    style={{
                        color: estAssistant ? ui.assistantText : ui.userText,
                        fontSize: 15,
                        lineHeight: 22,
                    }}
                >
                    {message.texte}
                </Text>
            </View>
        </View>
    );
}

// Bouton reutilisable pour les choix de l'assistant.
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
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                marginRight: 8,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: actif ? ui.accent : ui.border,
            }}
        >
            <Text
                style={{
                    color: actif ? ui.accentText : ui.textPrimary,
                    fontSize: 14,
                    fontWeight: "800",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function AssistantEcran() {
    // Initialisation des references, du theme et des donnees d'entrainement.
    const scrollRef = useRef<ScrollView | null>(null);
    const { theme } = useTheme();
    const { workouts } = useWorkouts();
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

    // Initialisation des variables de conversation.
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "intro",
            auteur: "assistant",
            texte:
                "Salut. Je peux t'aider avec un plan d'entrainement, une question fitness, une estimation nutrition ou une analyse de tes seances.",
        },
    ]);
    const [categorieChoisie, setCategorieChoisie] = useState<Categorie>(null);
    const [objectifNutrition, setObjectifNutrition] = useState<ObjectifNutrition | null>(null);
    const [texteEntree, setTexteEntree] = useState("");
    const [demandePoids, setDemandePoids] = useState(false);

    // Analyse rapide basee sur les workouts sauvegardes.
    const analyseRapide = useMemo(() => {
        const today = toLocalDateString(new Date());
        const workoutsCompletes = workouts.filter((workout) => workout.completed);
        const workoutsAujourdhui = workoutsCompletes.filter((workout) => workout.date === today);
        const totalMinutes = workoutsCompletes.reduce((total, workout) => total + workout.duration, 0);
        const joursActifs = new Set(workoutsCompletes.map((workout) => workout.date)).size;

        if (workoutsCompletes.length === 0) {
            return "Je ne vois pas encore de seance enregistree. Termine un workout, puis je pourrai analyser ta regularite, ton volume et tes dernieres activites.";
        }

        return `Analyse rapide:\n\n- Seances completees: ${workoutsCompletes.length}\n- Aujourd'hui: ${workoutsAujourdhui.length}\n- Jours actifs: ${joursActifs}\n- Temps total: ${totalMinutes} min\n\nConseil: garde une frequence realiste. Si tu as deja fait une seance aujourd'hui, priorise recuperation, marche ou mobilite.`;
    }, [workouts]);

    // Ajout d'un message dans la conversation.
    function ajouterMessage(auteur: "assistant" | "user", texte: string) {
        setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}-${prev.length}`, auteur, texte },
        ]);

        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 50);
    }

    // Changement de categorie dans l'assistant.
    function choisirCategorie(categorie: Categorie) {
        if (!categorie) return;

        setCategorieChoisie(categorie);
        setDemandePoids(false);
        setObjectifNutrition(null);
        ajouterMessage("user", categorie);

        const invites: Record<NonNullable<Categorie>, string> = {
            Questions: "Choisis une question precise ou ecris ta question en bas.",
            Programmes: "Choisis le nombre de jours que tu peux vraiment tenir chaque semaine.",
            Nutrition: "Choisis ton objectif alimentaire. Je te donnerai une estimation simple.",
            Analyse: analyseRapide,
        };

        ajouterMessage("assistant", invites[categorie]);
    }

    function choisirQuestion(question: Question) {
        ajouterMessage("user", question);
        ajouterMessage("assistant", REPONSES_QUESTIONS[question]);
    }

    function choisirPlan(plan: Plan) {
        ajouterMessage("user", `Plan ${plan}`);
        ajouterMessage("assistant", REPONSES_PLANS[plan]);
    }

    function choisirNutrition(objectif: ObjectifNutrition) {
        setObjectifNutrition(objectif);
        setDemandePoids(true);
        ajouterMessage("user", objectif);
        ajouterMessage("assistant", INVITES_NUTRITION[objectif]);
    }

    // Envoi du texte saisi par l'utilisateur.
    function envoyerTexte() {
        const texte = texteEntree.trim();
        if (!texte) return;

        ajouterMessage("user", texte);

        if (demandePoids && objectifNutrition) {
            const poids = Number(texte.replace(",", "."));

            if (!Number.isFinite(poids) || poids < 30 || poids > 300) {
                ajouterMessage("assistant", "Entre un poids valide en kg, par exemple 82.");
                return;
            }

            const { calories, proteines, lipides, glucides } = calculerNutrition(poids, objectifNutrition);
            ajouterMessage(
                "assistant",
                `Estimation ${objectifNutrition} pour ${poids} kg:\n\n- Calories: ${calories} kcal/jour\n- Proteines: ${proteines} g/jour\n- Lipides: ${lipides} g/jour\n- Glucides: ${glucides} g/jour\n\nAjuste apres 2 semaines selon ton poids, ton energie et tes performances.`
            );
            setDemandePoids(false);
            setObjectifNutrition(null);
            setTexteEntree("");
            return;
        }

        ajouterMessage("assistant", analyserTexte(texte));
        setTexteEntree("");
    }

    // Remise a zero de la conversation.
    function resetConversation() {
        setCategorieChoisie(null);
        setDemandePoids(false);
        setObjectifNutrition(null);
        setTexteEntree("");
        setMessages([
            {
                id: "intro-reset",
                auteur: "assistant",
                texte: "Conversation remise a zero. Choisis une categorie ou pose ta question.",
            },
        ]);
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <View style={{ padding: 20, paddingTop: 30 }}>
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 6,
                    }}
                >
                    Assistant
                </Text>

                <Text style={{ color: ui.textMuted }}>
                    Questions, programmes, nutrition et analyse
                </Text>
            </View>

            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
            >
                {messages.map((message) => (
                    <BulleMessage key={message.id} message={message} ui={ui} />
                ))}

                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
                    {(["Questions", "Programmes", "Nutrition", "Analyse"] as const).map((categorie) => (
                        <BoutonChoix
                            key={categorie}
                            label={categorie}
                            actif={categorieChoisie === categorie}
                            onPress={() => choisirCategorie(categorie)}
                            ui={ui}
                        />
                    ))}
                </View>

                {categorieChoisie === "Questions" ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                        {Object.keys(REPONSES_QUESTIONS).map((question) => (
                            <BoutonChoix
                                key={question}
                                label={question}
                                actif={false}
                                onPress={() => choisirQuestion(question as Question)}
                                ui={ui}
                            />
                        ))}
                    </View>
                ) : null}

                {categorieChoisie === "Programmes" ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                        {(["3 jours", "4 jours", "5 jours"] as Plan[]).map((plan) => (
                            <BoutonChoix
                                key={plan}
                                label={`Plan ${plan}`}
                                actif={false}
                                onPress={() => choisirPlan(plan)}
                                ui={ui}
                            />
                        ))}
                    </View>
                ) : null}

                {categorieChoisie === "Nutrition" ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                        {(["Cut", "Maintien", "Bulk"] as ObjectifNutrition[]).map((objectif) => (
                            <BoutonChoix
                                key={objectif}
                                label={objectif}
                                actif={objectifNutrition === objectif}
                                onPress={() => choisirNutrition(objectif)}
                                ui={ui}
                            />
                        ))}
                    </View>
                ) : null}

                <TouchableOpacity
                    onPress={resetConversation}
                    style={{
                        backgroundColor: ui.cardSecondary,
                        borderRadius: 14,
                        padding: 14,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginTop: 8,
                    }}
                >
                    <Text style={{ color: ui.textPrimary, fontWeight: "800" }}>
                        Reinitialiser
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 14,
                    backgroundColor: ui.screenBackground,
                    borderTopWidth: 1,
                    borderTopColor: ui.border,
                }}
            >
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                        value={texteEntree}
                        onChangeText={setTexteEntree}
                        placeholder={demandePoids ? "Ton poids en kg" : "Pose une question..."}
                        placeholderTextColor={ui.textMuted}
                        keyboardType={demandePoids ? "numeric" : "default"}
                        style={{
                            flex: 1,
                            backgroundColor: ui.inputBackground,
                            color: ui.textPrimary,
                            padding: 14,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: ui.border,
                        }}
                    />

                    <TouchableOpacity
                        onPress={envoyerTexte}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 14,
                            paddingHorizontal: 18,
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ color: ui.accentText, fontWeight: "900" }}>
                            Envoyer
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
