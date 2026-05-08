//Cette classe est générée par IA

import { Text, View } from "react-native";

type ProfileHeaderProps = {
    ui: any;
    prenom: string;
    username: string;
    rank: string;
};

export default function ProfileHeader({
                                          ui,
                                          prenom,
                                          username,
                                          rank,
                                      }: ProfileHeaderProps) {
    return (
        <View
            style={{
                backgroundColor: ui.cardBackground,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: ui.border,
                marginBottom: 20,
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    backgroundColor: ui.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                }}
            >
                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "900",
                        color: ui.accentText,
                    }}
                >
                    {prenom.charAt(0).toUpperCase()}
                </Text>
            </View>

            <Text
                style={{
                    color: ui.textPrimary,
                    fontSize: 24,
                    fontWeight: "800",
                    marginBottom: 4,
                }}
            >
                {prenom}
            </Text>

            <Text
                style={{
                    color: ui.textMuted,
                    fontSize: 15,
                    marginBottom: 10,
                }}
            >
                @{username}
            </Text>

            <View
                style={{
                    backgroundColor: ui.cardSecondary,
                    borderRadius: 999,
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                }}
            >
                <Text
                    style={{
                        color: ui.badgeText,
                        fontSize: 15,
                        fontWeight: "800",
                    }}
                >
                    {rank}
                </Text>
            </View>
        </View>
    );
}