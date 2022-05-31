import * as React from 'react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useResolver } from '../hooks';
import { HelperRouteObject } from '../types';
import { workerDuration, workerDurationTimeBeforeCheck } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockAsyncResolver } from './utils/mock-async-resolver';
import { mockShouldNeverBeCalledGuard } from './utils/mock-should-never-be-called-guard';
import { mockShouldNeverBeCalledResolver } from './utils/mock-should-never-be-called-resolver';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

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
            <Outlet />
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
          resolvers: {
            userInfo: mockAsyncResolver(workerDuration, 'john'),
            authInfo: mockAsyncResolver(workerDuration, 'admin'),
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

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

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
          guards: [mockAsyncGuard(false, workerDuration)],
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

      await wait(workerDuration + workerDurationTimeBeforeCheck);

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
            <Outlet />
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
          guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
          resolvers: {
            userInfo: mockAsyncResolver(workerDuration, 'john'),
            authInfo: mockAsyncResolver(workerDuration, 'admin'),
          },
          children: [
            {
              path: 'child',
              element: <Child />,
              guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
              resolvers: {
                userInfo: mockAsyncResolver(workerDuration, 'john - child'),
                authInfo: mockAsyncResolver(workerDuration, 'admin - child'),
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

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
          john
          admin
        </div>
      `);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

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
            <Outlet />
          </div>
        );
      };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <Home />,
          guards: [mockAsyncGuard(false, workerDuration)],
          children: [
            {
              path: 'child',
              element: <div>Child</div>,
              guards: [mockShouldNeverBeCalledGuard(childGuardCounter)],
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

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      expect(childGuardCounter.amount).toBe(0);
      expect(childResolverCounter.amount).toBe(0);

      await wait(workerDuration + workerDurationTimeBeforeCheck);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      expect(childGuardCounter.amount).toBe(0);
      expect(childResolverCounter.amount).toBe(0);
    });
  });
});
