import * as React from 'react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useResolver } from '../../src/hooks';
import { HelperOutlet } from '../../src/route-helper';
import { HelperRouteObject } from '../../src/types';
import { longestWorkDuration, mediumWorkDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockAsyncResolver } from './utils/mock-async-resolver';
import { mockGuardWithCounter } from './utils/mock-guard-with-counter';
import { mockShouldNeverBeCalledResolver } from './utils/mock-should-never-be-called-resolver';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';
import { expect } from '@jest/globals';

describe('resolvers with guards', () => {
  describe('parent route', () => {
    it('2 guards and 2 resolvers on parent', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      const Home = () => {
        const { userInfo, authInfo } = useResolver<{ userInfo: string; authInfo: string }>();
        return (
          <div>
            Home
            {userInfo}
            {authInfo}
            <HelperOutlet />
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
          resolvers: {
            userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
            authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
          },
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);
    });
    it('1 guard fails resolver should not be called', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const counter = { amount: 0 };

      const Home = () => {
        return <div>Home</div>;
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [mockAsyncGuard(false, longestWorkDuration)],
          resolvers: {
            mock: mockShouldNeverBeCalledResolver(counter),
          },
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
      expect(counter.amount).toBe(0);
    });
  });
  describe('child route', () => {
    it('2 guards and 2 resolvers on parent and child', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      const Home = () => {
        const { userInfo, authInfo } = useResolver<{ userInfo: string; authInfo: string }>();
        return (
          <div>
            Home
            {userInfo}
            {authInfo}
            <HelperOutlet />
          </div>
        );
      };

      const Child = () => {
        const { userInfo, authInfo } = useResolver<{ userInfo: string; authInfo: string }>();
        return (
          <div>
            Child
            {userInfo}
            {authInfo}
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
          resolvers: {
            userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
            authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
          },
          children: [
            {
              path: 'child',
              element: <Child />,
              guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
              resolvers: {
                userInfo: mockAsyncResolver(longestWorkDuration, 'john - child'),
                authInfo: mockAsyncResolver(longestWorkDuration, 'admin - child'),
              },
            },
          ],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/child']}>
            <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);

      await wait(longestWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);

      await wait(longestWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
          <div>
            Child
            john - child
            admin - child
          </div>
        </div>
      `);
    });

    it('1 parent guard fails guard and resolver for child should not be called', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const childGuardCounter = { amount: 0 };
      const childResolverCounter = { amount: 0 };

      const Home = () => {
        return (
          <div>
            Home
            <HelperOutlet />
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [mockAsyncGuard(false, longestWorkDuration)],
          children: [
            {
              path: 'child',
              element: <div>Child</div>,
              guards: [mockGuardWithCounter(childGuardCounter)],
              resolvers: {
                mock: mockShouldNeverBeCalledResolver(childResolverCounter),
              },
            },
          ],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/child']}>
            <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      expect(childGuardCounter.amount).toBe(0);
      expect(childResolverCounter.amount).toBe(0);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      expect(childGuardCounter.amount).toBe(0);
      expect(childResolverCounter.amount).toBe(0);
    });
  });

  describe('with an exception', () => {
    const workerWithAnException = () => () => {
      throw new Error();
    };
    it("parent route guard throw an exception, child guard and resolvers should not be called", async () => {
      const parentResolverCounter = { amount: 0 };
      const childGuardCounter = { amount: 0 };
      const childResolverCounter = { amount: 0 };

      const Home = () => {
        return (
          <div>
            Home
            <HelperOutlet />
          </div>
        );
      };

      const Child = () => {
        return (
          <div>
            Child
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [workerWithAnException],
          resolvers: {
            counter: mockShouldNeverBeCalledResolver(parentResolverCounter),
          },
          children: [
            {
              path: 'child',
              element: <Child />,
              guards: [mockGuardWithCounter(childGuardCounter)],
              resolvers: {
                counter: mockShouldNeverBeCalledResolver(childResolverCounter),
              },
            },
          ],
        },
      ];

      TestRenderer.act(() => {
        TestRenderer.create(
          <MemoryRouter initialEntries={['/child']}>
            <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
          </MemoryRouter>,
        );
      });

      await wait(1);

      expect(parentResolverCounter.amount).toBe(0);
      expect(childGuardCounter.amount).toBe(0);
      expect(childResolverCounter.amount).toBe(0);

    });

    it("parent route resolver throw an exception, child guard and resolvers should not be called", async () => {
      const childGuardCounter = { amount: 0 };
      const childResolverCounter = { amount: 0 };

      const Home = () => {
        return (
          <div>
            Home
            <HelperOutlet />
          </div>
        );
      };

      const Child = () => {
        return (
          <div>
            Child
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          resolvers: {
            counter: workerWithAnException,
          },
          children: [
            {
              path: 'child',
              element: <Child />,
              guards: [mockGuardWithCounter(childGuardCounter)],
              resolvers: {
                counter: mockShouldNeverBeCalledResolver(childResolverCounter),
              },
            },
          ],
        },
      ];

      TestRenderer.act(() => {
        TestRenderer.create(
          <MemoryRouter initialEntries={['/child']}>
            <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
          </MemoryRouter>,
        );
      });

      await wait(1);

      expect(childGuardCounter.amount).toBe(0);
      expect(childResolverCounter.amount).toBe(0);

    });
  })
});
