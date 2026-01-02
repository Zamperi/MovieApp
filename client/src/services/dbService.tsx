import type { RegisterInput, User } from "../context/UserContext";

export type GroupListItemDTO = {
    id: number;
    name: string;
    createdAt?: string | null;
};

export type GroupMemberDTO = {
    id: number;
    username: string;
};

export type GroupDetailDTO = {
    id: number;
    name: string;
    isPublic: boolean;
    owner: GroupMemberDTO;
    members: GroupMemberDTO[];
    createdAt?: string | null;
};

export type JoinRequestStatus = "pending" | "approved" | "rejected";

export type JoinRequestDTO = {
    requestId: number;
    groupId: number;
    userId: number;
    status: JoinRequestStatus;
    createdAt: string;
    decidedAt?: string;
};

type GroupApiDTO = {
    id?: number;
    name?: string;
    createdAt?: string | null;
    isPublic?: boolean;
    owner?: GroupMemberDTO;
    members?: GroupMemberDTO[];
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

function toGroupDetailDTO(x: GroupApiDTO): GroupDetailDTO | null {
    const id = x.id ?? x.groupId;
    const name = x.name ?? x.groupName;

    if (
        typeof id !== "number" ||
        typeof name !== "string" ||
        !Array.isArray(x.members) ||
        typeof x.owner !== "object" ||
        x.owner === null
    ) {
        return null;
    }

    const members: GroupMemberDTO[] = x.members
        .map((m) => (typeof m?.id === "number" && typeof m?.username === "string" ? m : null))
        .filter((m): m is GroupMemberDTO => m !== null);

    if (typeof x.owner.id !== "number" || typeof x.owner.username !== "string") return null;

    return {
        id,
        name,
        isPublic: Boolean(x.isPublic),
        owner: { id: x.owner.id, username: x.owner.username },
        members,
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

export async function getGroup(groupId: number): Promise<GroupDetailDTO | null> {
    const api_url = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${api_url}/api/groups/${groupId}`, {
            credentials: "include",
        });

        if (!response.ok) {
            return null;
        }

        const data: unknown = await response.json();
        const dto = toGroupDetailDTO(data as GroupApiDTO);
        return dto;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getJoinRequest(groupId: number): Promise<JoinRequestDTO | null> {
    const api_url = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${api_url}/api/groups/${groupId}/join-requests/me`, {
            credentials: "include",
        });

        if (response.status === 404) return null;
        if (!response.ok) return null;

        const data = (await response.json()) as JoinRequestDTO;
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function sendJoinRequest(groupId: number): Promise<JoinRequestDTO> {
    const api_url = import.meta.env.VITE_API_URL;

    const response = await fetch(`${api_url}/api/groups/${groupId}/join-requests`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to send join request");
    }

    const data = (await response.json()) as JoinRequestDTO;
    return data;
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
