import { type JSX } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '../stores/auth.store';

// type AuthState = ReturnType<typeof useAuthStore.getState>;

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    // const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
    // const loadFromStorage = useAuthStore((state: AuthState) => state.loadFromStorage);

    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         loadFromStorage();
    //     }
    // }, [isAuthenticated, loadFromStorage]);

    // if (isAuthenticated) {
    //     return <Navigate to="/dashboard" replace />;
    // }

    return children;
};

export default PublicRoute;
