import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminProtectedRoute = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading....</div>
    }
    return isAuthenticated && user?.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;

}
export default AdminProtectedRoute;