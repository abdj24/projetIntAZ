import { Workout } from "@/types/models";



let sessionWorkouts: Workout[] = [];

const listeners = new Set<() => void>();

export function getSessionWorkouts() {
    return sessionWorkouts;
}

export function addSessionWorkout(workout: Workout) {
    sessionWorkouts = [workout, ...sessionWorkouts];
    notify();
}

export function clearSessionWorkouts() {
    sessionWorkouts = [];
    notify();
}

export function subscribeSessionWorkouts(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function notify() {
    listeners.forEach((listener) => listener());
}