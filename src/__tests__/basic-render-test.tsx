import * as React from 'react';
import { FC, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Outlet, useNavigate, useParams } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject, RouteHelperStatus } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { minimalRenderTimeout, workerDuration, workerDurationTimeBeforeCheck } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockShouldNeverBeCalledGuard } from './utils/mock-should-never-be-called-guard';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';
import { HelperOutlet, useGuardStatus } from '../index';

describe('Basic render', () => {
  describe('one route should be rendered', () => {
    const routes: HelperRouteObject[] = [
      {
        path: '/',
        element: <div>Home</div>,
      },
    ];

    testIn3DifferentModes({
      routes,
      initialPath: '/',
      validateResultInTestEnv: async renderer => {
        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
        </div>
        `);
      },
    });
  });
  describe('2 nested route should be rendered', () => {
    const routes: HelperRouteObject[] = [
      {
        path: '/',
        element: (
          <div>
            Home
            <HelperOutlet />
          </div>
        ),
        children: [
          {
            path: 'child',
            element: <div>Child</div>,
          },
        ],
      },
    ];

    testIn3DifferentModes({
      routes,
      initialPath: '/child',
      validateResultInTestEnv: async renderer => {
        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          <div>
            Child
          </div>
        </div>
        `);
      },
    });
  });
  describe('3 nested route should be rendered', () => {
    const routes: HelperRouteObject[] = [
      {
        path: '/',
        element: (
          <div>
            Home
            <HelperOutlet />
          </div>
        ),
        children: [
          {
            path: 'child',
            element: (
              <div>
                Child <HelperOutlet />
              </div>
            ),
            children: [
              {
                path: 'child2',
                element: <div>Child2</div>,
              },
            ],
          },
        ],
      },
    ];

    testIn3DifferentModes({
      routes,
      initialPath: '/child/child2',
      validateResultInTestEnv: async renderer => {
        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
            <div>
              Child 
              <div>
                Child2
              </div>
            </div>
          </div>
        `);
      },
    });
  });

  describe('routes with child, but initial path on parent, child should not be rendered', () => {
    const routes: HelperRouteObject[] = [
      {
        path: '/',
        element: (
          <div>
            Home
            <HelperOutlet />
          </div>
        ),
        children: [
          {
            path: 'child',
            element: <div>Child</div>,
          },
        ],
      },
    ];

    testIn3DifferentModes({
      routes,
      initialPath: '/',
      validateResultInTestEnv: async renderer => {
        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
      },
    });
  });

  describe('parent has Outlet, child should not be rendered', () => {
    const routes: HelperRouteObject[] = [
      {
        path: '/',
        element: (
          <div>
            Home
            <Outlet />
          </div>
        ),
        children: [
          {
            path: 'child',
            element: <div>Child</div>,
          },
        ],
      },
    ];

    testIn3DifferentModes({
      routes,
      initialPath: '/child',
      validateResultInTestEnv: async renderer => {
        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
         `);
      },
    });
  });
});
