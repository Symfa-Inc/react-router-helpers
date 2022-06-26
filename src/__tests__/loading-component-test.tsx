import { expect } from '@jest/globals';
import * as React from 'react';
import { FC, useEffect } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useGuardStatus, useLazyStatus, useLazyError, useResolverStatus } from '../hooks';
import { HelperOutlet } from '../route-helper';
import { HelperRouteObject, LazyLoadError, RouteHelperStatus } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { render, screen } from '@testing-library/react';
import {
  longestWorkDuration,
  mediumWorkDuration,
  minimalDurationBeforeShowLoading,
  minimalWorkDuration,
} from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockAsyncResolver } from './utils/mock-async-resolver';
import { mockSyncResolver } from './utils/mock-resolver';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';
const LazyHome = React.lazy(() => import('../components-for-test/LazyHome'));
const LazyHomeWithAnError = React.lazy(() => import('../components-for-test/LazyHomeWithAnError'));

const LoadingComponent: FC<{
  onGuardStatusChange?: (s: RouteHelperStatus) => void;
  onResolverStatusChange?: (s: RouteHelperStatus) => void;
  onLazyComponentStatusChange?: (s: RouteHelperStatus) => void;
  onLazyError?: (e?: LazyLoadError) => void;
  onMount?: () => void;
}> = props => {
  const guardStatus = useGuardStatus();
  const resolverStatus = useResolverStatus();
  const lazyComponentStatus = useLazyStatus();
  const lazyError = useLazyError();

  useEffect(() => {
    if (typeof props.onMount === 'function') {
      props.onMount();
    }
  }, []);

  useEffect(() => {
    if (typeof props.onGuardStatusChange === 'function') {
      props.onGuardStatusChange(guardStatus);
    }
  }, [guardStatus]);

  useEffect(() => {
    if (typeof props.onResolverStatusChange === 'function') {
      props.onResolverStatusChange(resolverStatus);
    }
  }, [resolverStatus]);

  useEffect(() => {
    if (typeof props.onLazyComponentStatusChange === 'function') {
      props.onLazyComponentStatusChange(lazyComponentStatus);
    }
  }, [lazyComponentStatus]);

  useEffect(() => {
    if (typeof props.onLazyError === 'function') {
      props.onLazyError(lazyError);
    }
  }, [lazyError]);

  return <></>;
};

describe('loadingComponent', () => {
  describe('should not be rendered twice', () => {
    it('with one route should not be rendered, sync guards', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      let counter = 0;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          guards: [mockSyncGuard(true), mockSyncGuard(true)],
          element: <div>Home</div>,
          loadingComponent: (
            <LoadingComponent
              onMount={() => {
                counter++;
              }}
            />
          ),
        },
      ];

      await TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(longestWorkDuration * 2 + mediumWorkDuration + minimalDurationBeforeShowLoading * 2);

      expect(counter).toBe(0);
    });
    it('with one route and failed guard', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      let counter = 0;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          guards: [mockSyncGuard(true), mockSyncGuard(false)],
          element: <div>Home</div>,
          loadingComponent: (
            <LoadingComponent
              onMount={() => {
                counter++;
              }}
            />
          ),
        },
      ];

      await TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(longestWorkDuration * 2 + mediumWorkDuration);

      expect(counter).toBe(1);
    });
  });
  describe('on guard status change', () => {
    describe('with sync guards', () => {
      it('for component without guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            loadingComponent: (
              <LoadingComponent
                key="test"
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']} key="old">
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalDurationBeforeShowLoading * 2);
        expect(statuses.length).toBe(0);
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
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={status => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 2 + minimalDurationBeforeShowLoading * 2);
        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Failed);
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
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 2);
        expect(statuses.length).toBe(0);
      });
      it('for component with canActivate true from all 2 guards', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockSyncGuard(true), mockSyncGuard(true)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        await wait(minimalDurationBeforeShowLoading);
        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalDurationBeforeShowLoading);
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home
          </div>
        `);
        expect(statuses.length).toBe(0);
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
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(mediumWorkDuration + minimalDurationBeforeShowLoading);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(longestWorkDuration * 2 + mediumWorkDuration);
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
            guards: [mockAsyncGuard(false, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        await TestRenderer.act( () => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(longestWorkDuration + mediumWorkDuration);
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
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(false, longestWorkDuration)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(longestWorkDuration * 2 + mediumWorkDuration);
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
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
                loadingComponent: (
                  <LoadingComponent
                    onGuardStatusChange={(status: RouteHelperStatus) => {
                      childStatuses.push(status);
                    }}
                  />
                ),
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

        await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);

        expect(statuses.length).toBe(1);
        expect(statuses[0]).toBe(RouteHelperStatus.Loading);

        await wait(longestWorkDuration * 2 + mediumWorkDuration);
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
                Home <HelperOutlet />
              </div>
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
                loadingComponent: (
                  <LoadingComponent
                    onGuardStatusChange={(status: RouteHelperStatus) => {
                      statuses.push(status);
                    }}
                  />
                ),
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

        await wait(longestWorkDuration * 2 + mediumWorkDuration * 2 + minimalWorkDuration);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });

      it('for component with canActivate false from second guard', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const statuses: RouteHelperStatus[] = [];
        const expectedStatuses = [RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <HelperOutlet />
              </div>
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockSyncGuard(false)],
                loadingComponent: (
                  <LoadingComponent
                    onGuardStatusChange={(status: RouteHelperStatus) => {
                      statuses.push(status);
                    }}
                  />
                ),
              },
            ],
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/child']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 3 + minimalDurationBeforeShowLoading * 2);
        expect(statuses.length).toBe(1);

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
            element: (
              <div>
                Home
                <HelperOutlet />
              </div>
            ),
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  parentStatuses.push(status);
                }}
              />
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
                loadingComponent: (
                  <LoadingComponent
                    onGuardStatusChange={(status: RouteHelperStatus) => {
                      childStatuses.push(status);
                    }}
                  />
                ),
              },
            ],
          },
        ];

        testIn3DifferentModes({
          routes,
          initialPath: '/child',
          validateResultInTestEnv: async () => {
            await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);

            expect(parentStatuses.length).toBe(1);
            expect(childStatuses.length).toBe(0);

            expect(parentStatuses[0]).toBe(RouteHelperStatus.Loading);

            await wait(longestWorkDuration * 2 + mediumWorkDuration * 2 + minimalWorkDuration * 2);
            expect(parentStatuses.length).toBe(2);

            parentStatuses.forEach((status, index) => {
              expect(status).toBe(expectedStatuses[index]);
            });

            expect(childStatuses.length).toBe(1);
            expect(childStatuses[0]).toBe(RouteHelperStatus.Loading);

            await wait(longestWorkDuration * 2 + mediumWorkDuration * 2);
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
                Home <HelperOutlet />
              </div>
            ),
            guards: [mockSyncGuard(true), mockAsyncGuard(true, longestWorkDuration)],
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(status: RouteHelperStatus) => {
                  statuses.push(status);
                }}
              />
            ),
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(longestWorkDuration + mediumWorkDuration);
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
                    Home <HelperOutlet />
                  </div>
                ),
                children: [
                  {
                    path: 'child',
                    guards: [mockSyncGuard(false)],
                    element: <div>Child</div>,
                    loadingComponent: (
                      <LoadingComponent
                        onGuardStatusChange={(s: RouteHelperStatus) => {
                          status = s;
                          if (status === RouteHelperStatus.Failed) {
                            navigate('/login');
                          }
                        }}
                      />
                    ),
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

          await wait(longestWorkDuration);

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

  describe('on resolver status change', () => {
    describe('async', () => {
      describe('for parent route', () => {
        it('for component without resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              loadingComponent: (
                <LoadingComponent
                  onGuardStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading * 2);
          expect(statuses.length).toBe(0);
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
                resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          expect(statuses.length).toBe(0);

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });
          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);

          expect(statuses.length).toBe(1);
          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
          renderer.unmount();

          await wait(1);
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
                resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                secondResolverInfo: mockAsyncResolver(longestWorkDuration, { lastName: 'doe' }),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });
          expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });

          renderer.unmount();
          await wait(1);
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
                  Home <HelperOutlet />
                </div>
              ),
              resolvers: {
                resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                secondResolverInfo: mockAsyncResolver(longestWorkDuration, { lastName: 'doe' }),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                  },
                  loadingComponent: (
                    <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        childStatuses.push(s);
                      }}
                    />
                  ),
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

          expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
          expect(statuses.length).toBe(0);

          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });

          expect(childStatuses.length).toBe(0);

          renderer.unmount();
          await wait(1);
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
                  <HelperOutlet />{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                  },
                  loadingComponent: (
                    <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        statuses.push(s);
                      }}
                    />
                  ),
                },
              ],
            },
          ];

          await TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(mediumWorkDuration + minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
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
                  <HelperOutlet />{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                    resolverInfo2: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                  },
                  loadingComponent: (
                    <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        statuses.push(s);
                      }}
                    />
                  ),
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(mediumWorkDuration + minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
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
                  <HelperOutlet />{' '}
                </div>
              ),
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
              resolvers: {
                resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                resolverInfo2: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
              },
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                    resolverInfo2: mockAsyncResolver(longestWorkDuration, { name: 'joe' }),
                  },
                  loadingComponent: (
                    <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        childStatuses.push(s);
                      }}
                    />
                  ),
                },
              ],
            },
          ];

          await TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);

          expect(statuses.length).toBe(1);
          expect(childStatuses.length).toBe(0);

          expect(statuses[0]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);

          expect(childStatuses.length).toBe(1);

          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });

          await wait(longestWorkDuration + mediumWorkDuration);
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
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockSyncResolver({ name: 'joe' }),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(0);
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockSyncResolver({ name: 'joe' }),
                secondResolverInfo: mockSyncResolver({ lastName: 'doe' }),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(0);
        });
      });
      describe('for child route', () => {
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <HelperOutlet />{' '}
                </div>
              ),
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  resolvers: {
                    resolverInfo: mockSyncResolver({ name: 'joe' }),
                  },
                  loadingComponent: (
                    <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        statuses.push(s);
                      }}
                    />
                  ),
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading * 2);
          expect(statuses.length).toBe(0);
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <HelperOutlet />{' '}
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
                  loadingComponent: (
                    <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        statuses.push(s);
                      }}
                    />
                  ),
                },
              ],
            },
          ];

          await TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration + minimalDurationBeforeShowLoading);
          expect(statuses.length).toBe(0);
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
                Home <HelperOutlet />
              </div>
            ),
            resolvers: {
              userInfoSync: mockSyncResolver(),
              userInfoAsync: mockAsyncResolver(),
            },
            loadingComponent: (
              <LoadingComponent
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  statuses.push(s);
                }}
              />
            ),
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(longestWorkDuration + mediumWorkDuration);
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
                    Home <HelperOutlet />
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
                    loadingComponent: (
                      <LoadingComponent
                        onResolverStatusChange={(s: RouteHelperStatus) => {
                          if (s === RouteHelperStatus.Failed) {
                            navigate('/login');
                          }
                        }}
                      />
                    ),
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

          await wait(longestWorkDuration);

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

      const resolverWithExceptionAsync = (ms = 20) => () => async () => {
        await wait(ms);
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
                lastName: mockAsyncResolver(longestWorkDuration, 'doe'),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(2);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('1 resolver async throw an exception error time 20ms', async () => {
          const statuses: RouteHelperStatus[] = [];

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                name: resolverWithExceptionAsync(),
                lastName: mockAsyncResolver(longestWorkDuration, 'doe'),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(1);
          expect(statuses[0]).toBe(RouteHelperStatus.Failed)
        });
        it('1 resolver async throw an exception error time 200ms', async () => {
          const statuses: RouteHelperStatus[] = [];

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                name: resolverWithExceptionAsync(200),
                lastName: mockAsyncResolver(longestWorkDuration, 'doe'),
              },
              loadingComponent: (
                <LoadingComponent
                  onResolverStatusChange={(s: RouteHelperStatus) => {
                    statuses.push(s);
                  }}
                />
              ),
            },
          ];

          TestRenderer.act(() => {
            TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} />
              </MemoryRouter>,
            );
          });

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(2);
          expect(statuses[0]).toBe(RouteHelperStatus.Loading);
          expect(statuses[1]).toBe(RouteHelperStatus.Failed);
        });
      });
    });
  });

  describe('guard with resolver statuses functions mush work sequentially', () => {
    describe('parent route', () => {
      it('2 guards and 2 resolvers on parent', async () => {
        const guardStatuses: RouteHelperStatus[] = [];
        const resolverStatuses: RouteHelperStatus[] = [];

        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const expectedResolverStatuses = [
          RouteHelperStatus.Initial,
          RouteHelperStatus.Loading,
          RouteHelperStatus.Loaded,
        ];

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
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            resolvers: {
              userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
              authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
            },
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(s: RouteHelperStatus) => {
                  guardStatuses.push(s);
                }}
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  resolverStatuses.push(s);
                }}
              />
            ),
          },
        ];

        await TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalDurationBeforeShowLoading + minimalWorkDuration * 2);
        expect(guardStatuses.length).toBe(1);
        expect(guardStatuses[0]).toBe(RouteHelperStatus.Loading);
        expect(resolverStatuses.length).toBe(1);
        expect(resolverStatuses[0]).toBe(RouteHelperStatus.Initial);

        await wait(longestWorkDuration + minimalWorkDuration);
        expect(guardStatuses.length).toBe(1);
        expect(guardStatuses[0]).toBe(RouteHelperStatus.Loading);
        expect(resolverStatuses.length).toBe(1);

        await wait(longestWorkDuration + minimalWorkDuration);
        expect(guardStatuses.length).toBe(2);
        guardStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });

        expect(resolverStatuses.length).toBe(2);
        expect(resolverStatuses[0]).toBe(RouteHelperStatus.Initial);
        expect(resolverStatuses[1]).toBe(RouteHelperStatus.Loading);

        guardStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });

        await wait(longestWorkDuration + mediumWorkDuration);

        expect(resolverStatuses.length).toBe(3);
        resolverStatuses.forEach((s, index) => {
          expect(s).toBe(expectedResolverStatuses[index]);
        });
      });
    });
    describe('child route', () => {
      describe('tests to commit 2 different behaviours with re-renders for child path', () => {
        let prodParentGuardStatuses: RouteHelperStatus[] = [];
        let prodParentResolverStatuses: RouteHelperStatus[] = [];

        let prodChildGuardStatuses: RouteHelperStatus[] = [];
        let prodChildResolverStatuses: RouteHelperStatus[] = [];

        let parentGuardStatuses: RouteHelperStatus[] = [];
        let parentResolverStatuses: RouteHelperStatus[] = [];

        let childGuardStatuses: RouteHelperStatus[] = [];
        let childResolverStatuses: RouteHelperStatus[] = [];

        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
        const expectedResolverStatuses = [
          RouteHelperStatus.Initial,
          RouteHelperStatus.Loading,
          RouteHelperStatus.Loaded,
        ];

        const expectedGuardStatusesInDevEnv = [
          RouteHelperStatus.Loading,
          RouteHelperStatus.Loading,
          RouteHelperStatus.Loaded,
        ];
        const expectedResolverStatusesInDevEnv = [
          RouteHelperStatus.Initial,
          RouteHelperStatus.Initial,
          RouteHelperStatus.Loading,
          RouteHelperStatus.Loaded,
        ];

        const prodRoutes = [
          {
            path: '/',
            element: (
              <div>
                Home
                <HelperOutlet />
              </div>
            ),
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            resolvers: {
              userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
              authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
            },
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(s: RouteHelperStatus) => {
                  console.log('PARENT G ' + RouteHelperStatus[s]);
                  prodParentGuardStatuses.push(s);
                }}
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  console.log('PARENT R ' + RouteHelperStatus[s]);
                  prodParentResolverStatuses.push(s);
                }}
              />
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
                resolvers: {
                  userInfo: mockAsyncResolver(longestWorkDuration, 'john - child'),
                  authInfo: mockAsyncResolver(longestWorkDuration, 'admin - child'),
                },
                loadingComponent: (
                  <LoadingComponent
                    onGuardStatusChange={(s: RouteHelperStatus) => {
                      prodChildGuardStatuses.push(s);
                    }}
                    onResolverStatusChange={(s: RouteHelperStatus) => {
                      prodChildResolverStatuses.push(s);
                    }}
                  />
                ),
              },
            ],
          },
        ];

        const devRoutes = [
          {
            path: '/',
            element: (
              <div>
                Home
                <HelperOutlet />
              </div>
            ),
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            resolvers: {
              userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
              authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
            },
            loadingComponent: (
              <LoadingComponent
                onGuardStatusChange={(s: RouteHelperStatus) => {
                  console.log('PARENT G ' + RouteHelperStatus[s]);
                  parentGuardStatuses.push(s);
                }}
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  console.log('PARENT R ' + RouteHelperStatus[s]);
                  parentResolverStatuses.push(s);
                }}
              />
            ),
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
                resolvers: {
                  userInfo: mockAsyncResolver(longestWorkDuration, 'john - child'),
                  authInfo: mockAsyncResolver(longestWorkDuration, 'admin - child'),
                },
                loadingComponent: (
                  <LoadingComponent
                    onGuardStatusChange={(s: RouteHelperStatus) => {
                      childGuardStatuses.push(s);
                    }}
                    onResolverStatusChange={(s: RouteHelperStatus) => {
                      childResolverStatuses.push(s);
                    }}
                  />
                ),
              },
            ],
          },
        ];

        testIn3DifferentModes({
          needToRunInDev: false,
          routes: prodRoutes,
          initialPath: '/child',
          validateResultInRealEnv: async () => {
            await wait(minimalDurationBeforeShowLoading + mediumWorkDuration);
            expect(prodParentGuardStatuses.length).toBe(1);
            expect(prodParentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);

            expect(prodParentResolverStatuses.length).toBe(1);
            expect(prodParentResolverStatuses[0]).toBe(RouteHelperStatus.Initial);

            expect(prodChildGuardStatuses.length).toBe(0);
            expect(prodChildResolverStatuses.length).toBe(0);

            await wait(longestWorkDuration + minimalWorkDuration);
            expect(prodParentGuardStatuses.length).toBe(1);
            expect(prodParentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(prodParentResolverStatuses.length).toBe(1);

            expect(prodChildGuardStatuses.length).toBe(0);
            expect(prodChildResolverStatuses.length).toBe(0);

            await wait(longestWorkDuration + minimalWorkDuration);
            expect(prodParentGuardStatuses.length).toBe(2);
            prodParentGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });
            expect(prodParentResolverStatuses.length).toBe(2);
            expect(prodParentResolverStatuses[0]).toBe(RouteHelperStatus.Initial);
            expect(prodParentResolverStatuses[1]).toBe(RouteHelperStatus.Loading);

            expect(prodChildGuardStatuses.length).toBe(0);
            expect(prodChildResolverStatuses.length).toBe(0);

            await wait(longestWorkDuration + minimalWorkDuration);
            expect(prodParentResolverStatuses.length).toBe(3);
            prodParentResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedResolverStatuses[index]);
            });

            expect(prodChildGuardStatuses.length).toBe(1);
            expect(prodChildGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(prodChildResolverStatuses.length).toBe(1);
            expect(prodChildResolverStatuses[0]).toBe(RouteHelperStatus.Initial);

            await wait(longestWorkDuration);

            expect(prodChildGuardStatuses.length).toBe(1);
            expect(prodChildGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(prodChildResolverStatuses.length).toBe(1);

            await wait(longestWorkDuration);
            expect(prodChildGuardStatuses.length).toBe(2);
            prodChildGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedStatuses[index]);
            });
            expect(prodChildResolverStatuses.length).toBe(2);
            expect(prodChildResolverStatuses[0]).toBe(RouteHelperStatus.Initial);
            expect(prodChildResolverStatuses[1]).toBe(RouteHelperStatus.Loading);

            expect(prodParentGuardStatuses.length).toBe(2);
            expect(prodParentResolverStatuses.length).toBe(3);

            await wait(longestWorkDuration);

            expect(prodChildGuardStatuses.length).toBe(2);
            expect(prodChildResolverStatuses.length).toBe(3);

            prodChildResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedResolverStatuses[index]);
            });

            expect(prodParentGuardStatuses.length).toBe(2);
            expect(prodParentResolverStatuses.length).toBe(3);
          },
        });

        testIn3DifferentModes({
          needToRunInProd: false,
          routes: devRoutes,
          initialPath: '/child',
          validateResultInRealEnv: async () => {
            await wait(minimalDurationBeforeShowLoading + minimalWorkDuration);
            expect(parentGuardStatuses.length).toBe(2); // 1 in prod env
            expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);

            expect(parentResolverStatuses.length).toBe(2); // 1 in prod env
            expect(parentResolverStatuses[0]).toBe(RouteHelperStatus.Initial);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(longestWorkDuration + minimalWorkDuration);
            expect(parentGuardStatuses.length).toBe(2); // 1 in prod env
            expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(parentResolverStatuses.length).toBe(2); // 1 in prod env

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(longestWorkDuration + minimalWorkDuration);
            expect(parentGuardStatuses.length).toBe(3); // 2 in prod env
            parentGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedGuardStatusesInDevEnv[index]);
            });
            expect(parentResolverStatuses.length).toBe(3); // 2 in prod env
            expect(parentResolverStatuses[0]).toBe(RouteHelperStatus.Initial);
            expect(parentResolverStatuses[1]).toBe(RouteHelperStatus.Initial);
            expect(parentResolverStatuses[2]).toBe(RouteHelperStatus.Loading);

            expect(childGuardStatuses.length).toBe(0);
            expect(childResolverStatuses.length).toBe(0);

            await wait(longestWorkDuration + mediumWorkDuration);
            expect(parentResolverStatuses.length).toBe(4); // 3 in prod env
            parentResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedResolverStatusesInDevEnv[index]);
            });

            expect(childGuardStatuses.length).toBe(2); // 1 in prod env
            expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(childResolverStatuses.length).toBe(2); // 1 in prod env
            expect(childResolverStatuses[0]).toBe(RouteHelperStatus.Initial);

            await wait(longestWorkDuration);

            expect(childGuardStatuses.length).toBe(2); // 1 in prod env
            expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
            expect(childResolverStatuses.length).toBe(2); // 1 in prod env

            await wait(longestWorkDuration);
            expect(childGuardStatuses.length).toBe(3); // 2 in prod env
            childGuardStatuses.forEach((s, index) => {
              expect(s).toBe(expectedGuardStatusesInDevEnv[index]);
            });
            expect(childResolverStatuses.length).toBe(3); // 2 in prod env
            expect(childResolverStatuses[0]).toBe(RouteHelperStatus.Initial);
            expect(childResolverStatuses[1]).toBe(RouteHelperStatus.Initial);
            expect(childResolverStatuses[2]).toBe(RouteHelperStatus.Loading);

            expect(parentGuardStatuses.length).toBe(3); // 2 in prod env
            expect(parentResolverStatuses.length).toBe(4); // 3 in prod env

            await wait(longestWorkDuration);

            expect(prodChildGuardStatuses.length).toBe(2);
            expect(childResolverStatuses.length).toBe(4); // 3 in prod env

            childResolverStatuses.forEach((s, index) => {
              expect(s).toBe(expectedResolverStatusesInDevEnv[index]);
            });

            expect(parentGuardStatuses.length).toBe(3); // 2 in prod env
            expect(parentResolverStatuses.length).toBe(4); // 3 in prod env
          },
        });
      });
    });
  });

  describe('for lazy component', () => {
    it('should not receive lazy component status', async () => {
      const statuses: RouteHelperStatus[] = [];

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <LazyHome />,
          guards: [mockAsyncGuard(true, longestWorkDuration)],
          resolvers: {
            lastName: mockAsyncResolver(longestWorkDuration, 'doe'),
          },
          loadingComponent: (
            <LoadingComponent
              onLazyComponentStatusChange={(s: RouteHelperStatus) => {
                statuses.push(s);
              }}
            />
          ),
        },
      ];

      await TestRenderer.act(() => {
        TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(longestWorkDuration + mediumWorkDuration);
      expect(statuses.length).toBe(1);
      expect(statuses[0]).toBe(RouteHelperStatus.Initial);
    });

    it('should receive an error',  async () => {

      const lazyStatuses: RouteHelperStatus[] = [];
      let error;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          loadElement: <LazyHomeWithAnError />,
          loadingComponent: (
            <LoadingComponent
              onLazyComponentStatusChange={(s: RouteHelperStatus) => {
                lazyStatuses.push(s);
              }}
              onLazyError={e => {
                error = e;
              }}
            />
          ),
        },
      ];

      await TestRenderer.act(() => {
        render(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(longestWorkDuration);

      expect(lazyStatuses.length).toBe(1);
      expect(lazyStatuses[0]).toBe(RouteHelperStatus.Failed);

      expect(error).not.toBeFalsy();
    });
  });
});
