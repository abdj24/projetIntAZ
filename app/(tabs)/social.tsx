//Généré par IA

import { useCallback, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View,} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/context";
import { useAuth } from "@/context/AuthContext";
import { useWorkouts } from "@/context/WorkoutContext";
import { toLocalDateString } from "@/components/utils/dateUtils";
import {addPublicationComment, ApiPublication, createPublication, FriendRequest, FriendRankingItem, FriendUser,
    getFriendRequests, getFriends, getFriendRanking, getPublications, respondFriendRequest, searchUsers,
    sendFriendRequest, setPublicationReaction, togglePublicationLike,} from "@/services/api";

type RangType = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

type UiColors = {
    screenBackground: string;
    textPrimary: string;
    textMuted: string;
    cardBackground: string;
    cardSecondary: string;
    cardTertiary: string;
    border: string;
    accent: string;
    accentText: string;
    danger: string;
    selfSubtext: string;
};

function couleurRang(rang: RangType) {
    if (rang === "Bronze") return "#B87333";
    if (rang === "Silver") return "#C0C0C0";
    if (rang === "Gold") return "#FFD700";
    if (rang === "Platinum") return "#A7F3D0";
    return "#7DD3FC";
}

function calculerRang(points: number): RangType {
    if (points >= 20) return "Diamond";
    if (points >= 12) return "Platinum";
    if (points >= 7) return "Gold";
    if (points >= 3) return "Silver";
    return "Bronze";
}

function formaterTemps(date: string) {
    return new Date(date).toLocaleDateString();
}

function SectionCard({
    ui,
    title,
    action,
    children,
}: {
    ui: UiColors;
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
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
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                }}
            >
                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 18,
                        fontWeight: "700",
                        flex: 1,
                    }}
                >
                    {title}
                </Text>
                {action}
            </View>

            {children}
        </View>
    );
}

function ActionButton({
    ui,
    label,
    onPress,
    active = false,
    disabled = false,
}: {
    ui: UiColors;
    label: string;
    onPress: () => void;
    active?: boolean;
    disabled?: boolean;
}) {
    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            style={{
                backgroundColor: active ? ui.accent : ui.cardTertiary,
                borderRadius: 14,
                padding: 13,
                alignItems: "center",
                opacity: disabled ? 0.55 : 1,
            }}
        >
            <Text
                style={{
                    color: active ? ui.accentText : ui.textPrimary,
                    fontWeight: "700",
                    textAlign: "center",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function EmptyText({ ui, text }: { ui: UiColors; text: string }) {
    return <Text style={{ color: ui.textMuted, fontSize: 15 }}>{text}</Text>;
}

function userLabel(user: FriendUser) {
    return user.username || user.name || user.email;
}

export default function SocialScreen() {
    // Initialisation du theme et des donnees globales.
    const { theme } = useTheme();
    const { user, token } = useAuth();
    const { workouts, refreshWorkouts } = useWorkouts();
    const colors = Colors[theme];

    const ui: UiColors = {
        screenBackground: colors.background,
        textPrimary: colors.text,
        textMuted: theme === "dark" ? "#7C8799" : "#6B7280",
        cardBackground: theme === "dark" ? "#0D1524" : "#F4F7FB",
        cardSecondary: theme === "dark" ? "#121C2D" : "#E9EEF5",
        cardTertiary: theme === "dark" ? "#182335" : "#DCE6F5",
        border: theme === "dark" ? "#162033" : "#D8E0EA",
        accent: "#2EE6D6",
        accentText: "#070B14",
        danger: "#EF4444",
        selfSubtext: theme === "dark" ? "#0B2F2B" : "#0B5F58",
    };

    const today = toLocalDateString(new Date());
    const displayName = user?.username || user?.name || "Toi";

    // Initialisation des variables de l'ecran social.
    const [publications, setPublications] = useState<ApiPublication[]>([]);
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [ranking, setRanking] = useState<FriendRankingItem[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
    const [friendsVisible, setFriendsVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [commentsVisible, setCommentsVisible] = useState<Record<string, boolean>>({});
    const [publicationStatus, setPublicationStatus] = useState("");
    const [friendStatus, setFriendStatus] = useState("");
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [publicationLoading, setPublicationLoading] = useState(false);

    // Recuperation du token actif, meme apres un rafraichissement de la page.
    const getCurrentToken = useCallback(async () => {
        if (token) return token;
        return AsyncStorage.getItem("token");
    }, [token]);

    // Mise a jour locale d'une publication apres une action sauvegardee.
    const replacePublication = useCallback((updated: ApiPublication) => {
        setPublications((items) =>
            items.map((publication) =>
                publication.id === updated.id ? updated : publication
            )
        );
    }, []);

    // Chargement du feed, des amis et des demandes depuis MongoDB.
    const loadSocial = useCallback(async () => {
        const currentToken = await getCurrentToken();
        if (!currentToken) return;

        try {
            setLoadingSocial(true);
            setPublicationStatus("");
            setFriendStatus("");
            const [publicationsData, friendsData, requestsData, rankingData] = await Promise.all([
                getPublications(currentToken),
                getFriends(currentToken),
                getFriendRequests(currentToken),
                getFriendRanking(currentToken),
            ]);

            setPublications(publicationsData);
            setFriends(friendsData);
            setIncomingRequests(requestsData.incoming);
            setOutgoingRequests(requestsData.outgoing);
            setRanking(rankingData);
        } catch (e: any) {
            setPublicationStatus(e.message || "Erreur chargement social");
        } finally {
            setLoadingSocial(false);
        }
    }, [getCurrentToken]);

    // Rechargement automatique quand l'utilisateur revient sur l'onglet Social.
    useFocusEffect(
        useCallback(() => {
            void refreshWorkouts();
            void loadSocial();
        }, [loadSocial, refreshWorkouts])
    );

    // Preparation des workouts termines pour publier et calculer le classement.
    const workoutsPerso = useMemo(() => {
        return [...workouts]
            .filter((workout) => workout.completed)
            .sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`));
    }, [workouts]);

    // Separation entre mes publications et celles de mes amis.
    const publicationsPerso = useMemo(
        () => publications.filter((publication) => publication.estMoi),
        [publications]
    );

    // Calcul du classement a partir des vrais workouts completes dans MongoDB.
    const classement = useMemo(() => {
        if (ranking.length > 0) return ranking;

        return [
            {
                id: user?.id || "me",
                nom: displayName,
                points: workoutsPerso.length,
                estMoi: true,
            },
        ];
    }, [displayName, ranking, user?.id, workoutsPerso.length]);

    // Creation d'un apercu de la seance du jour avant publication.
    const maPublicationDuJour = useMemo(() => {
        const workoutDuJour = workoutsPerso.find((workout) => workout.date === today);

        if (!workoutDuJour) return null;

        return {
            id: `jour-${workoutDuJour.id}`,
            auteur: displayName,
            temps: "Aujourd'hui",
            titre: workoutDuJour.title,
            description: `${workoutDuJour.exercises.length} exercice(s) complété(s) - ${workoutDuJour.duration} min`,
            likes: 0,
            reactions: [],
            commentaires: [],
            likedByMe: false,
            estMoi: true,
        } as ApiPublication;
    }, [displayName, workoutsPerso, today]);

    // Publication de la derniere seance terminee.
    async function publierDerniereSeance() {
        const dernierWorkout = workoutsPerso[0];
        const currentToken = await getCurrentToken();

        if (!currentToken) {
            setPublicationStatus("Session expirée");
            return;
        }

        if (!dernierWorkout) {
            setPublicationStatus("Termine une séance avant de publier.");
            return;
        }

        try {
            setPublicationLoading(true);
            setPublicationStatus("");
            const nouvellePublication = await createPublication(currentToken, {
                workoutId: dernierWorkout.id,
                auteur: displayName,
                temps: "À l'instant",
                titre: dernierWorkout.title,
                description: `${dernierWorkout.exercises.length} exercice(s) complété(s) - ${dernierWorkout.duration} min`,
            });

            setPublications((anciennes) => {
                const sansDoublon = anciennes.filter(
                    (item) => item.id !== nouvellePublication.id
                );
                return [nouvellePublication, ...sansDoublon];
            });
            setPublicationStatus("Publication envoyée.");
        } catch (e: any) {
            setPublicationStatus(e.message || "Erreur publication");
        } finally {
            setPublicationLoading(false);
        }
    }

    // Enregistrement du like dans MongoDB.
    async function likerPublication(publicationId: string) {
        const currentToken = await getCurrentToken();
        if (!currentToken) return;

        try {
            replacePublication(await togglePublicationLike(currentToken, publicationId));
        } catch (e: any) {
            setPublicationStatus(e.message || "Erreur like");
        }
    }

    // Enregistrement de la reaction emoji dans MongoDB.
    async function reagirPublication(publicationId: string, emoji: string) {
        const currentToken = await getCurrentToken();
        if (!currentToken) return;

        try {
            replacePublication(await setPublicationReaction(currentToken, publicationId, emoji));
        } catch (e: any) {
            setPublicationStatus(e.message || "Erreur réaction");
        }
    }

    // Enregistrement du commentaire dans MongoDB.
    async function commenterPublication(publicationId: string) {
        const currentToken = await getCurrentToken();
        const texte = (commentInputs[publicationId] || "").trim();

        if (!currentToken || !texte) return;

        try {
            replacePublication(await addPublicationComment(currentToken, publicationId, texte));
            setCommentInputs((old) => ({ ...old, [publicationId]: "" }));
            setCommentsVisible((old) => ({ ...old, [publicationId]: true }));
        } catch (e: any) {
            setPublicationStatus(e.message || "Erreur commentaire");
        }
    }

    // Recherche d'utilisateurs pour envoyer une demande d'ami.
    async function chercherUtilisateurs() {
        const currentToken = await getCurrentToken();
        const query = searchText.trim();

        if (!currentToken || query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setFriendStatus("");
            setSearchResults(await searchUsers(currentToken, query));
        } catch (e: any) {
            setFriendStatus(e.message || "Erreur recherche");
        }
    }

    // Envoi d'une demande d'ami.
    async function envoyerDemande(recipientId: string) {
        const currentToken = await getCurrentToken();
        if (!currentToken) return;

        try {
            await sendFriendRequest(currentToken, recipientId);
            setFriendStatus("Demande envoyée.");
            await loadSocial();
            await chercherUtilisateurs();
        } catch (e: any) {
            setFriendStatus(e.message || "Erreur demande");
        }
    }

    // Acceptation ou refus d'une demande d'ami.
    async function repondreDemande(requestId: string, action: "accept" | "decline") {
        const currentToken = await getCurrentToken();
        if (!currentToken) return;

        try {
            await respondFriendRequest(currentToken, requestId, action);
            setFriendStatus(action === "accept" ? "Ami ajouté." : "Demande refusée.");
            await loadSocial();
        } catch (e: any) {
            setFriendStatus(e.message || "Erreur réponse demande");
        }
    }

    // Affichage d'une publication dans le feed.
    function renderPublication(publication: ApiPublication) {
        const isPreview = publication.id.startsWith("jour-");
        const commentsOpen = commentsVisible[publication.id] === true;
        const myReaction = publication.reactions.find(
            (reaction) => reaction.userId && reaction.userId === user?.id
        );

        return (
            <View
                key={publication.id}
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

                <Text style={{ color: ui.textPrimary, fontSize: 15, marginBottom: 12 }}>
                    {publication.description}
                </Text>

                <ActionButton
                    ui={ui}
                    label={`Like: ${publication.likes}`}
                    active={publication.likedByMe}
                    disabled={isPreview}
                    onPress={() => likerPublication(publication.id)}
                />

                <View style={{ flexDirection: "row", gap: 8, marginVertical: 10 }}>
                    {["🔥", "💪", "👏", "😮"].map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            disabled={isPreview}
                            onPress={() => reagirPublication(publication.id, emoji)}
                            style={{
                                backgroundColor:
                                    myReaction?.emoji === emoji ? ui.accent : ui.cardTertiary,
                                borderRadius: 12,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                opacity: isPreview ? 0.55 : 1,
                            }}
                        >
                            <Text style={{ fontSize: 18 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {publication.reactions.length > 0 && (
                    <Text style={{ color: ui.textMuted, marginBottom: 10 }}>
                        {publication.reactions
                            .map((reaction) => `${reaction.ami} ${reaction.emoji}`)
                            .join("  ")}
                    </Text>
                )}

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                    <TextInput
                        value={commentInputs[publication.id] || ""}
                        onChangeText={(value) =>
                            setCommentInputs((old) => ({ ...old, [publication.id]: value }))
                        }
                        placeholder={
                            isPreview
                                ? "Publie la séance pour commenter"
                                : "Écrire un commentaire"
                        }
                        placeholderTextColor={ui.textMuted}
                        editable={!isPreview}
                        style={{
                            flex: 1,
                            backgroundColor: ui.cardTertiary,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            color: ui.textPrimary,
                        }}
                    />
                    <TouchableOpacity
                        disabled={isPreview}
                        onPress={() => commenterPublication(publication.id)}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 12,
                            paddingHorizontal: 14,
                            justifyContent: "center",
                            opacity: isPreview ? 0.55 : 1,
                        }}
                    >
                        <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                            Envoyer
                        </Text>
                    </TouchableOpacity>
                </View>

                <ActionButton
                    ui={ui}
                    label={
                        commentsOpen
                            ? "Masquer les commentaires"
                            : `Commentaires (${publication.commentaires.length})`
                    }
                    onPress={() =>
                        setCommentsVisible((old) => ({
                            ...old,
                            [publication.id]: !old[publication.id],
                        }))
                    }
                />

                {commentsOpen && (
                    <View style={{ marginTop: 10 }}>
                        {publication.commentaires.length === 0 ? (
                            <Text style={{ color: ui.textMuted }}>Aucun commentaire</Text>
                        ) : (
                            publication.commentaires.map((commentaire) => (
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
                                        {commentaire.auteur}: {commentaire.texte}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </View>
        );
    }

    // Affichage de la page modale des amis.
    function renderFriendsModal() {
        return (
            <Modal
                visible={friendsVisible}
                animationType="slide"
                onRequestClose={() => setFriendsVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
                    <ScrollView
                        contentContainerStyle={{
                            padding: 20,
                            paddingTop: 38,
                            paddingBottom: 60,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 18,
                            }}
                        >
                            <Text
                                style={{
                                    color: ui.textPrimary,
                                    fontSize: 30,
                                    fontWeight: "800",
                                }}
                            >
                                Amis
                            </Text>
                            <TouchableOpacity
                                onPress={() => setFriendsVisible(false)}
                                style={{
                                    backgroundColor: ui.cardTertiary,
                                    borderRadius: 14,
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                }}
                            >
                                <Text style={{ color: ui.textPrimary, fontWeight: "800" }}>
                                    Fermer
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {friendStatus ? (
                            <Text style={{ color: ui.textMuted, marginBottom: 14 }}>
                                {friendStatus}
                            </Text>
                        ) : null}

                        <SectionCard ui={ui} title="Liste d'amis">
                            {friends.length === 0 ? (
                                <EmptyText ui={ui} text="Aucun ami pour le moment." />
                            ) : (
                                friends.map((friend) => (
                                    <View
                                        key={friend.id}
                                        style={{
                                            backgroundColor: ui.cardSecondary,
                                            borderRadius: 14,
                                            padding: 14,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: ui.textPrimary,
                                                fontWeight: "800",
                                            }}
                                        >
                                            {userLabel(friend)}
                                        </Text>
                                        <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                            {friend.email}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </SectionCard>

                        <SectionCard ui={ui} title="Ajouter quelqu'un">
                            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="Nom, pseudo ou email"
                                    placeholderTextColor={ui.textMuted}
                                    autoCapitalize="none"
                                    style={{
                                        flex: 1,
                                        backgroundColor: ui.cardSecondary,
                                        borderRadius: 12,
                                        paddingHorizontal: 12,
                                        paddingVertical: 11,
                                        color: ui.textPrimary,
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={chercherUtilisateurs}
                                    style={{
                                        backgroundColor: ui.accent,
                                        borderRadius: 12,
                                        paddingHorizontal: 14,
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                                        Chercher
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {searchResults.length === 0 ? (
                                <EmptyText ui={ui} text="Recherche un utilisateur." />
                            ) : (
                                searchResults.map((result) => (
                                    <View
                                        key={result.id}
                                        style={{
                                            backgroundColor: ui.cardSecondary,
                                            borderRadius: 14,
                                            padding: 14,
                                            marginBottom: 10,
                                            gap: 10,
                                        }}
                                    >
                                        <View>
                                            <Text
                                                style={{
                                                    color: ui.textPrimary,
                                                    fontWeight: "800",
                                                }}
                                            >
                                                {userLabel(result)}
                                            </Text>
                                            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                                {result.email}
                                            </Text>
                                        </View>
                                        <ActionButton
                                            ui={ui}
                                            label={
                                                result.relation === "friend"
                                                    ? "Déjà ami"
                                                    : result.relation === "outgoing"
                                                      ? "Demande envoyée"
                                                      : result.relation === "incoming"
                                                        ? "Demande reçue"
                                                        : "Envoyer une demande"
                                            }
                                            disabled={result.relation !== "none"}
                                            onPress={() => envoyerDemande(result.id)}
                                        />
                                    </View>
                                ))
                            )}
                        </SectionCard>

                        <SectionCard ui={ui} title="Boîte aux demandes">
                            {incomingRequests.length === 0 ? (
                                <EmptyText ui={ui} text="Aucune demande reçue." />
                            ) : (
                                incomingRequests.map((request) => (
                                    <View
                                        key={request.id}
                                        style={{
                                            backgroundColor: ui.cardSecondary,
                                            borderRadius: 14,
                                            padding: 14,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: ui.textPrimary,
                                                fontWeight: "800",
                                                marginBottom: 10,
                                            }}
                                        >
                                            {userLabel(request.requester)}
                                        </Text>
                                        <View style={{ flexDirection: "row", gap: 8 }}>
                                            <View style={{ flex: 1 }}>
                                                <ActionButton
                                                    ui={ui}
                                                    label="Accepter"
                                                    active
                                                    onPress={() =>
                                                        repondreDemande(request.id, "accept")
                                                    }
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <ActionButton
                                                    ui={ui}
                                                    label="Refuser"
                                                    onPress={() =>
                                                        repondreDemande(request.id, "decline")
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </SectionCard>

                        <SectionCard ui={ui} title="Demandes envoyées">
                            {outgoingRequests.length === 0 ? (
                                <EmptyText ui={ui} text="Aucune demande en attente." />
                            ) : (
                                outgoingRequests.map((request) => (
                                    <View
                                        key={request.id}
                                        style={{
                                            backgroundColor: ui.cardSecondary,
                                            borderRadius: 14,
                                            padding: 14,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text style={{ color: ui.textPrimary, fontWeight: "800" }}>
                                            {userLabel(request.recipient)}
                                        </Text>
                                        <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                                            En attente
                                        </Text>
                                    </View>
                                ))
                            )}
                        </SectionCard>
                    </ScrollView>
                </View>
            </Modal>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: ui.screenBackground }}>
            {renderFriendsModal()}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 20,
                    paddingTop: 30,
                    paddingBottom: 140,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                    }}
                >
                    <Text
                        style={{
                            color: ui.textPrimary,
                            fontSize: 34,
                            fontWeight: "800",
                        }}
                    >
                        Social
                    </Text>
                    <TouchableOpacity
                        onPress={() => setFriendsVisible(true)}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                        }}
                    >
                        <Text style={{ color: ui.accentText, fontWeight: "800" }}>
                            Amis
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ color: ui.textMuted, fontSize: 15, marginBottom: 18 }}>
                    Feed, amis, réactions et commentaires
                </Text>

                {loadingSocial && (
                    <View style={{ marginBottom: 16 }}>
                        <ActivityIndicator color={ui.accent} />
                    </View>
                )}

                <SectionCard ui={ui} title="Classement">
                    {classement.map((joueur, index) => {
                        const rang = calculerRang(joueur.points);
                        const estMoi = joueur.estMoi === true || joueur.nom === displayName;

                        return (
                            <View
                                key={joueur.id}
                                style={{
                                    backgroundColor: estMoi ? ui.accent : ui.cardSecondary,
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
                                            color: estMoi ? ui.accentText : ui.textPrimary,
                                            fontSize: 16,
                                            fontWeight: "700",
                                        }}
                                    >
                                        #{index + 1} {joueur.nom}
                                    </Text>

                                    <Text
                                        style={{
                                            color: estMoi ? ui.selfSubtext : ui.textMuted,
                                            marginTop: 4,
                                        }}
                                    >
                                        {joueur.points} séance(s)
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        color: estMoi ? ui.accentText : couleurRang(rang),
                                        fontSize: 15,
                                        fontWeight: "800",
                                    }}
                                >
                                    {rang}
                                </Text>
                            </View>
                        );
                    })}
                </SectionCard>

                <SectionCard ui={ui} title="Ce que j'ai fait aujourd'hui">
                    {!maPublicationDuJour ? (
                        <EmptyText ui={ui} text="Aucune séance enregistrée aujourd'hui." />
                    ) : (
                        renderPublication(maPublicationDuJour)
                    )}
                </SectionCard>

                <SectionCard ui={ui} title="Feed social">
                    {publicationStatus ? (
                        <Text style={{ color: ui.textMuted, marginBottom: 12 }}>
                            {publicationStatus}
                        </Text>
                    ) : null}

                    {publications.length === 0 ? (
                        <EmptyText
                            ui={ui}
                            text="Aucune publication pour le moment. Ajoute des amis ou publie une séance."
                        />
                    ) : (
                        publications.map(renderPublication)
                    )}
                </SectionCard>

                <SectionCard ui={ui} title="Mes publications">
                    <TouchableOpacity
                        onPress={publierDerniereSeance}
                        disabled={publicationLoading}
                        style={{
                            backgroundColor: ui.accent,
                            borderRadius: 16,
                            padding: 16,
                            alignItems: "center",
                            marginBottom: 14,
                            opacity: publicationLoading ? 0.6 : 1,
                        }}
                    >
                        <Text
                            style={{
                                color: ui.accentText,
                                fontWeight: "800",
                                fontSize: 15,
                            }}
                        >
                            {publicationLoading ? "Publication..." : "Publier ma dernière séance"}
                        </Text>
                    </TouchableOpacity>

                    {publicationsPerso.length === 0 ? (
                        <EmptyText ui={ui} text="Tu n'as pas encore publié de séance." />
                    ) : (
                        publicationsPerso.map(renderPublication)
                    )}
                </SectionCard>

                <SectionCard ui={ui} title="Résumé rapide">
                    {[
                        ["Total de tes séances", workoutsPerso.length],
                        ["Amis", friends.length],
                        ["Demandes reçues", incomingRequests.length],
                        [
                            "Dernière séance",
                            workoutsPerso[0]
                                ? `${workoutsPerso[0].title} - ${formaterTemps(workoutsPerso[0].date)}`
                                : "Aucune",
                        ],
                        ["Publications dans le feed", publications.length],
                    ].map(([label, value]) => (
                        <View
                            key={String(label)}
                            style={{
                                backgroundColor: ui.cardSecondary,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 10,
                            }}
                        >
                            <Text style={{ color: ui.textMuted, marginBottom: 6 }}>
                                {label}
                            </Text>

                            <Text
                                style={{
                                    color: ui.textPrimary,
                                    fontSize: typeof value === "number" ? 22 : 16,
                                    fontWeight: "800",
                                }}
                            >
                                {value}
                            </Text>
                        </View>
                    ))}
                </SectionCard>
            </ScrollView>
        </View>
    );
}
