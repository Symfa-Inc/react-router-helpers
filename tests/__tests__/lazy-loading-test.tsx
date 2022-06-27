import { expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject } from '../../src/types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import {
  longestWorkDuration,
  mediumWorkDuration,
  minimalDurationBeforeShowLoading,
  minimalWorkDuration,
} from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockAsyncResolver } from './utils/mock-async-resolver';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

const LazyHome = React.lazy(() => import('../components-for-test/LazyHome'));
const LazyHomeWithResolvers = React.lazy(() => import('../components-for-test/LazyHomeWithResolvers'));
const LazyChild1 = React.lazy(() => import('../components-for-test/LazyChild1'));
const LazyChild2 = React.lazy(() => import('../components-for-test/LazyChild2'));
const LazyHomeWithOutlet = React.lazy(() => import('../components-for-test/LazyHomeWithOutlet'));

describe('loadElement', () => {
  describe('simple renders', () => {
    describe('one route should be rendered', () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          loadElement: <LazyHome />,
        },
      ];

      testIn3DifferentModes({
        routes,
        initialPath: '/',
        validateResultInTestEnv: async renderer => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
        },
      });
    });
    it('2 nested route should be rendered', async () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <LazyHome />,
          children: [
            {
              path: 'child',
              element: <LazyChild1 />,
            },
          ],
        },
      ];

      await TestRenderer.act(() => {
        render(
          <MemoryRouter initialEntries={['/child']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalDurationBeforeShowLoading + minimalWorkDuration);

      expect(screen.queryByText(/home/i)).not.toBeNull();
      expect(screen.queryByText(/child/i)).not.toBeNull();
    });
    it('3 nested route should be rendered', async () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <LazyHome />,
          children: [
            {
              path: 'child',
              element: <LazyChild1 />,
              children: [
                {
                  path: 'child2',
                  element: <LazyChild2 />,
                },
              ],
            },
          ],
        },
      ];

      await TestRenderer.act(() => {
        render(
          <MemoryRouter initialEntries={['/child/child2']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalDurationBeforeShowLoading * 2 + minimalWorkDuration);

      expect(screen.queryByText(/home/i)).not.toBeNull();
      expect(screen.queryByText('Child')).not.toBeNull();
      expect(screen.queryByText('Child 2')).not.toBeNull();
    });

    describe('routes with child, but initial path on parent, child should not be rendered', () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <LazyHome />,
          children: [
            {
              path: 'child',
              element: <LazyChild1 />,
            },
          ],
        },
      ];

      testIn3DifferentModes({
        routes,
        initialPath: '/',
        validateResultInTestEnv: async renderer => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
        },
      });
    });

    it('parent has Outlet, child should not be rendered', async () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <LazyHomeWithOutlet />,
          children: [
            {
              path: 'child',
              element: <LazyChild1 />,
            },
          ],
        },
      ];

      await TestRenderer.act(() => {
        render(
          <MemoryRouter initialEntries={['/child']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalDurationBeforeShowLoading + minimalWorkDuration);

      expect(screen.queryByText(/home/i)).not.toBeNull();
      expect(screen.queryByText(/child/i)).toBeNull();
    });
  });

  describe('with guards', () => {
    describe('can activate true', () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          loadElement: <LazyHome />,
          guards: [mockAsyncGuard(true, longestWorkDuration)],
        },
      ];

      testIn3DifferentModes({
        routes,
        initialPath: '/',
        validateResultInTestEnv: async renderer => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
        },
      });
    });

    describe('can activate false', () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          loadElement: <LazyHome />,
          guards: [mockAsyncGuard(false, longestWorkDuration)],
        },
      ];

      testIn3DifferentModes({
        routes,
        initialPath: '/',
        validateResultInTestEnv: async renderer => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
              <div
                style={
                  Object {
                    "display": "block",
                  }
                }
              />
           `);
        },
      });
    });
  });

  describe('with resolvers', () => {
    describe('with 2 resolvers', () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          loadElement: <LazyHomeWithResolvers />,
          resolvers: {
            userName: mockAsyncResolver(longestWorkDuration, 'doe'),
            permissions: mockAsyncResolver(longestWorkDuration, 'admin'),
          },
        },
      ];

      testIn3DifferentModes({
        routes,
        initialPath: '/',
        validateResultInTestEnv: async renderer => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home
              doe
               - 
              admin
            </div>
           `);
        },
      });
    });
  });

  describe('if loadComponent was passed, usual component should be ignored', () => {
    const routes: HelperRouteObject[] = [
      {
        path: '/',
        element: <>Not lazy home</>,
        loadElement: <LazyHome />,
      },
    ];

    testIn3DifferentModes({
      routes,
      initialPath: '/',
      validateResultInTestEnv: async renderer => {
        await wait(longestWorkDuration + mediumWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
      },
    });
  });
});
