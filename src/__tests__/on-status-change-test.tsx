import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Outlet, useNavigate } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject, OnStatusChange, RouteHelperStatus } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { workerDuration, workerDurationTimeBeforeCheck } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockAsyncResolver } from './utils/mock-async-resolver';
import { mockSyncResolver } from './utils/mock-resolver';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

describe('on status change', () => {
  describe('onGuardStatusChange function', () => {
    describe('with sync guards', () => {
      it('for component without guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);
        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loaded);
      });
      it('for component with canActivate true from all 2 guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockSyncGuard(true), mockSyncGuard(true)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(10);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
      it('for component with canActivate false from first guard', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockSyncGuard(false), mockSyncGuard(true)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(10);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
      it('for component with canActivate false from second guard', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockSyncGuard(true), mockSyncGuard(false)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(10);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
    });

    describe('with async guards', () => {
      it('for component with canActivate true from all 2 guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(workerDuration * 2 + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
      it('for component with canActivate false from first guard', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockAsyncGuard(false, workerDuration), mockAsyncGuard(true, workerDuration)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });
        await wait(1);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
      it('for component with canActivate false from second guard', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(false, workerDuration)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(workerDuration * 2 + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
      it('child route onGuardStatusChange should be be called', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const childStatuses: RouteHelperStatus[] = [];
        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
                onGuardStatusChange: (status: RouteHelperStatus) => {
                  childStatuses.push(status);
                },
              },
            ],
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(workerDuration * 2 + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });

        expect(childStatuses.length).toBe(0);
      });
    });

    describe('from nested route', () => {
      it('for component with canActivate true from all 2 guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <Outlet/>
              </div>
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
                onGuardStatusChange: (status: RouteHelperStatus) => {
                  statuses.push(status);
                },
              },
            ],
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/child']}>
              <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
            </MemoryRouter>,
          );
        });

        await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });

      it('for component with canActivate false from second guard', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <Outlet/>
              </div>
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockSyncGuard(false)],
                onGuardStatusChange: (status: RouteHelperStatus) => {
                  statuses.push(status);
                },
              },
            ],
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/child']}>
              <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
            </MemoryRouter>,
          );
        });

        await wait(10);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
    });

    describe('for child with parent guard', () => {
      describe('tests to commit 2 different behaviours with re-renders for child path', () => {

        let parentStatuses: RouteHelperStatus[] = [];
        let childStatuses: RouteHelperStatus[] = [];

        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>
              Home
              <Outlet/>
            </div>,
            guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
            onGuardStatusChange: status => {
              parentStatuses.push(status);
            },
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
                onGuardStatusChange: status => {
                  childStatuses.push(status);
                },
              },
            ],
          },
        ];

        testIn3DifferentModes({
          afterEach: () => {
            parentStatuses = [];
            childStatuses = [];
          },
          routes,
          initialPath: '/child',
          validateResultInTestEnv: async () => {

            await wait(1);

            expect(parentStatuses.length).toBe(1);
            expect(childStatuses.length).toBe(0);

            expect(parentStatuses[0]).toBe(RouteHelperStatus.Loading);

            await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2);
            expect(parentStatuses.length).toBe(2);

            parentStatuses.forEach((status, index) => {
              expect(status).toBe(expectedStatuses[index]);
            });

            expect(childStatuses.length).toBe(2); // in real env = 1
            expect(childStatuses[0]).toBe(RouteHelperStatus.Loading);

            await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2);
            expect(childStatuses.length).toBe(3); // in real env = 3

            const expectedStatusesForChildInTestEnv = [
              RouteHelperStatus.Loading, // should be 2 loading, since in test env react does not keep refs between mount/unmount
              // but in real env does
              ...expectedStatuses,
            ];

            childStatuses.forEach((status, index) => {
              expect(status).toBe(expectedStatusesForChildInTestEnv[index]);
            });
          },
          validateResultInRealEnv: async () => {
            await wait(1);

            expect(parentStatuses.length).toBe(1);
            expect(childStatuses.length).toBe(0);

            expect(parentStatuses[0]).toBe(RouteHelperStatus.Loading);

            await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2);
            expect(parentStatuses.length).toBe(2);

            parentStatuses.forEach((status, index) => {
              expect(status).toBe(expectedStatuses[index]);
            });

            expect(childStatuses.length).toBe(1);
            expect(childStatuses[0]).toBe(RouteHelperStatus.Loading);

            await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2);
            expect(childStatuses.length).toBe(2);

            childStatuses.forEach((status, index) => {
              expect(status).toBe(expectedStatuses[index]);
            });
          },
        });
      });
    });

    describe('sync and async mixed', () => {
      it('parent component has 2 guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <Outlet/>
              </div>
            ),
            guards: [mockSyncGuard(true), mockAsyncGuard(true, workerDuration)],
            onGuardStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
    });

    describe('has access to standard hook functionality', () => {
      describe('has access to useNavigate', () => {
        it('should return rendered page', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          let status: RouteHelperStatus;

          function RoutesWrapper() {
            const navigate = useNavigate();
            const routes: HelperRouteObject[] = [
              {
                path: 'login',
                element: <div>Login page</div>,
              },
              {
                path: 'home',
                element: (
                  <div>
                    Home <Outlet/>
                  </div>
                ),
                children: [
                  {
                    path: 'child',
                    guards: [mockSyncGuard(false)],
                    element: <div>Child</div>,
                    onGuardStatusChange: s => {
                      status = s;
                      if (status === RouteHelperStatus.Failed) {
                        navigate('/login');
                      }
                    },
                  },
                ],
              },
            ];
            return <RoutesRenderer routes={routes}/>;
          }

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/home/child']}>
                <RoutesWrapper/>
              </MemoryRouter>,
            );
          });

          await wait(1);

          expect(status).toBe(RouteHelperStatus.Failed);
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Login page
            </div>
          `);
        });
      });
    });
  });

  describe('onResolverStatusChange', () => {
    describe('async', () => {
      describe('for parent route', () => {
        it('for component without resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);
          expect(statuses[0]).toBe(RouteHelperStatus.Loaded);
        });
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                secondResolverInfo: mockAsyncResolver(workerDuration, { lastName: 'doe' }),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('child onResolverStatusChange should not be called', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const childStatuses: RouteHelperStatus[] = [];
          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home <Outlet/>
                </div>
              ),
              resolvers: {
                resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                secondResolverInfo: mockAsyncResolver(workerDuration, { lastName: 'doe' }),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                  },
                  onResolverStatusChange: (status: RouteHelperStatus) => {
                    childStatuses.push(status);
                  },
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });

          expect(childStatuses.length).toBe(0);
        });
      });

      describe('for child route', () => {
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <Outlet/>{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                  },
                  onResolverStatusChange: (status: RouteHelperStatus) => {
                    statuses.push(status);
                  },
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <Outlet/>{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                    resolverInfo2: mockAsyncResolver(workerDuration, { name: 'joe' }),
                  },
                  onResolverStatusChange: (status: RouteHelperStatus) => {
                    statuses.push(status);
                  },
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
      describe('for child with parent resolver', () => {
        it('parent and child have 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const childStatuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <Outlet/>{' '}
                </div>
              ),
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
              resolvers: {
                resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                resolverInfo2: mockAsyncResolver(workerDuration, { name: 'joe' }),
              },
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(workerDuration, { name: 'joe' }),
                    resolverInfo2: mockAsyncResolver(workerDuration, { name: 'joe' }),
                  },
                  onResolverStatusChange: (status: RouteHelperStatus) => {
                    childStatuses.push(status);
                  },
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
              </MemoryRouter>,
            );
          });

          await wait(1);

          expect(statuses.length).toBe(1);
          expect(childStatuses.length).toBe(0);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });

          expect(childStatuses.length).toBe(1);
          expect(childStatuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(childStatuses.length).toBe(2);

          childStatuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
    });

    describe('sync', () => {
      describe('for parent route', () => {
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockSyncResolver({ name: 'joe' }),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockSyncResolver({ name: 'joe' }),
                secondResolverInfo: mockSyncResolver({ lastName: 'doe' }),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
      describe('for child route', () => {
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <Outlet/>{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockSyncResolver({ name: 'joe' }),
                  },
                  onResolverStatusChange: (status: RouteHelperStatus) => {
                    statuses.push(status);
                  },
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <Outlet/>{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockSyncResolver({ name: 'joe' }),
                    resolverInfo2: mockSyncResolver({ name: 'joe' }),
                  },
                  onResolverStatusChange: (status: RouteHelperStatus) => {
                    statuses.push(status);
                  },
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
    });

    describe('sync and async mixed', () => {
      it('parent component has 2 resolvers', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <Outlet/>
              </div>
            ),
            resolvers: {
              userInfoSync: mockSyncResolver(),
              userInfoAsync: mockAsyncResolver(),
            },
            onResolverStatusChange: (status: RouteHelperStatus) => {
              statuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
    });

    describe('has access to standard hook functionality', () => {
      describe('has access to useNavigate', () => {
        it('should return rendered page', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          function RoutesWrapper() {
            const navigate = useNavigate();
            const routes: HelperRouteObject[] = [
              {
                path: 'login',
                element: <div>Login page</div>,
              },
              {
                path: 'home',
                element: (
                  <div>
                    Home <Outlet/>
                  </div>
                ),
                children: [
                  {
                    path: 'child',
                    resolvers: {
                      userInfo: () => () => {
                        throw new Error();
                      },
                    },
                    element: <div>Child</div>,
                    onResolverStatusChange: status => {
                      if (status === RouteHelperStatus.Failed) {
                        navigate('/login');
                      }
                    },
                  },
                ],
              },
            ];
            return <RoutesRenderer routes={routes}/>;
          }

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/home/child']}>
                <RoutesWrapper/>
              </MemoryRouter>,
            );
          });

          await wait(1);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Login page
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
          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                name: resolverWithException,
                lastName: mockAsyncResolver(workerDuration, 'doe'),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('1 resolver async throw an exception', async () => {
          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                name: resolverWithExceptionAsync,
                lastName: mockAsyncResolver(workerDuration, 'doe'),
              },
              onResolverStatusChange: (status: RouteHelperStatus) => {
                statuses.push(status);
              },
            },
          ];

          TestRenderer.act(() => {
            TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(workerDuration + workerDurationTimeBeforeCheck);
          expect(statuses.length).toBe(2);
          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
    });
  });

  describe('onGuardStatusChange with onResolverStatusChange functions mush work sequentially', () => {
    describe('parent route', () => {
      it('2 guards and 2 resolvers on parent', async () => {
        const guardStatuses: RouteHelperStatus[] = [];
        const resolverStatuses: RouteHelperStatus[] = [];

        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];

        const Home = () => {
          return (
            <div>
              Home
              <Outlet/>
            </div>
          );
        };

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home/>,
            guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
            resolvers: {
              userInfo: mockAsyncResolver(workerDuration, 'john'),
              authInfo: mockAsyncResolver(workerDuration, 'admin'),
            },
            onGuardStatusChange: (status: RouteHelperStatus) => {
              guardStatuses.push(status);
            },
            onResolverStatusChange: (status: RouteHelperStatus) => {
              resolverStatuses.push(status);
            },
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);
        expect(guardStatuses.length).toBe(1);
        expect(guardStatuses[0]).toBe(RouteHelperStatus.Loading);
        expect(resolverStatuses.length).toBe(0);

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(guardStatuses.length).toBe(1);
        expect(guardStatuses[0]).toBe(RouteHelperStatus.Loading);
        expect(resolverStatuses.length).toBe(0);

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(guardStatuses.length).toBe(2);
        guardStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });

        expect(resolverStatuses.length).toBe(1);
        expect(resolverStatuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(guardStatuses.length).toBe(2);
        guardStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });

        expect(resolverStatuses.length).toBe(2);
        resolverStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });
      });
    });
    describe('child route', () => {
      describe('tests to commit 2 different behaviours with re-renders for child path', () => {
        let parentGuardStatuses: RouteHelperStatus[] = [];
        let parentResolverStatuses: RouteHelperStatus[] = [];

        let childGuardStatuses: RouteHelperStatus[] = [];
        let childResolverStatuses: RouteHelperStatus[] = [];


        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];

        const routes = [
          {
            path: '/',
            element: (
              <div>
                Home
                <Outlet/>
              </div>
            ),
            guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
            resolvers: {
              userInfo: mockAsyncResolver(workerDuration, 'john'),
              authInfo: mockAsyncResolver(workerDuration, 'admin'),
            },
            onGuardStatusChange: (status: RouteHelperStatus) => {
              parentGuardStatuses.push(status);
            },
            onResolverStatusChange: (status: RouteHelperStatus) => {
              parentResolverStatuses.push(status);
            },
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
                resolvers: {
                  userInfo: mockAsyncResolver(workerDuration, 'john - child'),
                  authInfo: mockAsyncResolver(workerDuration, 'admin - child'),
                },
                onGuardStatusChange: (status: RouteHelperStatus) => {
                  childGuardStatuses.push(status);
                },
                onResolverStatusChange: (status: RouteHelperStatus) => {
                  childResolverStatuses.push(status);
                },
              },
            ],
          },
        ];

        testIn3DifferentModes({
          afterEach: () => {
            parentGuardStatuses = [];
            parentResolverStatuses = [];
            childGuardStatuses = [];
            childResolverStatuses = [];
          },
          routes,
          initialPath: '/child',
          validateResultInTestEnv: async () => {

            await wait(1);
            expect(parentGuardStatuses.length).toBe(1);
            expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(parentResolverStatuses.length).toBe(0);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration + workerDurationTimeBeforeCheck);
            expect(parentGuardStatuses.length).toBe(1);
            expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(parentResolverStatuses.length).toBe(0);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration + workerDurationTimeBeforeCheck);
            expect(parentGuardStatuses.length).toBe(2);
            parentGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });
            expect(parentResolverStatuses.length).toBe(1);
            expect(parentResolverStatuses[0]).toBe(RouteHelperStatus.Loading);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration + workerDurationTimeBeforeCheck);
            expect(parentGuardStatuses.length).toBe(2);
            parentGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });

            expect(parentResolverStatuses.length).toBe(2);
            parentResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });

            expect(childGuardStatuses.length).toBe(2);  // in real env = 1
            expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration);

            expect(childGuardStatuses.length).toBe(2);  // in real env = 1
            expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(childGuardStatuses[1]).toBe(RouteHelperStatus.Loading); // extra check, both statuses must be loading
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration);
            expect(childGuardStatuses.length).toBe(3);  // in real env = 2

            const expectedStatusesForChildInTestEnv = [
              RouteHelperStatus.Loading, // should be 2 loading, since in test env react does not keep refs between mount/unmount
              // but in real env does
              ...expectedStatuses,
            ];

            childGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatusesForChildInTestEnv[index]);
            });
            expect(childResolverStatuses.length).toBe(1);
            expect(childResolverStatuses[0]).toBe(RouteHelperStatus.Loading);

            expect(parentGuardStatuses.length).toBe(2);
            expect(parentResolverStatuses.length).toBe(2);

            await wait(workerDuration);

            expect(childGuardStatuses.length).toBe(3);  // in real env = 2
            expect(childResolverStatuses.length).toBe(2);

            childResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });

            expect(parentGuardStatuses.length).toBe(2);
            expect(parentResolverStatuses.length).toBe(2);
          },
          validateResultInRealEnv: async () => {
            await wait(1);
            expect(parentGuardStatuses.length).toBe(1);
            expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(parentResolverStatuses.length).toBe(0);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration + workerDurationTimeBeforeCheck);
            expect(parentGuardStatuses.length).toBe(1);
            expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(parentResolverStatuses.length).toBe(0);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration + workerDurationTimeBeforeCheck);
            expect(parentGuardStatuses.length).toBe(2);
            parentGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });
            expect(parentResolverStatuses.length).toBe(1);
            expect(parentResolverStatuses[0]).toBe(RouteHelperStatus.Loading);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration + workerDurationTimeBeforeCheck);
            expect(parentGuardStatuses.length).toBe(2);
            parentGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });

            expect(parentResolverStatuses.length).toBe(2);
            parentResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });

            expect(childGuardStatuses.length).toBe(1);
            expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration);

            expect(childGuardStatuses.length).toBe(1);
            expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(childResolverStatuses.length).toBe(0);

            await wait(workerDuration);
            expect(childGuardStatuses.length).toBe(2);
            childGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });
            expect(childResolverStatuses.length).toBe(1);
            expect(childResolverStatuses[0]).toBe(RouteHelperStatus.Loading);

            expect(parentGuardStatuses.length).toBe(2);
            expect(parentResolverStatuses.length).toBe(2);

            await wait(workerDuration);

            expect(childGuardStatuses.length).toBe(2);
            expect(childResolverStatuses.length).toBe(2);

            childResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });

            expect(parentGuardStatuses.length).toBe(2);
            expect(parentResolverStatuses.length).toBe(2);
          },
        });
      });
    });
  });
});
