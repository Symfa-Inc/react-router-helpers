import { Navigate } from 'react-router-dom';
import { useRoutesWithHelper } from '../reactRouterHelpers';
import { isAdminGuard } from './guards/isAdminGuard';
import { AdminDashboardLoading } from './loadings/AdminDashboardLoading';
import { GuardsPage } from './pages/Guards';
import { AdminDashboard } from './pages/Guards/AdminDashboard';
import { HomePage } from './pages/Home';

export const RoutesWrapper = () => {
  return useRoutesWithHelper([
    {
      path: '/',
      element: <HomePage />,
      children: [
        {
          path: '/guards',
          element: <GuardsPage />,
          children: [
            {
              guards: [isAdminGuard],
              loadingComponent: <AdminDashboardLoading />,
              path: 'admin-dashboard',
              element: <AdminDashboard />
            }
          ]
        },
      ]
    },

    {
      path: '*',
      element: <Navigate to="/" replace />,
    }
  ]);
};

