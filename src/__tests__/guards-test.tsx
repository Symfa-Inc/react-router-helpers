import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useRoutesWithHelper } from '../index';
import { HelperRouteObject } from '../types';
import { MockAsyncGuard } from './utils/mock-async-guard';
import { MockShouldNeverBeCalledGuard } from './utils/mock-should-never-be-called-guard';
import { MockSyncGuard } from './utils/mock-sync-guard';
import { wait } from './utils/wait';

const guardAsyncTime = 200;

describe('Guards in route', () => {
  describe('with async guards', () => {
    it('with 1 guard which return true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(true, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime + 5);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
        </div>
      `);
    });
    it('with 1 guard which return false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(false, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime + 5);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which return true - first true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(true, guardAsyncTime), new MockAsyncGuard(true, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime * 2 + 20);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
        </div>
      `);
    });
    it('with 2 guard which return false - first false - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(false, guardAsyncTime), new MockAsyncGuard(false, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime + 5);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which first guard true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(true, guardAsyncTime), new MockAsyncGuard(false, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime * 2 + 5);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which first guard false - second true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(false, guardAsyncTime), new MockAsyncGuard(true, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime + 5);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });
  });

  describe('with sync guards', () => {
    it('with 1 guard which return true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockSyncGuard(true)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
        </div>
      `);
    });
    it('with 1 guard which return false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockSyncGuard(false)],
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
    });

    it('with 2 guards which return true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockSyncGuard(true), new MockSyncGuard(true)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
        </div>
      `);
    });
    it('with 2 guards which return false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockSyncGuard(false), new MockSyncGuard(false)],
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
    });

    it('with 2 guards which first guard true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockSyncGuard(true), new MockSyncGuard(false)],
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
    });

    it('with 2 guards which first guard false - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [new MockAsyncGuard(false, guardAsyncTime), new MockAsyncGuard(false, guardAsyncTime)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(guardAsyncTime + 5);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });
  });

  describe('next guard after failed one must not be called', () => {
    describe('sync', () => {
      it('with 2 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [new MockSyncGuard(false), new MockShouldNeverBeCalledGuard(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(1);
        expect(counter.amount).toBe(0);

      });

      it('with 3 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [new MockSyncGuard(true), new MockSyncGuard(false), new MockShouldNeverBeCalledGuard(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(1);
        expect(counter.amount).toBe(0);
      });
    });

    describe('async', () => {
      it('with 2 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [new MockAsyncGuard(false, guardAsyncTime), new MockShouldNeverBeCalledGuard(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(guardAsyncTime + 5);
        expect(counter.amount).toBe(0);

      });

      it('with 3 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [new MockAsyncGuard(true, guardAsyncTime), new MockAsyncGuard(false, guardAsyncTime), new MockShouldNeverBeCalledGuard(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(guardAsyncTime * 2 + 5);
        expect(counter.amount).toBe(0);
      });
    });

  });
});

function RoutesRenderer({
  routes,
  location,
}: {
  routes: HelperRouteObject[];
  location?: Partial<Location> & { pathname: string };
}) {
  return useRoutesWithHelper(routes, location);
}
