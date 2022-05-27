import * as React from 'react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useResolver } from '../hooks';
import { HelperRouteObject } from '../types';
import { workerDurationTimeBeforeCheck, workerDuration } from './utils/guard-utils';
import { mockResolver } from './utils/mock-resolver';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

it('true', () => {
  expect(true).toBe(true);
});

describe('Resolvers in route', () => {
  describe('route should only be rendered when resolvers have finished', () => {
    describe('for parent route', () => {
      it('with 1 resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Home() {
          const { userInfo } = useResolver<{ userInfo: { name: string } }>();
          return (
            <div>
              Home
              <h2>{userInfo.name}</h2>
            </div>
          );
        }
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
                  <div>
                    Home
                    <h2>
                      joe
                    </h2>
                  </div>
              `);
      });
      it('with 2 resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Home() {
          const { userInfo, productInfo } = useResolver<{
            userInfo: { name: string };
            productInfo: { price: number };
          }>();
          return (
            <div>
              Home
              <h2>{userInfo.name}</h2>
              <h2>{productInfo.price}</h2>
            </div>
          );
        }
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
              productInfo: mockResolver(workerDuration, { price: 50 }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
            <h2>
              joe
            </h2>
            <h2>
              50
            </h2>
          </div>
        `);
      });
    });

    describe('for nested route', () => {
      it('with 1 resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Child() {
          const { userInfo } = useResolver<{ userInfo: { name: string } }>();
          return (
            <div>
              Child
              <h2>{userInfo.name}</h2>
            </div>
          );
        }
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <Outlet />
              </div>
            ),
            children: [
              {
                path: 'child',
                element: <Child />,
                resolvers: {
                  userInfo: mockResolver(workerDuration, { name: 'joe' }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
          </div>
        `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
            <div>
              Child
              <h2>
                joe
              </h2>
            </div>
          </div>
        `);
      });
      it('with 2 resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Child() {
          const { userInfo, productInfo } = useResolver<{
            userInfo: { name: string };
            productInfo: { price: number };
          }>();
          return (
            <div>
              Child
              <h2>{userInfo.name}</h2>
              <h2>{productInfo.price}</h2>
            </div>
          );
        }
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <Outlet />
              </div>
            ),
            children: [
              {
                path: 'child',
                element: <Child />,
                resolvers: {
                  userInfo: mockResolver(workerDuration, { name: 'joe' }),
                  productInfo: mockResolver(workerDuration, { price: 50 }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
          </div>
        `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
            <div>
              Child
              <h2>
                joe
              </h2>
              <h2>
                50
              </h2>
            </div>
          </div>
        `);
      });
    });

    describe('for parent with nested route', () => {
      it('with 1 resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Home() {
          const { userInfo } = useResolver<{ userInfo: { name: string } }>();
          return (
            <div>
              Home
              <h2>{userInfo.name}</h2>
            </div>
          );
        }
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
                  <div>
                    Home
                    <h2>
                      joe
                    </h2>
                  </div>
              `);
      });
      it('with 2 resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Home() {
          const { userInfo, productInfo } = useResolver<{
            userInfo: { name: string };
            productInfo: { price: number };
          }>();
          return (
            <div>
              Home
              <h2>{userInfo.name}</h2>
              <h2>{productInfo.price}</h2>
            </div>
          );
        }
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
              productInfo: mockResolver(workerDuration, { price: 50 }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
            <h2>
              joe
            </h2>
            <h2>
              50
            </h2>
          </div>
        `);
      });
    });
  });

  describe('must work simultaneously', () => {
    describe('for parent route', () => {});
    describe('for nested route', () => {});
  });

  describe('resolver throw an exception', () => {});
});
