import { useState, useEffect } from 'react';
import { type ReactNode } from "react";
import UserContext, { type AuthContextType, type User } from './UserContext';
import { userLogin, userLogout } from '../services/dbService';


interface UserProviderProps {
  children: ReactNode;
}


export default function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const login: AuthContextType["login"] = async (email, password, rememberMe) => {
        const loggedInUser = await userLogin(email, password)

        if(!loggedInUser) throw new Error('Login failed');

        console.log(loggedInUser);

        setUser({
            ...loggedInUser,
            rememberMe
        });
    }

    const logout: AuthContextType["logout"] = async () => {
        await userLogout();

        setUser(null);
    }

    const register = async ( ) => {
        
    }

    const value: AuthContextType = {
        user,
        setUser,
        login,
        logout
    }

    return(
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );

}