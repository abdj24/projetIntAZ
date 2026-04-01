let todayOverride: string | null = null;

const listeners = new Set<() => void>();

export function getTodayOverride() {
    return todayOverride;
}

export function setTodayOverride(date: string | null) {
    todayOverride = date;
    listeners.forEach((listener) => listener());
}

export function getEffectiveToday() {
    if (todayOverride) {
        return todayOverride;
    }

    return new Date().toISOString().split("T")[0];
}

export function subscribeTodayOverride(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}