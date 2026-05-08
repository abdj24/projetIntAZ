//Cette classe est générée par IA

import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type Props = {
    ui: any;
    selectedMonth: Date;
    previousMonth: () => void;
    nextMonth: () => void;
    monthlyTotal: number;
    monthlyChartData: any[];
    maxChartValue: number;
    getMonthName: (date: Date) => string;
};

export default function MonthlyWorkoutChart({
                                                ui,
                                                selectedMonth,
                                                previousMonth,
                                                nextMonth,
                                                monthlyTotal,
                                                monthlyChartData,
                                                maxChartValue,
                                                getMonthName,
                                            }: Props) {
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                }}
            >
                <Text style={{ color: ui.textPrimary, fontSize: 18, fontWeight: "700" }}>
                    Workouts du mois
                </Text>

                <Text style={{ color: ui.accent, fontSize: 18, fontWeight: "800" }}>
                    {monthlyTotal}
                </Text>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <TouchableOpacity
                    onPress={previousMonth}
                    style={{
                        backgroundColor: ui.cardSecondary,
                        borderRadius: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                    }}
                >
                    <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>←</Text>
                </TouchableOpacity>

                <Text
                    style={{
                        color: ui.textPrimary,
                        fontSize: 16,
                        fontWeight: "700",
                        textTransform: "capitalize",
                    }}
                >
                    {getMonthName(selectedMonth)}
                </Text>

                <TouchableOpacity
                    onPress={nextMonth}
                    style={{
                        backgroundColor: ui.cardSecondary,
                        borderRadius: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                    }}
                >
                    <Text style={{ color: ui.textPrimary, fontWeight: "700" }}>→</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={monthlyChartData}
                    barWidth={16}
                    spacing={10}
                    initialSpacing={10}
                    endSpacing={28}
                    roundedTop
                    roundedBottom
                    hideRules={false}
                    rulesColor={ui.chartGrid}
                    xAxisColor={ui.chartAxis}
                    yAxisColor={ui.chartAxis}
                    yAxisTextStyle={{ color: ui.textMuted, fontSize: 11 }}
                    xAxisLabelTextStyle={{ color: ui.textMuted, fontSize: 10 }}
                    noOfSections={4}
                    maxValue={maxChartValue}
                    height={180}
                    width={Math.max(monthlyChartData.length * 30, 360)}
                />
            </ScrollView>
        </View>
    );
}