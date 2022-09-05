import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { HelperOutlet, useRoutesWithHelper } from '../reactRouterHelpers';
import { GuardsModule } from './GuardsModule';

export const RoutesWrapper = () => {
  return useRoutesWithHelper([
    {
      path: '/',
      element: <>Home</>,
    },

    {
      path: '/guards',
      element: <HelperOutlet />,
      children: [
        {
          path: 'test',
          element: <>Guards page</>
        }
      ]
    }
  ]);
};

