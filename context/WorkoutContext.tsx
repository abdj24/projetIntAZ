//Généré par IA
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { createWorkout as apiCreateWorkout, getWorkouts } from "@/services/api";
import { Workout } from "@/types/models";
import { useAuth } from "@/context/AuthContext";

type WorkoutContextType = {
    workouts: Workout[];
    loading: boolean;
    error: string | null;
    refreshWorkouts: () => Promise<void>;
    addWorkout: (workout: Omit<Workout, "id">) => Promise<Workout>;
};

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = useCallback(async () => {
        if (token) return token;
        return AsyncStorage.getItem("token");
    }, [token]);

    const refreshWorkouts = useCallback(async () => {
        const currentToken = await getToken();

        if (!currentToken) {
            setWorkouts([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getWorkouts(currentToken);
            setWorkouts(data);
        } catch (e: any) {
            setError(e.message || "Erreur chargement workouts");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refreshWorkouts();
    }, [refreshWorkouts]);

    async function addWorkout(workout: Omit<Workout, "id">) {
        const currentToken = await getToken();

        if (!currentToken) {
            throw new Error("Session expirée. Déconnecte-toi puis reconnecte-toi.");
        }

        const savedWorkout = await apiCreateWorkout(currentToken, workout);
        setWorkouts((current) => [
            savedWorkout,
            ...current.filter((item) => item.id !== savedWorkout.id),
        ]);
        await refreshWorkouts();
        return savedWorkout;
    }

    return (
        <WorkoutContext.Provider
            value={{
                workouts,
                loading,
                error,
                refreshWorkouts,
                addWorkout,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkouts() {
    const context = useContext(WorkoutContext);

    if (!context) {
        throw new Error("useWorkouts doit être utilisé dans WorkoutProvider");
    }

    return context;
}
