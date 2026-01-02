import { useState } from 'react';
import { type ReactNode } from "react";
import UserContext, { type AuthContextType, type RegisterInput, type User } from './UserContext';
import { userLogin, userLogout, userRegister } from '../services/dbService';


interface UserProviderProps {
  children: ReactNode;
}


export default function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const login: AuthContextType["login"] = async (email, password, rememberMe) => {
        const loggedInUser = await userLogin(email, password);

        if (!loggedInUser) throw new Error('Login failed');

        setUser({
            ...loggedInUser,
            rememberMe,
        });
    }

    const logout: AuthContextType["logout"] = async () => {
        await userLogout();

        setUser(null);
    }

    const register: AuthContextType["register"] = async (data: RegisterInput, rememberMe = false) => {
        await userRegister(data);

        await login(data.email, data.password, rememberMe);
    }

    const value: AuthContextType = {
        user,
        setUser,
        login,
        logout,
        register,
    }

    return(
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );

}