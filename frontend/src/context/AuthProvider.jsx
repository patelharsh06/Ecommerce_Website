import { useState,useEffect } from "react";
import { AuthContext } from "./context.js";
import authService  from "../services/authService";


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try{
                const response = await authService.getProfile();
                if(response.data.success) {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                }
            }
            catch (error) {
                console.error("Error checking auth status:", error);
                setUser(null);
                setIsAuthenticated(false);
            }
            finally {
                setIsLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        if(response.data.success) 
        {
            setUser(response.data.user);
            setIsAuthenticated(true);
        }
        return response;
    }

    const logout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    }
    
    const value = {
        user,
        setUser,
        isAuthenticated,
        isLoading,
        login,
        logout
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

