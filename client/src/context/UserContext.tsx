import { createContext } from "react";

export type User = {
    id: number | null;
    email: string | null;
    firstname: string | null;
    lastname: string | null;
    rememberMe: boolean;
};

export type AuthContextType = {
    user: User | null,
    setUser: (user: User | null) => void
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>
    logout: () => Promise<void>
}

const UserContext = createContext<AuthContextType | null>(null);

export default UserContext;