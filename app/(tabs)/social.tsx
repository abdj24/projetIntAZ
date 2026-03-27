import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type RangType = "Bronze" | "Argent" | "Or" | "Diamant";

type JoueurClassement = {
    id: string;
    nom: string;
    rang: RangType;
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
};

const classement: JoueurClassement[] = [
    { id: "c1", nom: "Toi", rang: "Diamant" },
    { id: "c2", nom: "Amine", rang: "Or" },
    { id: "c3", nom: "Sarah", rang: "Argent" },
    { id: "c4", nom: "Yanis", rang: "Bronze" },
];

const maPublicationDuJour: Publication = {
    id: "p1",
    auteur: "Toi",
    temps: "Aujourd’hui - 18:10",
    titre: "Haut du corps terminé",
    description: "Bonne séance. Push-ups, développé haltères et épaules.",
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
};

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
        commentaires: [
            { id: "ca1", auteur: "Toi", texte: "Très lourd 👏" },
        ],
    },
    {
        id: "a2",
        auteur: "Sarah",
        temps: "17:40",
        titre: "Cardio du soir",
        description: "25 min de course + 10 min de marche rapide.",
        likes: 6,
        reactions: [
            { id: "ra3", ami: "Toi", emoji: "👏" },
        ],
        commentaires: [
            { id: "ca2", auteur: "Yanis", texte: "Propre ça" },
        ],
    },
    {
        id: "a3",
        auteur: "Yanis",
        temps: "15:20",
        titre: "Séance abdos",
        description: "Crunchs, planche et mountain climbers.",
        likes: 4,
        reactions: [
            { id: "ra4", ami: "Toi", emoji: "💪" },
        ],
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

export default function SocialScreen() {
    const [mesLikes, setMesLikes] = useState<number>(maPublicationDuJour.likes);
    const [jaimeMaPublication, setJaimeMaPublication] = useState(false);
    const [maReaction, setMaReaction] = useState<string | null>(null);
    const [voirCommentairesMoi, setVoirCommentairesMoi] = useState(false);

    const [publicationsAmis, setPublicationsAmis] = useState<Publication[]>(publicationsAmisInitiales);
    const [likesMis, setLikesMis] = useState<{ [id: string]: boolean }>({});
    const [commentairesVisibles, setCommentairesVisibles] = useState<{ [id: string]: boolean }>({});
    const [reactionsPerso, setReactionsPerso] = useState<{ [id: string]: string | null }>({});

    const [publicationsPerso, setPublicationsPerso] = useState<Publication[]>([]);
    const [compteurPublication, setCompteurPublication] = useState(1);

    function likerMaPublication() {
        if (jaimeMaPublication) {
            setMesLikes(mesLikes - 1);
            setJaimeMaPublication(false);
        } else {
            setMesLikes(mesLikes + 1);
            setJaimeMaPublication(true);
        }
    }

    function likerPublicationAmi(id: string) {
        const dejaLike = likesMis[id] === true;

        const nouvellesPublications = publicationsAmis.map((publication) => {
            if (publication.id === id) {
                if (dejaLike) {
                    return {
                        ...publication,
                        likes: publication.likes - 1,
                    };
                } else {
                    return {
                        ...publication,
                        likes: publication.likes + 1,
                    };
                }
            }
            return publication;
        });

        setPublicationsAmis(nouvellesPublications);

        setLikesMis({
            ...likesMis,
            [id]: !dejaLike,
        });
    }

    function basculerCommentaires(id: string) {
        setCommentairesVisibles({
            ...commentairesVisibles,
            [id]: !commentairesVisibles[id],
        });
    }

    function ajouterReactionMoi(emoji: string) {
        setMaReaction(emoji);
    }

    function ajouterReactionPublicationAmi(id: string, emoji: string) {
        setReactionsPerso({
            ...reactionsPerso,
            [id]: emoji,
        });
    }

    function publier() {
        const nouvellePublication: Publication = {
            id: "m" + compteurPublication,
            auteur: "Toi",
            temps: "À l’instant",
            titre: "Nouvelle publication",
            description: "Séance partagée avec tes amis.",
            likes: 0,
            reactions: [],
            commentaires: [],
        };

        setPublicationsPerso([nouvellePublication, ...publicationsPerso]);
        setCompteurPublication(compteurPublication + 1);
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#070B14" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 140 }}
            >
                <Text style={{ color: "white", fontSize: 34, fontWeight: "800", marginBottom: 8 }}>
                    Social
                </Text>

                <Text style={{ color: "#7C8799", fontSize: 15, marginBottom: 18 }}>
                    Classement, activité et publications
                </Text>

                {/* Classement */}

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Classement
                    </Text>

                    {classement.map((joueur, index) => (
                        <View
                            key={joueur.id}
                            style={{
                                backgroundColor: joueur.nom === "Toi" ? "#2EE6D6" : "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 10,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: joueur.nom === "Toi" ? "#070B14" : "white",
                                    fontSize: 16,
                                    fontWeight: "700",
                                }}
                            >
                                #{index + 1} {joueur.nom}
                            </Text>

                            <Text
                                style={{
                                    color: joueur.nom === "Toi" ? "#070B14" : couleurRang(joueur.rang),
                                    fontSize: 15,
                                    fontWeight: "800",
                                }}
                            >
                                {joueur.rang}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Ma publication */}

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Ce que j’ai fait aujourd’hui
                    </Text>

                    <View
                        style={{
                            backgroundColor: "#121C2D",
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginBottom: 4 }}>
                            {maPublicationDuJour.titre}
                        </Text>

                        <Text style={{ color: "#7C8799", marginBottom: 10 }}>
                            {maPublicationDuJour.temps}
                        </Text>

                        <Text style={{ color: "white", fontSize: 15, marginBottom: 14 }}>
                            {maPublicationDuJour.description}
                        </Text>

                        <TouchableOpacity
                            onPress={likerMaPublication}
                            style={{
                                backgroundColor: jaimeMaPublication ? "#2EE6D6" : "#182335",
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 10,
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: jaimeMaPublication ? "#070B14" : "white",
                                    fontWeight: "700",
                                }}
                            >
                                👍 Like : {mesLikes}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setVoirCommentairesMoi(!voirCommentairesMoi)}
                            style={{
                                backgroundColor: "#182335",
                                borderRadius: 14,
                                padding: 14,
                                marginBottom: 10,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "700" }}>
                                💬 Commenter
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: "row", marginBottom: 12 }}>
                            {["🔥", "💪", "👏", "😮"].map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => ajouterReactionMoi(emoji)}
                                    style={{
                                        backgroundColor: maReaction === emoji ? "#2EE6D6" : "#182335",
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

                        {maReaction && (
                            <Text style={{ color: "#2EE6D6", marginBottom: 12 }}>
                                Ta réaction : {maReaction}
                            </Text>
                        )}

                        <Text style={{ color: "white", fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
                            Réactions de mes amis
                        </Text>

                        {maPublicationDuJour.reactions.map((reaction) => (
                            <View
                                key={reaction.id}
                                style={{
                                    backgroundColor: "#182335",
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 8,
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 15 }}>
                                    {reaction.ami} {reaction.emoji}
                                </Text>
                            </View>
                        ))}

                        {voirCommentairesMoi && (
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ color: "white", fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
                                    Commentaires
                                </Text>

                                {maPublicationDuJour.commentaires.map((commentaire) => (
                                    <View
                                        key={commentaire.id}
                                        style={{
                                            backgroundColor: "#182335",
                                            borderRadius: 12,
                                            padding: 12,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text style={{ color: "white" }}>
                                            {commentaire.auteur} : {commentaire.texte}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Publications amis */}

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Ce que mes amis ont fait aujourd’hui
                    </Text>

                    {publicationsAmis.map((publication) => (
                        <View
                            key={publication.id}
                            style={{
                                backgroundColor: "#121C2D",
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginBottom: 4 }}>
                                {publication.auteur} · {publication.titre}
                            </Text>

                            <Text style={{ color: "#7C8799", marginBottom: 10 }}>
                                {publication.temps}
                            </Text>

                            <Text style={{ color: "white", fontSize: 15, marginBottom: 12 }}>
                                {publication.description}
                            </Text>

                            <TouchableOpacity
                                onPress={() => likerPublicationAmi(publication.id)}
                                style={{
                                    backgroundColor: likesMis[publication.id] ? "#2EE6D6" : "#182335",
                                    borderRadius: 14,
                                    padding: 14,
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: likesMis[publication.id] ? "#070B14" : "white",
                                        fontWeight: "700",
                                    }}
                                >
                                    👍 Like : {publication.likes}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => basculerCommentaires(publication.id)}
                                style={{
                                    backgroundColor: "#182335",
                                    borderRadius: 14,
                                    padding: 14,
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "700" }}>
                                    💬 Commenter
                                </Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: "row", marginBottom: 12 }}>
                                {["🔥", "💪", "👏", "😮"].map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        onPress={() => ajouterReactionPublicationAmi(publication.id, emoji)}
                                        style={{
                                            backgroundColor:
                                                reactionsPerso[publication.id] === emoji ? "#2EE6D6" : "#182335",
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
                                <Text style={{ color: "#2EE6D6", marginBottom: 12 }}>
                                    Ta réaction : {reactionsPerso[publication.id]}
                                </Text>
                            )}

                            {publication.reactions.map((reaction) => (
                                <View
                                    key={reaction.id}
                                    style={{
                                        backgroundColor: "#182335",
                                        borderRadius: 12,
                                        padding: 10,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text style={{ color: "white" }}>
                                        {reaction.ami} {reaction.emoji}
                                    </Text>
                                </View>
                            ))}

                            {commentairesVisibles[publication.id] && (
                                <View style={{ marginTop: 8 }}>
                                    <Text style={{ color: "white", fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
                                        Commentaires
                                    </Text>

                                    {publication.commentaires.length === 0 && (
                                        <Text style={{ color: "#7C8799" }}>
                                            Aucun commentaire
                                        </Text>
                                    )}

                                    {publication.commentaires.map((commentaire) => (
                                        <View
                                            key={commentaire.id}
                                            style={{
                                                backgroundColor: "#182335",
                                                borderRadius: 12,
                                                padding: 12,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Text style={{ color: "white" }}>
                                                {commentaire.auteur} : {commentaire.texte}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Section publication */}

                <View
                    style={{
                        backgroundColor: "#0D1524",
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#162033",
                        marginBottom: 20,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                        Publication
                    </Text>

                    <TouchableOpacity
                        onPress={publier}
                        style={{
                            backgroundColor: "#2EE6D6",
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "#070B14", fontWeight: "800", fontSize: 15 }}>
                            Publier ma séance
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}