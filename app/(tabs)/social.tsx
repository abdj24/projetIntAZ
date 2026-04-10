import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mockWorkouts } from "@/data/mockData";
import { getSessionWorkouts, subscribeSessionWorkouts } from "@/data/workoutSession";
import { getEffectiveToday, subscribeTodayOverride } from "@/data/testToday";
import { Workout } from "@/types/models";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";

type RangType = "Bronze" | "Argent" | "Or" | "Diamant";

type JoueurClassement = {
    id: string;
    nom: string;
    points: number;
};

type Reaction = {
    id: string;
    ami: string;
    emoji: string;
};

type Commentaire = {
    id: string;
    auteur: string;
    texte: string;
};

type Publication = {
    id: string;
    auteur: string;
    temps: string;
    titre: string;
    description: string;
    likes: number;
    reactions: Reaction[];
    commentaires: Commentaire[];
    estMoi?: boolean;
};

const joueursBase: JoueurClassement[] = [
    { id: "c1", nom: "Toi", points: 0 },
    { id: "c2", nom: "Amine", points: 17 },
    { id: "c3", nom: "Sarah", points: 10 },
    { id: "c4", nom: "Yanis", points: 6 },
];

const publicationsAmisInitiales: Publication[] = [
    {
        id: "a1",
        auteur: "Amine",
        temps: "19:05",
        titre: "Leg day validé",
        description: "Squats, fentes et leg press. Jambes détruites 😅",
        likes: 8,
        reactions: [
            { id: "ra1", ami: "Toi", emoji: "🔥" },
            { id: "ra2", ami: "Sarah", emoji: "💯" },
        ],
        commentaires: [{ id: "ca1", auteur: "Toi", texte: "Très lourd 👏" }],
    },
    {
        id: "a2",
        auteur: "Sarah",
        temps: "17:40",
        titre: "Cardio du soir",
        description: "25 min de course + 10 min de marche rapide.",
        likes: 6,
        reactions: [{ id: "ra3", ami: "Toi", emoji: "👏" }],
        commentaires: [{ id: "ca2", auteur: "Yanis", texte: "Propre ça" }],
    },
    {
        id: "a3",
        auteur: "Yanis",
        temps: "15:20",
        titre: "Séance abdos",
        description: "Crunchs, planche et mountain climbers.",
        likes: 4,
        reactions: [{ id: "ra4", ami: "Toi", emoji: "💪" }],
        commentaires: [],
    },
];

function couleurRang(rang: RangType) {
    if (rang === "Bronze") {
        return "#B87333";
    }
    if (rang === "Argent") {
        return "#C0C0C0";
    }
    if (rang === "Or") {
        return "#FFD700";
    }
    return "#7DD3FC";
}

function calculerRang(points: number): RangType {
    if (points >= 20) {
        return "Diamant";
    }
    if (points >= 12) {
        return "Or";
    }
    if (points >= 7) {
        return "Argent";
    }
    return "Bronze";
}

function formaterTemps(date: string) {
    const objet = new Date(date);
    return objet.toLocaleDateString();
}

export default function SocialScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const ui = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        textSecondary: theme === "dark" ? "#93A1B5" : "#5F6B7A",
        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        cardTertiary: theme === "dark" ? "#182335" : "#DCE6F5",
        border: theme === "dark" ? "#162033" : "#D8E0EA",
        accent: "#2EE6D6",
        accentText: "#070B14",
        selfSubtext: theme === "dark" ? "#0B2F2B" : "#0B5F58",
    };

    const [today, setToday] = useState<string>(getEffectiveToday());
    const [sessionWorkouts, setSessionWorkouts] = useState<Workout[]>(getSessionWorkouts());

    const [publicationsAmis, setPublicationsAmis] = useState<Publication[]>(publicationsAmisInitiales);
    const [publicationsPerso, setPublicationsPerso] = useState<Publication[]>([]);
    const [compteurPublication, setCompteurPublication] = useState(1);

    const [likesMis, setLikesMis] = useState<{ [id: string]: boolean }>({});
    const [commentairesVisibles, setCommentairesVisibles] = useState<{ [id: string]: boolean }>({});
    const [reactionsPerso, setReactionsPerso] = useState<{ [id: string]: string | null }>({});
    const [commentairesAjoutes, setCommentairesAjoutes] = useState<{ [id: string]: Commentaire[] }>({});

    useEffect(() => {
        const unsubscribeWorkouts = subscribeSessionWorkouts(() => {
            setSessionWorkouts([...getSessionWorkouts()]);
        });

        const unsubscribeToday = subscribeTodayOverride(() => {
            setToday(getEffectiveToday());
        });

        return () => {
            unsubscribeWorkouts();
            unsubscribeToday();
        };
    }, []);

    const tousLesWorkouts = useMemo(() => {
        return [...sessionWorkouts, ...mockWorkouts];
    }, [sessionWorkouts]);

    const workoutsPerso = useMemo(() => {
        return tousLesWorkouts
            .filter((workout) => workout.completed)
            .sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));
    }, [tousLesWorkouts]);

    const classement = useMemo(() => {
        const mesPoints = workoutsPerso.length;

        const joueurs = joueursBase.map((joueur) => {
            if (joueur.nom === "Toi") {
                return {
                    ...joueur,
                    points: mesPoints,
                };
            }
            return joueur;
        });

        return [...joueurs].sort((a, b) => b.points - a.points);
    }, [workoutsPerso]);

    const maPublicationDuJour = useMemo(() => {
        const workoutDuJour = workoutsPerso.find((workout) => workout.date === today);

        if (!workoutDuJour) {
            return null;
        }

        return {
            id: `jour-${workoutDuJour.id}`,
            auteur: "Toi",
            temps: "Aujourd’hui",
            titre: workoutDuJour.title,
            description: `${workoutDuJour.exercises.length} exercice(s) complété(s) • ${workoutDuJour.duration} min`,
            likes: 12,
            reactions: [
                { id: "r1", ami: "Amine", emoji: "🔥" },
                { id: "r2", ami: "Sarah", emoji: "💪" },
                { id: "r3", ami: "Yanis", emoji: "👏" },
            ],
            commentaires: [
                { id: "cm1", auteur: "Amine", texte: "Grosse séance 🔥" },
                { id: "cm2", auteur: "Sarah", texte: "Bien joué 💪" },
            ],
            estMoi: true,
        } as Publication;
    }, [workoutsPerso, today]);

    const feedComplet = useMemo(() => {
        return [...publicationsPerso, ...publicationsAmis];
    }, [publicationsPerso, publicationsAmis]);

    function likerPublication(id: string, source: "moi" | "ami" | "perso") {
        const dejaLike = likesMis[id] === true;

        setLikesMis((ancien) => ({
            ...ancien,
            [id]: !dejaLike,
        }));

        if (source === "ami") {
            setPublicationsAmis((anciennes) =>
                anciennes.map((publication) => {
                    if (publication.id !== id) {
                        return publication;
                    }

                    return {
                        ...publication,
                        likes: dejaLike ? publication.likes - 1 : publication.likes + 1,
                    };
                })
            );
        }

        if (source === "perso") {
            setPublicationsPerso((anciennes) =>
                anciennes.map((publication) => {
                    if (publication.id !== id) {
                        return publication;
                    }

                    return {
                        ...publication,
                        likes: dejaLike ? publication.likes - 1 : publication.likes + 1,
                    };
                })
            );
        }
    }

    function basculerCommentaires(id: string) {
        setCommentairesVisibles((ancien) => ({
            ...ancien,
            [id]: !ancien[id],
        }));
    }

    function ajouterReactionPublication(id: string, emoji: string) {
        setReactionsPerso((ancien) => ({
            ...ancien,
            [id]: emoji,
        }));
    }

    function ajouterCommentaireRapide(id: string) {
        const nouveauCommentaire: Commentaire = {
            id: `new-${Date.now()}`,
            auteur: "Toi",
            texte: "Bravo 👏",
        };

        setCommentairesAjoutes((ancien) => ({
            ...ancien,
            [id]: [...(ancien[id] || []), nouveauCommentaire],
        }));

        setCommentairesVisibles((ancien) => ({
            ...ancien,
            [id]: true,
        }));
    }

    function publierDerniereSeance() {
        const dernierWorkout = workoutsPerso[0];

        if (!dernierWorkout) {
            return;
        }

        const nouvellePublication: Publication = {
            id: "m" + compteurPublication,
            auteur: "Toi",
            temps: "À l’instant",
            titre: dernierWorkout.title,
            description: `${dernierWorkout.exercises.length} exercice(s) complété(s) • ${dernierWorkout.duration} min`,
            likes: 0,
            reactions: [],
            commentaires: [],
            estMoi: true,
        };

        setPublicationsPerso((anciennes) => [nouvellePublication, ...anciennes]);
        setCompteurPublication((ancien) => ancien + 1);
    }

    function afficherCommentaires(publication: Publication) {
        return [...publication.commentaires, ...(commentairesAjoutes[publication.id] || [])];
    }

    function CardPublication({
                                 publication,
                                 source,
                             }: {
        publication: Publication;
        source: "moi" | "ami" | "perso";
    }) {
        const commentaires = afficherCommentaires(publication);

        return (
            <View
                style={{
                    backgroundColor: ui.cardSecondary,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 17,
                        fontWeight: "700",
                        marginBottom: 4,
                    }}
                >
                    {publication.auteur} · {publication.titre}
                </Text>

                <Text style={{ color: ui.textMuted, marginBottom: 10 }}>
                    {publication.temps}
                </Text>

                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 15,
                        marginBottom: 12,
                    }}
                >
                    {publication.description}
                </Text>

                <TouchableOpacity
                    onPress={() => likerPublication(publication.id, source)}
                    style={{
                        backgroundColor: likesMis[publication.id] ? ui.accent : ui.cardTertiary,
                        borderRadius: 14,
                        padding: 14,
                        alignItems: "center",
                        marginBottom: 10,
                    }}
                >
                    <Text
                        style={{
                            color: likesMis[publication.id] ? ui.accentText : ui.textPrimary,
                            fontWeight: "700",
                        }}
                    >
                        👍 Like : {publication.likes}
                    </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={() => basculerCommentaires(publication.id)}
                        style={{
                            flex: 1,
                            backgroundColor: ui.cardTertiary,
                            borderRadius: 14,
                            padding: 14,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                            💬 Voir commentaires
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => ajouterCommentaireRapide(publication.id)}
                        style={{
                            flex: 1,
                            backgroundColor: ui.cardTertiary,
                            borderRadius: 14,
                            padding: 14,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>
                            Ajouter bravo
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                    {["🔥", "💪", "👏", "😮"].map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            onPress={() => ajouterReactionPublication(publication.id, emoji)}
                            style={{
                                backgroundColor:
                                    reactionsPerso[publication.id] === emoji
                                        ? ui.accent
                                        : ui.cardTertiary,
                                borderRadius: 12,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                marginRight: 8,
                            }}
                        >
                            <Text style={{ fontSize: 18 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {reactionsPerso[publication.id] && (
                    <Text style={{ color: ui.accent, marginBottom: 12 }}>
                        Ta réaction : {reactionsPerso[publication.id]}
                    </Text>
                )}

                {publication.reactions.map((reaction) => (
                    <View
                        key={reaction.id}
                        style={{
                            backgroundColor: ui.cardTertiary,
                            borderRadius: 12,
                            padding: 10,
                            marginBottom: 8,
                        }}
                    >
                        <Text style={{ color: ui.textPrimary }}>
                            {reaction.ami} {reaction.emoji}
                        </Text>
                    </View>
                ))}

                {commentairesVisibles[publication.id] && (
                    <View style={{ marginTop: 8 }}>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 16,
                                fontWeight: "700",
                                marginBottom: 10,
                            }}
                        >
                            Commentaires
                        </Text>

                        {commentaires.length === 0 && (
                            <Text style={{ color: ui.textMuted }}>
                                Aucun commentaire
                            </Text>
                        )}

                        {commentaires.map((commentaire) => (
                            <View
                                key={commentaire.id}
                                style={{
                                    backgroundColor: ui.cardTertiary,
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 8,
                                }}
                            >
                                <Text style={{ color: ui.textPrimary }}>
                                    {commentaire.auteur} : {commentaire.texte}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 140 }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 34,
                        fontWeight: "800",
                        marginBottom: 8,
                    }}
                >
                    Social
                </Text>

                <Text
                    style={{
                        color: ui.textMuted,
                        fontSize: 15,
                        marginBottom: 18,
                    }}
                >
                    Classement, activité et publications
                </Text>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Classement
                    </Text>

                    {classement.map((joueur, index) => {
                        const rang = calculerRang(joueur.points);

                        return (
                            <View
                                key={joueur.id}
                                style={{
                                    backgroundColor:
                                        joueur.nom === "Toi" ? ui.accent : ui.cardSecondary,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 10,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            color:
                                                joueur.nom === "Toi"
                                                    ? ui.accentText
                                                    : ui.textPrimary,
                                            fontSize: 16,
                                            fontWeight: "700",
                                        }}
                                    >
                                        #{index + 1} {joueur.nom}
                                    </Text>

                                    <Text
                                        style={{
                                            color:
                                                joueur.nom === "Toi"
                                                    ? ui.selfSubtext
                                                    : ui.textMuted,
                                            marginTop: 4,
                                        }}
                                    >
                                        {joueur.points} séance(s)
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        color:
                                            joueur.nom === "Toi"
                                                ? ui.accentText
                                                : couleurRang(rang),
                                        fontSize: 15,
                                        fontWeight: "800",
                                    }}
                                >
                                    {rang}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Ce que j’ai fait aujourd’hui
                    </Text>

                    {!maPublicationDuJour && (
                        <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                            Aucune séance enregistrée aujourd’hui.
                        </Text>
                    )}

                    {maPublicationDuJour && (
                        <CardPublication publication={maPublicationDuJour} source="moi" />
                    )}
                </View>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Ce que mes amis ont fait aujourd’hui
                    </Text>

                    {publicationsAmis.map((publication) => (
                        <CardPublication
                            key={publication.id}
                            publication={publication}
                            source="ami"
                        />
                    ))}
                </View>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Mes publications
                    </Text>

                    <TouchableOpacity
                        onPress={publierDerniereSeance}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                            marginBottom: 14,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.accentText,
                                fontWeight: "800",
                                fontSize: 15,
                            }}
                        >
                            Publier ma dernière séance
                        </Text>
                    </TouchableOpacity>

                    {publicationsPerso.length === 0 && (
                        <Text style={{ color: ui.textMuted, fontSize: 15 }}>
                            Tu n’as pas encore publié de séance.
                        </Text>
                    )}

                    {publicationsPerso.map((publication) => (
                        <CardPublication
                            key={publication.id}
                            publication={publication}
                            source="perso"
                        />
                    ))}
                </View>

                <View
                    style={{
                        backgroundColor: ui.cardBackground,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: ui.border,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 18,
                            fontWeight: "700",
                            marginBottom: 14,
                        }}
                    >
                        Résumé rapide
                    </Text>

                    <View
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 10,
                        }}
                    >
                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                            Total de tes séances
                        </Text>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 22,
                                fontWeight: "800",
                            }}
                        >
                            {workoutsPerso.length}
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 10,
                        }}
                    >
                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                            Dernière séance
                        </Text>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 16,
                                fontWeight: "700",
                            }}
                        >
                            {workoutsPerso[0]
                                ? `${workoutsPerso[0].title} • ${formaterTemps(workoutsPerso[0].date)}`
                                : "Aucune"}
                        </Text>
                    </View>

                    <View
                        style={{
                            backgroundColor: ui.cardSecondary,
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                            Feed total
                        </Text>
                        <Text
                            style={{
                                color: ui.textPrimary,
                                fontSize: 22,
                                fontWeight: "800",
                            }}
                        >
                            {feedComplet.length}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}