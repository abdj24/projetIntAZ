const API_URL = "http://localhost:3000";

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    return response.json();
}

export async function register(
    name: string,
    username: string,
    email: string,
    password: string
) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            username,
            email,
            password,
        }),
    });

    return response.json();
}

export async function getWorkouts(token: string) {
    const response = await fetch(`${API_URL}/workouts`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
}

export async function createWorkout(token: string, workout: any) {
    const response = await fetch(`${API_URL}/workouts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workout),
    });

    return response.json();
}