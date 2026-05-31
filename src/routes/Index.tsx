import { Navigate, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ProjectLayout from '../layout/ProjectLayout';
import LoginPage from '../pages/Auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SettingPage from '../pages/SettingPage';
import RolePage from '../pages/Admin/RolePage';
import GetRolePage from '../pages/Admin/GetRolePage';
import UserPage from '../pages/Admin/UserPage';
import TaskPage from '../pages/Task/TaskPage';
import TaskDetailPage from '../pages/Task/TaskDetailPage';
import KpiScorePage from '../pages/Kpi/KpiScorePage';
import KpiReviewPage from '../pages/Kpi/KpiReviewPage';

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
                <Route path="/admin/role" element={<RolePage />} />
                <Route path="/admin/role/:id" element={<GetRolePage />} />
                <Route path="/admin/user" element={<UserPage />} />
                <Route path="/tasks" element={<TaskPage />} />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />
                <Route path="/kpi/scores" element={<KpiScorePage />} />
                <Route path="/kpi/reviews" element={<KpiReviewPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
