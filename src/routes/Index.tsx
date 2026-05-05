import { Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ProjectLayout from '../layout/ProjectLayout';
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SettingPage from '../pages/SettingPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route
                element={
                    <ProtectedRoute>
                        <ProjectLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
