import * as React from 'react';
import { FC } from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Outlet, useNavigate, useParams } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useResolver } from '../hooks';
import { HelperRouteObject } from '../types';
import { workerDuration, workerDurationTimeBeforeCheck } from './utils/general-utils';
import { mockAsyncResolver } from './utils/mock-async-resolver';
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
              userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
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
              userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
              productInfo: mockAsyncResolver(workerDuration, { price: 50 }),
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
              userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
              productInfo: mockAsyncResolver(workerDuration),
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
              userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
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
                  userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
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
                  userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                  productInfo: mockAsyncResolver(workerDuration, { price: 50 }),
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
              userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
            },
            children: [
              {
                path: 'child',
                element: <Child />,
                resolvers: {
                  userInfo: mockAsyncResolver(workerDuration, { name: 'john' }),
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
              userInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
              productInfo: mockAsyncResolver(workerDuration, { price: 50 }),
            },
            children: [
              {
                path: 'child',
                element: <Child />,
                resolvers: {
                  userInfo: mockAsyncResolver(workerDuration, { name: 'john' }),
                  productInfo: mockAsyncResolver(workerDuration, { price: 100 }),
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

    describe('scenario', () => {
      it('with 3 children, check resolvers to be correctly rendered and should not be rendered twice for parents', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const GeneralLink: FC<{ title: string; link: string }> = ({ title, link }) => {
          const navigate = useNavigate();

          function handleClick() {
            navigate(link);
          }

          return <button onClick={handleClick}>{title}</button>;
        };

        const LinkToFirstChild = () => <GeneralLink link="./child" title="Link to first child" />;

        const LinkToSecondChild = () => <GeneralLink link="./child2" title="Link to second child" />;

        const LinkToThirdChild = () => <GeneralLink link="./child3" title="Link to third child" />;

        const Home = () => {
          const { userName } = useResolver<{ userName: string }>();
          return (
            <div>
              <h1>Home test {userName}</h1>
              <LinkToFirstChild />
              <Outlet />
            </div>
          );
        };

        const Child = () => {
          const { userName } = useResolver<{ userName: string }>();
          return (
            <div>
              <h1>Child {userName}</h1>
              <LinkToSecondChild />
              <Outlet />
            </div>
          );
        };

        const Child2 = () => {
          const { userName } = useResolver<{ userName: string }>();
          return (
            <div>
              <h1>Child 2 {userName}</h1>
              <LinkToThirdChild />
              <Outlet />
            </div>
          );
        };

        const Child3 = () => {
          const { userName } = useResolver<{ userName: string }>();
          return <div>Child 3 {userName}</div>;
        };

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            resolvers: {
              userName: mockAsyncResolver(workerDuration, 'jack - home'),
            },
            element: <Home />,
            children: [
              {
                path: 'child',
                resolvers: {
                  userName: mockAsyncResolver(workerDuration, 'jack - child'),
                },
                element: <Child />,
                children: [
                  {
                    path: 'child2',
                    resolvers: {
                      userName: mockAsyncResolver(workerDuration, 'jack - child2'),
                    },
                    element: <Child2 />,
                    children: [
                      {
                        path: 'child3',
                        resolvers: {
                          userName: mockAsyncResolver(workerDuration, 'jack - child3'),
                        },
                        element: <Child3 />,
                      },
                    ],
                  },
                ],
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

        // Elements should not be rendered immediately after initialization, since the first parent has resolver

        expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        // As soon as resolver for <Home /> has finished his work, we should be able to see the content,
        // but not the child <Child />, because it has resolver as well

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
          </div>
        `);

        const linkToFirstChild = renderer.root.findByType(LinkToFirstChild);

        TestRenderer.act(() => {
          linkToFirstChild.findByType('button').props.onClick();
        });

        await wait(1);

        // Just after click we still shouldn't be able to see <Child /> content, since it has async guard
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
          </div>
        `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        // Just after first child guard work we should be able to see the child content and container for
        // the next child but not child itself <Child2 />

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
            </div>
          </div>
        `);

        const linkToSecondChild = renderer.root.findByType(LinkToSecondChild);
        TestRenderer.act(() => {
          linkToSecondChild.findByType('button').props.onClick();
        });
        // Just after click we should not see the content of <Child2 />, because of guards
        // but we still should be able to see already loaded content <Home />, <Child />

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
            </div>
          </div>
        `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        // As soon as guard in <Child2 /> has finished his work,
        // we should be able to see content of component
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2 
                  jack - child2
                </h1>
                <button
                  onClick={[Function]}
                >
                  Link to third child
                </button>
              </div>
            </div>
          </div>
        `);

        const linkToThirdChild = renderer.root.findByType(LinkToThirdChild);

        TestRenderer.act(() => {
          linkToThirdChild.findByType('button').props.onClick();
        });

        // Just after click we should not see the content of <Child3 />, because of guards
        // but we still should be able to see already loaded content <Home />, <Child />, <Child2 />

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2 
                  jack - child2
                </h1>
                <button
                  onClick={[Function]}
                >
                  Link to third child
                </button>
              </div>
            </div>
          </div>
        `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        // As soon as guard in <Child3 /> has finished his work,
        // we should be able to see content of component

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2 
                  jack - child2
                </h1>
                <button
                  onClick={[Function]}
                >
                  Link to third child
                </button>
                <div>
                  Child 3 
                  jack - child3
                </div>
              </div>
            </div>
          </div>
        `);
        // check reverse link clicking to the parent
        // Click back to the previous child link <Child2 />
        const linkToSecondChild2 = renderer.root.findByType(LinkToSecondChild);
        act(() => {
          linkToSecondChild2.findByType('button').props.onClick();
        });

        // Just after click, we should be able to see <Child2 /> and <Child3 /> should disappear

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2 
                  jack - child2
                </h1>
                <button
                  onClick={[Function]}
                >
                  Link to third child
                </button>
              </div>
            </div>
          </div>
        `);

        const linkToFirstChild2 = renderer.root.findByType(LinkToFirstChild);

        act(() => {
          linkToFirstChild2.findByType('button').props.onClick();
        });

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test 
              jack - home
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child 
                jack - child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
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
              name: mockAsyncResolver(workerDuration, 'joe'),
              lastName: mockAsyncResolver(workerDuration, 'doe'),
              authInfo: mockAsyncResolver(workerDuration, { permission: 'admin' }),
              avatar: mockAsyncResolver(workerDuration, 'url'),
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
                  name: mockAsyncResolver(workerDuration, 'joe'),
                  lastName: mockAsyncResolver(workerDuration, 'doe'),
                  authInfo: mockAsyncResolver(workerDuration, { permission: 'admin' }),
                  avatar: mockAsyncResolver(workerDuration, 'url'),
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
              lastName: mockAsyncResolver(workerDuration, 'doe'),
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
              lastName: mockAsyncResolver(workerDuration, 'doe'),
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
                  lastName: mockAsyncResolver(workerDuration, 'doe'),
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
                  lastName: mockAsyncResolver(workerDuration, 'doe'),
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
