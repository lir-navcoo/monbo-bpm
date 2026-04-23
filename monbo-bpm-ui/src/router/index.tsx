import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import Layout from '@/components/layout/layout';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import UserListPage from '@/pages/users';
import RoleListPage from '@/pages/roles';
import DepartmentListPage from '@/pages/departments';
import ProcessDefListPage from '@/pages/process-defs';
import ProcessDesignPage from '@/pages/process-design';
import ProcessInstListPage from '@/pages/process-insts';
import TaskListPage from '@/pages/tasks';

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'users',
                element: <UserListPage />,
            },
            {
                path: 'roles',
                element: <RoleListPage />,
            },
            {
                path: 'departments',
                element: <DepartmentListPage />,
            },
            {
                path: 'process-defs',
                element: <ProcessDefListPage />,
            },
            {
                path: 'process-insts',
                element: <ProcessInstListPage />,
            },
            {
                path: 'tasks',
                element: <TaskListPage />,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
    {
        path: '/process-defs/:id/design',
        element: <ProcessDesignPage />,
    },
]);

export default router;
