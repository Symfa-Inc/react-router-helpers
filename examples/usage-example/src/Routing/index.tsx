import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useRoutesWithHelper } from '../reactRouterHelpers';
import { isAdminGuard } from './guards/isAdminGuard';
import { AdminDashboardLoading } from './loadings/AdminDashboardLoading';
import { LoadingComponentFullPower } from './loadings/LoadingComponentFullPower';
import { GuardsPage } from './pages/Guards';
import { AdminDashboard } from './pages/Guards/AdminDashboard';
import { HomePage } from './pages/Home';
import { ResolversPage } from './pages/Resolvers';
import { loadPostInfo } from './resolvers/loadPostInfo';

const LazyComponentsPage = React.lazy(() => import("./pages/LazyComponents"));

export const RoutesWrapper = () => {
  return useRoutesWithHelper([
    {
      path: '/',
      element: <HomePage />,
      children: [
        {
          path: '/resolvers',
          resolvers: {
            postInfo: loadPostInfo,
          },
          element: <ResolversPage />,
          loadingComponent: <LoadingSpinner />,
        },

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

        {
          path: '/lazy-components',
          lazyElement: <LazyComponentsPage />,
          loadingComponent: <LoadingComponentFullPower />
        }
      ]
    },

    {
      path: '*',
      element: <Navigate to="/" replace />,
    }
  ]);
};

