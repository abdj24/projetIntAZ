//Généré par IA

import { View } from "react-native";
import { UiColors } from "../types/ui";

type Props = {
    value: number;
    ui: UiColors;
    height?: number;
};

export function ProgressBar({ value, ui, height = 10 }: Props) {
    const safeValue = Math.min(Math.max(value, 0), 100);

    return (
        <View
            style={{
                height,
                backgroundColor: ui.progressTrack,
                borderRadius: 999,
                overflow: "hidden",
            }}
        >
            <View
                style={{
                    width: `${safeValue}%`,
                    height: "100%",
                    backgroundColor: ui.accent,
                    borderRadius: 999,
                }}
            />
        </View>
    );
}