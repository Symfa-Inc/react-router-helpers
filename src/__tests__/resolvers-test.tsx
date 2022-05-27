import * as React from 'react';
import { MemoryRouter, Outlet, useParams } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useResolver } from '../hooks';
import { HelperRouteObject } from '../types';
import { workerDuration, workerDurationTimeBeforeCheck } from './utils/general-utils';
import { mockResolver } from './utils/mock-resolver';
import { mockShouldNeverBeCalledResolver } from './utils/mock-should-never-be-called-resolver';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

describe('Resolvers in route', () => {
  describe('route should only be rendered when resolvers have finished and component must have value from hook', () => {
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
      it('with 2 resolvers', async () => {
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
      it('with 2 resolvers, one return null', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Home() {
          const { userInfo, productInfo } = useResolver<{
            userInfo: { name: string };
            productInfo: any;
          }>();
          return (
            <div>
              Home
              <h2>{userInfo.name}</h2>
              <h2>{productInfo}</h2>
            </div>
          );
        }

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
              productInfo: mockResolver(workerDuration),
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
            <h2 />
          </div>
        `);
      });
      it('with 2 resolvers, one on parent another one on child and should not be called', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const counter = { amount: 0 };

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
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                resolvers: {
                  mock: mockShouldNeverBeCalledResolver(counter),
                },
              },
            ],
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
        expect(counter.amount).toBe(0);
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
              <Outlet />
            </div>
          );
        }

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
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
            },
            children: [
              {
                path: 'child',
                element: <Child />,
                resolvers: {
                  userInfo: mockResolver(workerDuration, { name: 'john' }),
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
            <h2>
              joe
            </h2>
          </div>
        `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
            <h2>
              joe
            </h2>
            <div>
              Child
              <h2>
                john
              </h2>
            </div>
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
              <Outlet />
            </div>
          );
        }

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
            element: <Home />,
            resolvers: {
              userInfo: mockResolver(workerDuration, { name: 'joe' }),
              productInfo: mockResolver(workerDuration, { price: 50 }),
            },
            children: [
              {
                path: 'child',
                element: <Child />,
                resolvers: {
                  userInfo: mockResolver(workerDuration, { name: 'john' }),
                  productInfo: mockResolver(workerDuration, { price: 100 }),
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
            <div>
              Child
              <h2>
                john
              </h2>
              <h2>
                100
              </h2>
            </div>
          </div>
        `);
      });
    });
  });

  describe('resolvers have access to standard hook functionality', () => {
    describe('has access to useParams with correct context', () => {
      const resolverWithParams = () => {
        const params = useParams<{ id: string }>();

        return () => {
          return params.id;
        };
      };

      function Child() {
        const { routeParams } = useResolver<{ routeParams: string }>();

        return (
          <div>
            Child
            <h1>{routeParams}</h1>
          </div>
        );
      }
      const routes: HelperRouteObject[] = [
        {
          path: '/home',
          element: (
            <div>
              Home <Outlet />
            </div>
          ),
          children: [
            {
              path: ':id',
              element: <Child />,
              resolvers: {
                routeParams: resolverWithParams,
              },
            },
          ],
        },
      ];

      it('should return page with correct params from resolver', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home/1234']}>
              <RoutesRenderer routes={routes} location={{ pathname: '/home/1234' }} />
            </MemoryRouter>,
          );
        });

        await wait(1);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
            <div>
              Child
              <h1>
                1234
              </h1>
            </div>
          </div>
        `);
      });
    });
  });

  describe('must work simultaneously', () => {
    describe('for parent route', () => {
      it('with 4 resolvers', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Home() {
          const infoFromResolvers = useResolver<{
            name: string;
            lastName: string;
            authInfo: { permission: string };
            avatar: string;
          }>();
          return (
            <div>
              Home
              <h2>{infoFromResolvers.name}</h2>
              <h2>{infoFromResolvers.lastName}</h2>
              <h2>{infoFromResolvers.authInfo.permission}</h2>
              <h2>{infoFromResolvers.avatar}</h2>
            </div>
          );
        }

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home />,
            resolvers: {
              name: mockResolver(workerDuration, 'joe'),
              lastName: mockResolver(workerDuration, 'doe'),
              authInfo: mockResolver(workerDuration, { permission: 'admin' }),
              avatar: mockResolver(workerDuration, 'url'),
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
              doe
            </h2>
            <h2>
              admin
            </h2>
            <h2>
              url
            </h2>
          </div>
        `);
      });
    });
    describe('for nested route', () => {
      it('with 4 resolvers', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        function Child() {
          const infoFromResolvers = useResolver<{
            name: string;
            lastName: string;
            authInfo: { permission: string };
            avatar: string;
          }>();
          return (
            <div>
              Home
              <h2>{infoFromResolvers.name}</h2>
              <h2>{infoFromResolvers.lastName}</h2>
              <h2>{infoFromResolvers.authInfo.permission}</h2>
              <h2>{infoFromResolvers.avatar}</h2>
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
                  name: mockResolver(workerDuration, 'joe'),
                  lastName: mockResolver(workerDuration, 'doe'),
                  authInfo: mockResolver(workerDuration, { permission: 'admin' }),
                  avatar: mockResolver(workerDuration, 'url'),
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
              Home
              <h2>
                joe
              </h2>
              <h2>
                doe
              </h2>
              <h2>
                admin
              </h2>
              <h2>
                url
              </h2>
            </div>
          </div>
        `);
      });
    });
  });

  describe('resolver throw an exception', () => {
    const resolverWithException = () => () => {
      throw new Error();
    };

    const resolverWithExceptionAsync = () => async () => {
      await wait(20);
      throw new Error();
    };

    describe('for parent route', () => {
      it('1 resolver sync throw an exception', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            resolvers: {
              name: resolverWithException,
              lastName: mockResolver(workerDuration, 'doe'),
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
      });
      it('1 resolver async throw an exception', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            resolvers: {
              name: resolverWithExceptionAsync,
              lastName: mockResolver(workerDuration, 'doe'),
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
      });
    });
    describe('for nested route', () => {
      it('1 resolver sync throw an exception', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                resolvers: {
                  name: resolverWithException,
                  lastName: mockResolver(workerDuration, 'doe'),
                },
              },
            ],
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

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
      });
      it('1 resolver async throw an exception', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                resolvers: {
                  name: resolverWithExceptionAsync,
                  lastName: mockResolver(workerDuration, 'doe'),
                },
              },
            ],
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

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
      });
    });
  });
});
