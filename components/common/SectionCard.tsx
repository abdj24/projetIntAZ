//Généré par IA

import { ReactNode } from "react";
import { View } from "react-native";
import { UiColors } from "../types/ui";

type Props = {
    children: ReactNode;
    ui: UiColors;
    marginBottom?: number;
};

export function SectionCard({ children, ui, marginBottom = 20 }: Props) {
    return (
        <View
            style={{
                backgroundColor: ui.cardBackground,
                borderRadius: 20,
                padding: 18,
                borderWidth: 1,
                borderColor: ui.border,
                marginBottom,
            }}
        >
            {children}
        </View>
    );
}