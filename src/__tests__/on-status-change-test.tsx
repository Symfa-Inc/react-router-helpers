import { expect } from '@jest/globals';
import * as React from 'react';
import { FC, useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { useGuardStatus, useResolverStatus } from '../hooks';
import { HelperOutlet } from '../route-helper';
import { HelperRouteObject, RouteHelperStatus } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { longestWorkDuration, mediumWorkDuration, minimalWorkDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockAsyncResolver } from './utils/mock-async-resolver';
import { mockSyncResolver } from './utils/mock-resolver';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

var scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;

function flushPromises() {
  return new Promise(function (resolve) {
    scheduler(resolve);
  });
}

const LoadingComponent: FC<{
  onGuardStatusChange?: (s: RouteHelperStatus) => void;
  onResolverStatusChange?: (s: RouteHelperStatus) => void;
}> = props => {
  const guardStatus = useGuardStatus();
  const resolverStatus = useResolverStatus();

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

  return <></>;
};

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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 2);
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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 2);
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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 2);
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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 2);
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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);

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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);

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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(1);

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
                Home <HelperOutlet/>
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
              <RoutesRenderer routes={routes} location={{ pathname: '/child' }}/>
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
        const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Failed];
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: (
              <div>
                Home <HelperOutlet/>
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
              <RoutesRenderer routes={routes}/>
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration * 3);
        expect(statuses.length).toBe(2);

        statuses.forEach((status, index) => {
          expect(status).toBe(expectedStatuses[index]);
        });
      });
    });

    // describe('for child with parent guard', () => {
    //   describe('tests to commit 2 different behaviours with re-renders for child path', () => {
    //
    //     let parentStatuses: RouteHelperStatus[] = [];
    //     let childStatuses: RouteHelperStatus[] = [];
    //
    //     const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
    //
    //     const routes: HelperRouteObject[] = [
    //       {
    //         path: '/',
    //         element: <div>
    //           Home
    //           <HelperOutlet/>
    //         </div>,
    //         guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
    //         loadingComponent: <LoadingComponent onGuardStatusChange={(status: RouteHelperStatus) => {
    //           parentStatuses.push(status);
    //         }} />,
    //         children: [
    //           {
    //             path: 'child',
    //             element: <div>Child</div>,
    //             guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
    //             loadingComponent: <LoadingComponent onGuardStatusChange={(status: RouteHelperStatus) => {
    //               childStatuses.push(status);
    //             }} />,
    //           },
    //         ],
    //       },
    //     ];
    //
    //     testIn3DifferentModes({
    //       routes,
    //       initialPath: '/child',
    //       validateResultInTestEnv: async () => {
    //
    //         await wait(minimalWorkDuration);
    //
    //         expect(parentStatuses.length).toBe(1);
    //         expect(childStatuses.length).toBe(0);
    //
    //         expect(parentStatuses[0]).toBe(RouteHelperStatus.Loading);
    //
    //         await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2 + minimalWorkDuration * 2);
    //         expect(parentStatuses.length).toBe(2);
    //
    //         parentStatuses.forEach((status, index) => {
    //           expect(status).toBe(expectedStatuses[index]);
    //         });
    //
    //         expect(childStatuses.length).toBe(1);
    //         expect(childStatuses[0]).toBe(RouteHelperStatus.Loading);
    //
    //         await wait(workerDuration * 2 + workerDurationTimeBeforeCheck * 2);
    //         expect(childStatuses.length).toBe(2);
    //
    //         childStatuses.forEach((status, index) => {
    //           expect(status).toBe(expectedStatuses[index]);
    //         });
    //       },
    //     });
    //   });
    // });

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
                Home <HelperOutlet/>
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
              <RoutesRenderer routes={routes}/>
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
                    Home <HelperOutlet/>
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
            return <RoutesRenderer routes={routes}/>;
          }

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/home/child']}>
                <RoutesWrapper/>
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
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(1);
          expect(statuses.length).toBe(1);
          expect(statuses[0]).toBe(RouteHelperStatus.Loaded);

          renderer.unmount();
          await wait(1);
        });
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
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
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });
          await wait(1);

          expect(statuses.length).toBe(1);
          expect(statuses[0]).toBe(RouteHelperStatus.Initial);

          await wait(minimalWorkDuration);

          expect(statuses.length).toBe(2);
          expect(statuses[1]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
          renderer.unmount();

          await wait(1);
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
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
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });
          expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

          await wait(1);
          expect(statuses.length).toBe(1);

          expect(statuses[0]).toBe(RouteHelperStatus.Initial);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(3);

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
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home <HelperOutlet/>
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
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
          expect(statuses.length).toBe(1);
          expect(statuses[0]).toBe(RouteHelperStatus.Initial);

          await wait(minimalWorkDuration);
          expect(statuses.length).toBe(2);

          expect(statuses[1]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(3);

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
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <HelperOutlet/>{' '}
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

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          expect(statuses.length).toBe(0);

          await wait(minimalWorkDuration);
          expect(statuses.length).toBe(2);

          expect(statuses[0]).toBe(RouteHelperStatus.Initial);
          expect(statuses[1]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <HelperOutlet/>{' '}
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
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(mediumWorkDuration);
          expect(statuses.length).toBe(2);

          expect(statuses[0]).toBe(RouteHelperStatus.Initial);
          expect(statuses[1]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
      describe('for child with parent resolver', () => {
        it('parent and child have 2 resolvers', async () => {
          await wait(2000);
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const childStatuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home
                  <HelperOutlet/>{' '}
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

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes}/>
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration);

          expect(statuses.length).toBe(2);
          // TODO: DIFF
          expect(childStatuses.length).toBe(0);

          expect(statuses[0]).toBe(RouteHelperStatus.Initial);
          expect(statuses[1]).toBe(RouteHelperStatus.Loading);

          await wait(longestWorkDuration + minimalWorkDuration);

          expect(childStatuses.length).toBe(2);

          expect(childStatuses[0]).toBe(RouteHelperStatus.Initial);
          expect(childStatuses[1]).toBe(RouteHelperStatus.Loading);

          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(childStatuses.length).toBe(3);

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
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockSyncResolver({ name: 'joe' }),
              },
              loadingComponent: <LoadingComponent
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  statuses.push(s);
                }}
              />,
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
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                resolverInfo: mockSyncResolver({ name: 'joe' }),
                secondResolverInfo: mockSyncResolver({ lastName: 'doe' }),
              },
              loadingComponent: <LoadingComponent
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  statuses.push(s);
                }}
              />,
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
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
      });
      describe('for child route', () => {
        it('for component with 1 resolver', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
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
                  loadingComponent: <LoadingComponent
                    onResolverStatusChange={(s: RouteHelperStatus) => {
                      statuses.push(s);
                    }}
                  />,
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

          await wait(minimalWorkDuration);
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('for component with 2 resolvers', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
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
                  loadingComponent: <LoadingComponent
                    onResolverStatusChange={(s: RouteHelperStatus) => {
                      statuses.push(s);
                    }}
                  />,
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/child']}>
                <RoutesRenderer routes={routes}  />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration);
          expect(statuses.length).toBe(3);

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
        const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
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
            loadingComponent: <LoadingComponent
              onResolverStatusChange={(s: RouteHelperStatus) => {
                statuses.push(s);
              }}
            />,
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
        expect(statuses.length).toBe(3);

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
                    loadingComponent: <LoadingComponent
                      onResolverStatusChange={(s: RouteHelperStatus) => {
                        if (s === RouteHelperStatus.Failed) {
                          navigate('/login');
                        }
                      }}
                    />,
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

      const resolverWithExceptionAsync = () => async () => {
        await wait(20);
        throw new Error();
      };

      describe('for parent route', () => {
        it('1 resolver sync throw an exception', async () => {
          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Failed];

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                name: resolverWithException,
                lastName: mockAsyncResolver(longestWorkDuration, 'doe'),
              },
              loadingComponent: <LoadingComponent
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  statuses.push(s);
                }}
              />,
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
          expect(statuses.length).toBe(3);

          statuses.forEach((status, index) => {
            expect(status).toBe(expectedStatuses[index]);
          });
        });
        it('1 resolver async throw an exception', async () => {
          const statuses: RouteHelperStatus[] = [];
          const expectedStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Failed];

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              resolvers: {
                name: resolverWithExceptionAsync,
                lastName: mockAsyncResolver(longestWorkDuration, 'doe'),
              },
              loadingComponent: <LoadingComponent
                onResolverStatusChange={(s: RouteHelperStatus) => {
                  statuses.push(s);
                }}
              />,
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
          expect(statuses.length).toBe(3);
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
        const expectedResolverStatuses = [RouteHelperStatus.Initial, RouteHelperStatus.Loading, RouteHelperStatus.Loaded];

        const Home = () => {
          return (
            <div>
              Home
              <HelperOutlet/>
            </div>
          );
        };

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <Home/>,
            guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
            resolvers: {
              userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
              authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
            },
            loadingComponent: <LoadingComponent
              onGuardStatusChange={(s: RouteHelperStatus) => {
                guardStatuses.push(s);
              }}
              onResolverStatusChange={(s: RouteHelperStatus) => {
                resolverStatuses.push(s);
              }}
            />,
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
        expect(resolverStatuses.length).toBe(1);
        expect(resolverStatuses[0]).toBe(RouteHelperStatus.Initial);

        await wait(longestWorkDuration * 2 + mediumWorkDuration);
        expect(guardStatuses.length).toBe(1);
        expect(guardStatuses[0]).toBe(RouteHelperStatus.Loading);
        expect(resolverStatuses.length).toBe(2);

        await wait(longestWorkDuration + mediumWorkDuration);
        expect(guardStatuses.length).toBe(2);
        guardStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });

        expect(resolverStatuses.length).toBe(3);
        expect(resolverStatuses[0]).toBe(RouteHelperStatus.Initial);

        guardStatuses.forEach((s, index) => {
          expect(s).toBe(expectedStatuses[index]);
        });

        resolverStatuses.forEach((s, index) => {
          expect(s).toBe(expectedResolverStatuses[index]);
        });
      });
    });
    // describe('child route', () => {
    //   describe('tests to commit 2 different behaviours with re-renders for child path', () => {
    //     let parentGuardStatuses: RouteHelperStatus[] = [];
    //     let parentResolverStatuses: RouteHelperStatus[] = [];
    //
    //     let childGuardStatuses: RouteHelperStatus[] = [];
    //     let childResolverStatuses: RouteHelperStatus[] = [];
    //
    //     const expectedStatuses = [RouteHelperStatus.Loading, RouteHelperStatus.Loaded];
    //
    //     const routes = [
    //       {
    //         path: '/',
    //         element: (
    //           <div>
    //             Home
    //             <HelperOutlet/>
    //           </div>
    //         ),
    //         guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
    //         resolvers: {
    //           userInfo: mockAsyncResolver(longestWorkDuration, 'john'),
    //           authInfo: mockAsyncResolver(longestWorkDuration, 'admin'),
    //         },
    //         loadingComponent: <LoadingComponent
    //           onGuardStatusChange={(s: RouteHelperStatus) => {
    //             parentGuardStatuses.push(s);
    //           }}
    //           onResolverStatusChange={(s: RouteHelperStatus) => {
    //             parentResolverStatuses.push(s);
    //           }}
    //         />,
    //         children: [
    //           {
    //             path: 'child',
    //             element: <div>Child</div>,
    //             guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
    //             resolvers: {
    //               userInfo: mockAsyncResolver(longestWorkDuration, 'john - child'),
    //               authInfo: mockAsyncResolver(longestWorkDuration, 'admin - child'),
    //             },
    //             loadingComponent: <LoadingComponent
    //               onGuardStatusChange={(s: RouteHelperStatus) => {
    //                 childGuardStatuses.push(s);
    //               }}
    //               onResolverStatusChange={(s: RouteHelperStatus) => {
    //                 childResolverStatuses.push(s);
    //               }}
    //             />,
    //           },
    //         ],
    //       },
    //     ];
    //
    //     testIn3DifferentModes({
    //       afterEach: () => {
    //         parentGuardStatuses = [];
    //         parentResolverStatuses = [];
    //         childGuardStatuses = [];
    //         childResolverStatuses = [];
    //       },
    //       routes,
    //       initialPath: '/child',
    //       validateResultInTestEnv: async () => {
    //         await wait(minimalWorkDuration * 2);
    //         expect(parentGuardStatuses.length).toBe(1);
    //         expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //         expect(parentResolverStatuses.length).toBe(1);
    //
    //         expect(childGuardStatuses.length).toBe(0);
    //         expect(childResolverStatuses.length).toBe(0);
    //
    //         await wait(longestWorkDuration + mediumWorkDuration * 2);
    //         expect(parentGuardStatuses.length).toBe(1);
    //         expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //         expect(parentResolverStatuses.length).toBe(1);
    //
    //         expect(childGuardStatuses.length).toBe(0);
    //         expect(childResolverStatuses.length).toBe(0);
    //
    //         await wait(longestWorkDuration  + minimalWorkDuration * 2);
    //         expect(parentGuardStatuses.length).toBe(2);
    //         parentGuardStatuses.forEach((s, index) => {
    //           expect(s).toBe(expectedStatuses[index]);
    //         });
    //         expect(parentResolverStatuses.length).toBe(1);
    //         expect(parentResolverStatuses[0]).toBe(RouteHelperStatus.Loading);
    //
    //         expect(childGuardStatuses.length).toBe(0);
    //         expect(childResolverStatuses.length).toBe(0);
    //
    //         await wait(longestWorkDuration + mediumWorkDuration);
    //         expect(parentGuardStatuses.length).toBe(2);
    //         parentGuardStatuses.forEach((s, index) => {
    //           expect(s).toBe(expectedStatuses[index]);
    //         });
    //
    //         expect(parentResolverStatuses.length).toBe(2);
    //         parentResolverStatuses.forEach((s, index) => {
    //           expect(s).toBe(expectedStatuses[index]);
    //         });
    //
    //         expect(childGuardStatuses.length).toBe(2); // in real env = 1
    //         expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //         expect(childResolverStatuses.length).toBe(0);
    //
    //         await wait(longestWorkDuration);
    //
    //         expect(childGuardStatuses.length).toBe(2); // in real env = 1
    //         expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //         expect(childGuardStatuses[1]).toBe(RouteHelperStatus.Loading); // extra check, both statuses must be loading
    //         expect(childResolverStatuses.length).toBe(0);
    //
    //         await wait(longestWorkDuration);
    //         expect(childGuardStatuses.length).toBe(3); // in real env = 2
    //
    //         const expectedStatusesForChildInTestEnv = [
    //           RouteHelperStatus.Loading, // should be 2 loading, since in test env react does not keep refs between mount/unmount
    //           // but in real env does
    //           ...expectedStatuses,
    //         ];
    //
    //         childGuardStatuses.forEach((s, index) => {
    //           expect(s).toBe(expectedStatusesForChildInTestEnv[index]);
    //         });
    //         expect(childResolverStatuses.length).toBe(1);
    //         expect(childResolverStatuses[0]).toBe(RouteHelperStatus.Loading);
    //
    //         expect(parentGuardStatuses.length).toBe(2);
    //         expect(parentResolverStatuses.length).toBe(2);
    //
    //         await wait(longestWorkDuration);
    //
    //         expect(childGuardStatuses.length).toBe(3); // in real env = 2
    //         expect(childResolverStatuses.length).toBe(2);
    //
    //         childResolverStatuses.forEach((s, index) => {
    //           expect(s).toBe(expectedStatuses[index]);
    //         });
    //
    //         expect(parentGuardStatuses.length).toBe(2);
    //         expect(parentResolverStatuses.length).toBe(2);
    //       },
    //       // validateResultInRealEnv: async () => {
    //       //   await wait(minimalWorkDuration);
    //       //   expect(parentGuardStatuses.length).toBe(1);
    //       //   expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //       //   expect(parentResolverStatuses.length).toBe(0);
    //       //
    //       //   expect(childGuardStatuses.length).toBe(0);
    //       //   expect(childResolverStatuses.length).toBe(0);
    //       //
    //       //   await wait(longestWorkDuration + mediumWorkDuration);
    //       //   expect(parentGuardStatuses.length).toBe(1);
    //       //   expect(parentGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //       //   expect(parentResolverStatuses.length).toBe(0);
    //       //
    //       //   expect(childGuardStatuses.length).toBe(0);
    //       //   expect(childResolverStatuses.length).toBe(0);
    //       //
    //       //   await wait(longestWorkDuration + mediumWorkDuration);
    //       //   expect(parentGuardStatuses.length).toBe(2);
    //       //   parentGuardStatuses.forEach((s, index) => {
    //       //     expect(s).toBe(expectedStatuses[index]);
    //       //   });
    //       //   expect(parentResolverStatuses.length).toBe(1);
    //       //   expect(parentResolverStatuses[0]).toBe(RouteHelperStatus.Loading);
    //       //
    //       //   expect(childGuardStatuses.length).toBe(0);
    //       //   expect(childResolverStatuses.length).toBe(0);
    //       //
    //       //   await wait(longestWorkDuration + mediumWorkDuration);
    //       //   expect(parentGuardStatuses.length).toBe(2);
    //       //   parentGuardStatuses.forEach((s, index) => {
    //       //     expect(s).toBe(expectedStatuses[index]);
    //       //   });
    //       //
    //       //   expect(parentResolverStatuses.length).toBe(2);
    //       //   parentResolverStatuses.forEach((s, index) => {
    //       //     expect(s).toBe(expectedStatuses[index]);
    //       //   });
    //       //
    //       //   expect(childGuardStatuses.length).toBe(1);
    //       //   expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //       //   expect(childResolverStatuses.length).toBe(0);
    //       //
    //       //   await wait(longestWorkDuration);
    //       //
    //       //   expect(childGuardStatuses.length).toBe(1);
    //       //   expect(childGuardStatuses[0]).toBe(RouteHelperStatus.Loading);
    //       //   expect(childResolverStatuses.length).toBe(0);
    //       //
    //       //   await wait(longestWorkDuration);
    //       //   expect(childGuardStatuses.length).toBe(2);
    //       //   childGuardStatuses.forEach((s, index) => {
    //       //     expect(s).toBe(expectedStatuses[index]);
    //       //   });
    //       //   expect(childResolverStatuses.length).toBe(1);
    //       //   expect(childResolverStatuses[0]).toBe(RouteHelperStatus.Loading);
    //       //
    //       //   expect(parentGuardStatuses.length).toBe(2);
    //       //   expect(parentResolverStatuses.length).toBe(2);
    //       //
    //       //   await wait(longestWorkDuration);
    //       //
    //       //   expect(childGuardStatuses.length).toBe(2);
    //       //   expect(childResolverStatuses.length).toBe(2);
    //       //
    //       //   childResolverStatuses.forEach((s, index) => {
    //       //     expect(s).toBe(expectedStatuses[index]);
    //       //   });
    //       //
    //       //   expect(parentGuardStatuses.length).toBe(2);
    //       //   expect(parentResolverStatuses.length).toBe(2);
    //       // },
    //     });
    //   });
    // });
  });
});
