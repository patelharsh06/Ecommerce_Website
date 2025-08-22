import { Navigate,Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />; 
};

export default ProtectedRoute;