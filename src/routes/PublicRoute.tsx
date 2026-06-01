import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        loadFromStorage();
        setIsReady(true);
    }, [loadFromStorage]);

    if (!isReady) return null;

    if (isAuthenticated) {
        return <Navigate to="/settings" replace />;
    }

    return children;
};

export default PublicRoute;
