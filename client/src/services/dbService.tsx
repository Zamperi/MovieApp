import type { User } from "../context/UserContext";

export async function getGroups() {
    const api_url = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${api_url}/api/groups/all`);

        if(!response.ok) {
            console.error('Endpoint for all groups failed!');
            return [];
        }

        const data = await response.json();

        if(!Array.isArray(data)) {
            console.error('Missing an array at all groups');
            return [];
        }

        return data;
    } catch(error) {
        console.error(error);
        return [];
    }
}

export async function userLogin(email: string, password: string): Promise<User> {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    return data.user as User;
}

export async function userLogout() {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(!response.ok) throw new Error('Logout failed');
}