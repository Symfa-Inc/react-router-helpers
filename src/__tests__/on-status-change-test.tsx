import * as React from 'react';
import { MemoryRouter, Outlet, useNavigate } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject, RouteHelperStatus } from '../types';
import { workerDurationTimeBeforeCheck, workerDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
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
              <RoutesRenderer routes={routes} />
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
              <RoutesRenderer routes={routes} />
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
              <RoutesRenderer routes={routes} />
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
              <RoutesRenderer routes={routes} />
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
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

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
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

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
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(workerDuration * 2 + workerDurationTimeBeforeCheck);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
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
                Home <Outlet />
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
              <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
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
                Home <Outlet />
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
              <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
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
                    Home <Outlet />
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
            return <RoutesRenderer routes={routes} />;
          }

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/home/child']}>
                <RoutesWrapper />
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

    describe('from parent route', () => {
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
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(1);
        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loaded);
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
                    Home <Outlet />
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
            return <RoutesRenderer routes={routes} />;
          }

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/home/child']}>
                <RoutesWrapper />
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
  });

  describe('onGuardStatusChange with onResolverStatusChange functions', () => {

  });
});
