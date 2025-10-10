import React, {createContext, Dispatch, ReactNode, SetStateAction, useState} from "react";

type Props = {
    children: ReactNode;

}
export type Auth =
    {
        accessToken?: string;
        roles?: string[];
        username?: string;
        id?: string;
    }

type AuthContextType = {
    auth: Auth;
    setAuth: Dispatch<SetStateAction<Auth>>
    persist: boolean;
    setPersist: Dispatch<SetStateAction<boolean>> | Dispatch<any>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: Props) => {
    const [auth, setAuth] = useState<Auth>({});

    const [persist, setPersist] = useState(JSON.parse(localStorage.getItem("persist")!) || false);

    return (
        <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
            {children}
        </AuthContext.Provider>
    )
}

