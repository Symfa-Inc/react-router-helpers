import { expect } from '@jest/globals';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { HelperOutlet } from '../index';
import { HelperRouteObject } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { longestWorkDuration, mediumWorkDuration } from './utils/general-utils';
import { wait } from './utils/wait';

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
        await wait(longestWorkDuration + mediumWorkDuration);

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
            <HelperOutlet/>
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
        await wait(longestWorkDuration + mediumWorkDuration);

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
            <HelperOutlet/>
          </div>
        ),
        children: [
          {
            path: 'child',
            element: (
              <div>
                Child <HelperOutlet/>
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
        await wait(longestWorkDuration + mediumWorkDuration);

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
            <HelperOutlet/>
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
        await wait(longestWorkDuration + mediumWorkDuration);

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
            <Outlet/>
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
