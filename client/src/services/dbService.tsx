import type { RegisterInput, User } from "../context/UserContext";

export type GroupListItemDTO = {
    id: number;
    name: string;
    createdAt?: string | null;
};

type GroupApiDTO = {
    id?: number;
    name?: string;
    createdAt?: string | null;
    groupId?: number;
    groupName?: string;
};

function toGroupListItemDTO(x: GroupApiDTO): GroupListItemDTO | null {
    const id = x.id ?? x.groupId;
    const name = x.name ?? x.groupName;

    if (typeof id !== "number" || typeof name !== "string") return null;

    return {
        id,
        name,
        createdAt: x.createdAt ?? null,
    };
}

export async function getGroups(): Promise<GroupListItemDTO[]> {
    const api_url = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${api_url}/api/groups/all`, {
            // listaus on backendissä julkinen (ei authMiddleware)
            credentials: "include",
        });

        if (!response.ok) {
            console.error("Endpoint for all groups failed!");
            return [];
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
            console.error("Missing an array at all groups");
            return [];
        }

        const cleaned = data
            .map((item) => toGroupListItemDTO(item as GroupApiDTO))
            .filter((item): item is GroupListItemDTO => item !== null);

        return cleaned;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export type CreateGroupInput = {
    groupName: string;
    isPublic: boolean;
};

export async function createGroup(input: CreateGroupInput): Promise<GroupListItemDTO> {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/groups`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to create group");
    }

    const data = (await response.json()) as GroupApiDTO;
    const dto = toGroupListItemDTO(data);

    if (!dto) throw new Error("Invalid group payload received");

    return dto;
}

export async function userLogin(email: string, password: string): Promise<User> {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    const data = await response.json();
    return data.user as User;
}

export async function userLogout() {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) throw new Error("Logout failed");
}

export async function userRegister(data: RegisterInput) {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Registration failed");
    }

    return response.json();
}
