import { createContext } from "react";

export type User = {
    id: number | null;
    email: string | null;
    username?: string | null;
    firstname: string | null;
    lastname: string | null;
    rememberMe: boolean;
};

export type RegisterInput = {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
};

export type AuthContextType = {
    user: User | null,
    setUser: (user: User | null) => void
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>
    logout: () => Promise<void>
    register: (data: RegisterInput, rememberMe?: boolean) => Promise<void>
}

const UserContext = createContext<AuthContextType | null>(null);

export default UserContext;