//Généré par IA

import { Text, View } from "react-native";
import { UiColors } from "../types/ui";

type Props = {
    label: string;
    value: string | number;
    ui: UiColors;
};

// Carte compacte pour afficher une statistique.
export function StatCard({ label, value, ui }: Props) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: ui.cardSecondary,
                borderRadius: 16,
                padding: 16,
            }}
        >
            <Text style={{ color: ui.textPrimary, fontSize: 24, fontWeight: "800" }}>
                {value}
            </Text>

            <Text style={{ color: ui.textMuted, marginTop: 4 }}>
                {label}
            </Text>
        </View>
    );
}
