import { expect } from '@jest/globals';
import * as React from 'react';
import { FC, useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, useNavigate, useParams } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperOutlet, useGuardStatus } from '../index';
import { HelperRouteObject, RouteHelperStatus } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { minimalWorkDuration, longestWorkDuration, mediumWorkDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockGuardWithCounter } from './utils/mock-guard-with-counter';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

describe('Guards in route', () => {
  describe('with async guards', () => {
    describe('should be called once for parent', () => {
      const counter = { amount: 0 };
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockGuardWithCounter(counter), mockGuardWithCounter(counter)],
        },
      ];

      testIn3DifferentModes({
        afterEach: () => {
          counter.amount = 0;
        },
        routes,
        initialPath: '/',
        validate: async () => {
          await wait(minimalWorkDuration);
          expect(counter.amount).toBe(2);
        },
      });
    });
    describe('should be called once for parent and child', () => {
      const parentCounter = { amount: 0 };
      const childCounter = { amount: 0 };
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: (
            <div>
              Home <HelperOutlet />
            </div>
          ),
          guards: [mockGuardWithCounter(parentCounter), mockGuardWithCounter(parentCounter)],
          children: [
            {
              path: '/child',
              element: <div>child</div>,
              guards: [mockGuardWithCounter(childCounter), mockGuardWithCounter(childCounter)],
            },
          ],
        },
      ];

      testIn3DifferentModes({
        afterEach: () => {
          parentCounter.amount = 0;
          childCounter.amount = 0;
        },
        routes,
        initialPath: '/child',
        validate: async () => {
          await wait(longestWorkDuration);
          expect(parentCounter.amount).toBe(2);

          await wait(longestWorkDuration);
          expect(childCounter.amount).toBe(2);
        },
      });
    });
    it('with 1 guard which return true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(true, longestWorkDuration)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(longestWorkDuration + mediumWorkDuration * 2);

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
          guards: [mockAsyncGuard(false, longestWorkDuration)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which return true - first true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(true, longestWorkDuration), mockAsyncGuard(false, longestWorkDuration)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(longestWorkDuration * 2 + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });
    it('with 2 guard which return false - first false - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(false, longestWorkDuration), mockAsyncGuard(false, longestWorkDuration)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which first guard false - second true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(false, longestWorkDuration), mockAsyncGuard(true, longestWorkDuration)],
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
          guards: [mockSyncGuard(true)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalWorkDuration);

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
          guards: [mockSyncGuard(false)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guards which return true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockSyncGuard(true), mockSyncGuard(true)],
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
          guards: [mockSyncGuard(false), mockSyncGuard(false)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guards which first guard true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockSyncGuard(true), mockSyncGuard(false)],
        },
      ];

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <RoutesRenderer routes={routes} />
          </MemoryRouter>,
        );
      });

      await wait(minimalWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guards which first guard false - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockSyncGuard(false, longestWorkDuration), mockSyncGuard(false, longestWorkDuration)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });
  });

  describe('async and sync guards mixed', () => {
    describe('for parent', () => {
      it('with 2 guard - true async first', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockAsyncGuard(true, longestWorkDuration), mockSyncGuard(true)],
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
                  <div>
                    Home
                  </div>
              `);
      });
      it('with 2 guard - true sync first', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockSyncGuard(true), mockAsyncGuard(true, longestWorkDuration)],
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

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
                  <div>
                    Home
                  </div>
              `);
      });
    });
    describe('for child', () => {
      describe('parent has guards', () => {
        it('with 2 guard - true async first', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home <HelperOutlet />
                </div>
              ),
              guards: [mockAsyncGuard(true, longestWorkDuration), mockSyncGuard(true)],
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  guards: [mockAsyncGuard(true, longestWorkDuration), mockSyncGuard(true)],
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
            </div>
          `);

          await wait(longestWorkDuration * 2 + mediumWorkDuration * 2);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
              <div>
                Child
              </div>
            </div>
          `);
        });
        it('with 2 guard - true sync first', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: (
                <div>
                  Home <HelperOutlet />
                </div>
              ),
              guards: [mockSyncGuard(true), mockAsyncGuard(true, longestWorkDuration)],
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  guards: [mockSyncGuard(true), mockAsyncGuard(true, longestWorkDuration)],
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

          await wait(minimalWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
            </div>
          `);

          await wait(longestWorkDuration * 2 + mediumWorkDuration * 2);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
              <div>
                Child
              </div>
            </div>
          `);
        });
      });
      describe('parent does not have guards', () => {
        it('with 2 guard - true async first', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

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
                  guards: [mockAsyncGuard(true, longestWorkDuration), mockSyncGuard(true)],
                },
              ],
            },
          ];

          TestRenderer.act(() => {
            renderer = TestRenderer.create(
              <MemoryRouter initialEntries={['/']}>
                <RoutesRenderer routes={routes} location={{ pathname: '/child' }} />
              </MemoryRouter>,
            );
          });

          await wait(minimalWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
            </div>
          `);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
              <div>
                Child
              </div>
            </div>
          `);
        });
        it('with 2 guard - true sync first', async () => {
          let renderer: TestRenderer.ReactTestRenderer;

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
                  guards: [mockSyncGuard(true), mockAsyncGuard(true, longestWorkDuration)],
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

          await wait(minimalWorkDuration);

          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
            </div>
          `);

          await wait(longestWorkDuration + mediumWorkDuration);
          expect(renderer.toJSON()).toMatchInlineSnapshot(`
            <div>
              Home 
              <div>
                Child
              </div>
            </div>
          `);
        });
      });
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
            guards: [mockSyncGuard(false), mockGuardWithCounter(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);
        expect(counter.amount).toBe(0);
      });

      it('with 3 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [mockSyncGuard(true), mockSyncGuard(false), mockGuardWithCounter(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);
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
            guards: [mockAsyncGuard(false, longestWorkDuration), mockGuardWithCounter(counter)],
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
        expect(counter.amount).toBe(0);
      });

      it('with 3 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [
              mockAsyncGuard(true, longestWorkDuration),
              mockAsyncGuard(false, longestWorkDuration),
              mockGuardWithCounter(counter),
            ],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(longestWorkDuration * 2 + mediumWorkDuration);
        expect(counter.amount).toBe(0);
      });
    });
  });

  describe('check guard render complicated cases', () => {
    describe('path direct to the child', () => {
      describe('guard on parent only', () => {
        const testDatas = [
          {
            it: 'canActivate true',
            routes: [
              {
                path: '/',
                element: (
                  <div>
                    Home <HelperOutlet />
                  </div>
                ),
                children: [{ path: 'child', element: <div>Child</div> }],
                guards: [mockAsyncGuard(true, longestWorkDuration)],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
            expectedResultBeforeGuardWord: `null`,
            expectedResult: `
              <div>
                Home 
                <div>
                  Child
                </div>
              </div>
            `,
          },
          {
            it: 'canActivate false',
            routes: [
              {
                path: '/',
                element: (
                  <div>
                    Home <HelperOutlet />
                  </div>
                ),
                children: [{ path: 'child', element: <div>Child</div> }],
                guards: [mockAsyncGuard(false, longestWorkDuration)],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
            expectedResultBeforeGuardWord: `null`,
            expectedResult: `null`,
          },
        ];

        test.each(testDatas)('$it', renderTest);
      });

      describe('guard on child only', () => {
        const testDatas = [
          {
            it: 'canActivate true',
            routes: [
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
                    guards: [mockAsyncGuard(true, longestWorkDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
            expectedResultBeforeGuardWord: `
              <div>
                Home 
              </div>
            `,
            expectedResult: `
              <div>
                Home 
                <div>
                  Child
                </div>
              </div>
            `,
          },
          {
            it: 'canActivate false',
            routes: [
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
                    guards: [mockAsyncGuard(false, longestWorkDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
            expectedResultBeforeGuardWord: `
              <div>
                Home 
              </div>
            `,
            expectedResult: `
              <div>
                Home 
              </div>
              `,
          },
        ];

        test.each(testDatas)('$it', renderTest);
      });

      describe('guard on child and parent', () => {
        const testDatas = [
          {
            it: 'canActivate false',
            routes: [
              {
                path: '/',
                element: (
                  <div>
                    Home <HelperOutlet />
                  </div>
                ),
                guards: [mockAsyncGuard(true, longestWorkDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, longestWorkDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: longestWorkDuration * 2 + mediumWorkDuration * 2,
            expectedResultBeforeGuardWord: `null`,
            expectedResult: `
              <div>
                Home 
                <div>
                  Child
                </div>
              </div>
            `,
          },
          {
            it: 'canActivate true with 3 children',
            routes: [
              {
                path: '/',
                element: (
                  <div>
                    Home <HelperOutlet />
                  </div>
                ),
                guards: [mockAsyncGuard(true, longestWorkDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, longestWorkDuration)],
                    element: (
                      <div>
                        Child
                        <HelperOutlet />
                      </div>
                    ),
                    children: [
                      {
                        path: 'child2',
                        guards: [mockAsyncGuard(true, longestWorkDuration)],
                        element: <div>Child 2</div>,
                      },
                    ],
                  },
                ],
              },
            ],
            path: '/child/child2',
            waitTimeBeforeCheck: longestWorkDuration * 3 + mediumWorkDuration * 2,
            expectedResultBeforeGuardWord: `null`,
            expectedResult: `
              <div>
                Home 
                <div>
                  Child
                  <div>
                    Child 2
                  </div>
                </div>
              </div>
            `,
          },
          {
            it: 'canActivate true with 4 children',
            routes: [
              {
                path: '/',
                element: (
                  <div>
                    Home <HelperOutlet />
                  </div>
                ),
                guards: [mockAsyncGuard(true, longestWorkDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, longestWorkDuration)],
                    element: (
                      <div>
                        Child
                        <HelperOutlet />
                      </div>
                    ),
                    children: [
                      {
                        path: 'child2',
                        guards: [mockAsyncGuard(true, longestWorkDuration)],
                        element: (
                          <div>
                            Child 2
                            <HelperOutlet />
                          </div>
                        ),
                        children: [
                          {
                            path: 'child3',
                            guards: [mockAsyncGuard(true, longestWorkDuration)],
                            element: <div>Child 3</div>,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            path: '/child/child2/child3',
            waitTimeBeforeCheck: longestWorkDuration * 4 + mediumWorkDuration * 4,
            expectedResultBeforeGuardWord: `null`,
            expectedResult: `
              <div>
                Home 
                <div>
                  Child
                  <div>
                    Child 2
                    <div>
                      Child 3
                    </div>
                  </div>
                </div>
              </div>
            `,
          },
          {
            it: 'canActivate false',
            routes: [
              {
                path: '/',
                element: (
                  <div>
                    Home <HelperOutlet />
                  </div>
                ),
                guards: [mockAsyncGuard(false, longestWorkDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(false, longestWorkDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
            expectedResultBeforeGuardWord: `null`,
            expectedResult: `null`,
          },
        ];

        test.each(testDatas)('$it', renderTest);
      });
    });
    describe('path direct to the parent', () => {
      const testDatas = [
        {
          it: 'canActivate true',
          routes: [
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
                  guards: [mockAsyncGuard(true, longestWorkDuration)],
                  element: <div>Child</div>,
                },
              ],
              guards: [mockAsyncGuard(true, longestWorkDuration)],
            },
          ],
          path: '/',
          waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
          expectedResultBeforeGuardWord: `null`,
          expectedResult: `
              <div>
                Home 
              </div>
            `,
        },
        {
          it: 'canActivate true',
          routes: [
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
                  guards: [mockAsyncGuard(false, longestWorkDuration)],
                  element: <div>Child</div>,
                },
              ],
              guards: [mockAsyncGuard(false, longestWorkDuration)],
            },
          ],
          path: '/',
          waitTimeBeforeCheck: longestWorkDuration + mediumWorkDuration,
          expectedResultBeforeGuardWord: `null`,
          expectedResult: `null`,
        },
      ];

      test.each(testDatas)('$it', renderTest);
    });

    describe('path to the child, children should render consequentially', () => {
      it('with 4 children', async () => {
        const routes = [
          {
            path: '/',
            element: (
              <div>
                Home <HelperOutlet />
              </div>
            ),
            guards: [mockAsyncGuard(true, longestWorkDuration)],
            children: [
              {
                path: 'child',
                guards: [mockAsyncGuard(true, longestWorkDuration)],
                element: (
                  <div>
                    Child
                    <HelperOutlet />
                  </div>
                ),
                children: [
                  {
                    path: 'child2',
                    guards: [mockAsyncGuard(true, longestWorkDuration)],
                    element: (
                      <div>
                        Child 2
                        <HelperOutlet />
                      </div>
                    ),
                    children: [
                      {
                        path: 'child3',
                        guards: [mockAsyncGuard(true, longestWorkDuration)],
                        element: <div>Child 3</div>,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];
        let renderer: TestRenderer.ReactTestRenderer;

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/child/child2/child3']}>
              <RoutesRenderer routes={routes} location={{ pathname: '/child/child2/child3' }} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

        await wait(longestWorkDuration + mediumWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
          </div>
        `);

        await wait(longestWorkDuration + mediumWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
            <div>
              Child
            </div>
          </div>
         `);

        await wait(longestWorkDuration + mediumWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
              <div>
                Home 
                <div>
                  Child
                  <div>
                    Child 2
                  </div>
                </div>
              </div>
         `);

        await wait(longestWorkDuration + mediumWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
            <div>
              Child
              <div>
                Child 2
                <div>
                  Child 3
                </div>
              </div>
            </div>
          </div>
         `);
      });
    });

    describe('scenario', () => {
      const GeneralLink: FC<{ title: string; link: string }> = ({ title, link }) => {
        const navigate = useNavigate();

        function handleClick() {
          navigate(link);
        }

        return <button onClick={handleClick}>{title}</button>;
      };
      it('with 3 children, check guards to be correctly rendered and should not be rendered twice for parents', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const LinkToFirstChild = () => <GeneralLink link="./child" title="Link to first child" />;

        const LinkToSecondChild = () => <GeneralLink link="./child2" title="Link to second child" />;

        const LinkToThirdChild = () => <GeneralLink link="./child3" title="Link to third child" />;

        const Home = () => {
          return (
            <div>
              <h1>Home test</h1>
              <LinkToFirstChild />
              <HelperOutlet />
            </div>
          );
        };

        const Child = () => (
          <div>
            <h1>Child</h1>
            <LinkToSecondChild />
            <HelperOutlet />
          </div>
        );

        const Child2 = () => (
          <div>
            <h1>Child 2</h1>
            <LinkToThirdChild />
            <HelperOutlet />
          </div>
        );

        const Child3 = () => <div>Child 3</div>;

        const routes = [
          {
            path: '/',
            guards: [mockAsyncGuard(true, longestWorkDuration)],
            element: <Home />,
            children: [
              {
                path: 'child',
                guards: [mockAsyncGuard(true, longestWorkDuration)],
                element: <Child />,
                children: [
                  {
                    path: 'child2',
                    guards: [mockAsyncGuard(true, longestWorkDuration)],
                    element: <Child2 />,
                    children: [
                      {
                        path: 'child3',
                        guards: [mockAsyncGuard(true, longestWorkDuration)],
                        element: <Child3 />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        await TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);

        // Elements should not be rendered immediately after initialization, since the first parent has guard

        expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

        await wait(longestWorkDuration + mediumWorkDuration);

        // As soon as guard for <Home /> has finished his work, we should be able to see the content,
        // but not the child <Child />, because it has guard as well

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
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

        await wait(minimalWorkDuration);

        // Just after click we still shouldn't be able to see <Child /> content, since it has async guard
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
          </div>
        `);

        await wait(longestWorkDuration + mediumWorkDuration);
        // Just after first child guard work we should be able to see the child content and container for
        // the next child but not child itself <Child2 />

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
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
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
            </div>
          </div>
        `);

        await wait(longestWorkDuration + mediumWorkDuration);

        // As soon as guard in <Child2 /> has finished his work,
        // we should be able to see content of component
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2
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
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2
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

        await wait(longestWorkDuration + mediumWorkDuration);

        // As soon as guard in <Child3 /> has finished his work,
        // we should be able to see content of component

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2
                </h1>
                <button
                  onClick={[Function]}
                >
                  Link to third child
                </button>
                <div>
                  Child 3
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
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2
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
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
            </div>
          </div>
        `);

        const linkToSecondChild3 = renderer.root.findByType(LinkToSecondChild);
        act(() => {
          linkToSecondChild3.findByType('button').props.onClick();
        });

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
            </div>
          </div>
        `);

        await wait(longestWorkDuration + mediumWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            <h1>
              Home test
            </h1>
            <button
              onClick={[Function]}
            >
              Link to first child
            </button>
            <div>
              <h1>
                Child
              </h1>
              <button
                onClick={[Function]}
              >
                Link to second child
              </button>
              <div>
                <h1>
                  Child 2
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
      });

      it('quick navigation to different route, next guard should be cancelled', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        const counter = { amount: 0 };

        const LinkToLoginPage = () => <GeneralLink link="/login" title="Link to login page" />;

        const Home = () => {
          return (
            <div>
              <h1>Home test</h1>
              <LinkToLoginPage />
              <HelperOutlet />
            </div>
          );
        };

        const routes: HelperRouteObject[] = [
          {
            element: <div>Login page</div>,
            path: 'login',
          },
          {
            path: '/',
            element: <Home />,
            children: [
              {
                path: 'child',
                element: <div>child</div>,
                guards: [mockAsyncGuard(true, longestWorkDuration), mockGuardWithCounter(counter)],
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

        await wait(longestWorkDuration);

        const linkToLoginPage = renderer.root.findByType(LinkToLoginPage);

        TestRenderer.act(() => {
          linkToLoginPage.findByType('button').props.onClick();
        });

        await wait(longestWorkDuration);
        expect(counter.amount).toBe(0);
      });
    });
  });

  describe('guards have access to standard hook functionality', () => {
    describe('has access to useParams with correct context', () => {
      const guardWithParams = () => {
        const params = useParams<{ id: string }>();
        return () => {
          return params.id == '1234';
        };
      };

      const routes = [
        {
          path: '/home',
          element: (
            <div>
              Home <HelperOutlet />
            </div>
          ),
          children: [
            {
              path: ':id',
              guards: [guardWithParams],
              element: <div>Child</div>,
            },
          ],
        },
      ];

      it('should return rendered page', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home/1234']}>
              <RoutesRenderer routes={routes} location={{ pathname: '/home/1234' }} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
                  <div>
                    Home 
                    <div>
                      Child
                    </div>
                  </div>
              `);
      });

      it('should not return rendered child page, different value in params', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/home/12345']}>
              <RoutesRenderer routes={routes} location={{ pathname: '/home/12345' }} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
          </div>
        `);
      });
    });
  });

  describe('guard throw an exception', () => {
    describe('should just return status failed and not fall down', () => {
      const guardWithException = () => () => {
        throw new Error();
      };

      it('with 1 route', async () => {
        let renderer: TestRenderer.ReactTestRenderer;
        let status: RouteHelperStatus;

        const LoadingComponent = () => {
          const s = useGuardStatus();
          useEffect(() => {
            status = s;
          }, [status]);
          return <></>;
        };

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [guardWithException],
            loadingComponent: <LoadingComponent />,
            // onGuardStatusChange: (s: RouteHelperStatus) => {
            //   status = s;
            // },
          },
        ];

        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(minimalWorkDuration);
        expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
        expect(status).toBe(RouteHelperStatus.Failed);
      });

      it('with nested route', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        let status: RouteHelperStatus;

        const LoadingComponent = () => {
          const s = useGuardStatus();
          useEffect(() => {
            status = s;
          }, [status]);
          return <></>;
        };

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
                loadingComponent: <LoadingComponent />,
                guards: [guardWithException],
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

        await wait(minimalWorkDuration + mediumWorkDuration);
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <div>
            Home 
          </div>
        `);
        expect(status).toBe(RouteHelperStatus.Failed);
      });
    });
  });

  describe('parent route does not have HelperOutlet child guards should not be called', () => {
    describe('second nesting route, different behaviour in test vs real env', () => {
      const counter = { amount: 0 };
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(true, longestWorkDuration)],
          children: [
            {
              path: 'child',
              element: <div>Child</div>,
              guards: [mockGuardWithCounter(counter)],
            },
          ],
        },
      ];

      testIn3DifferentModes({
        afterEach: () => {
          counter.amount = 0;
        },
        routes,
        initialPath: '/child',
        validate: async () => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(counter.amount).toBe(0);
        },
      });
    });
    describe('third nesting route', () => {
      const counter = { amount: 0 };

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: (
            <div>
              Home
              <HelperOutlet />
            </div>
          ),
          children: [
            {
              path: 'child',
              element: <div>Child</div>,
              guards: [mockAsyncGuard(true, longestWorkDuration)],
              children: [
                {
                  path: 'child2',
                  element: <div>Child2</div>,
                  guards: [mockGuardWithCounter(counter)],
                },
              ],
            },
          ],
        },
      ];

      testIn3DifferentModes({
        beforeEach: () => {
          counter.amount = 0;
        },
        routes,
        initialPath: '/child/child2',
        validate: async () => {
          await wait(longestWorkDuration + mediumWorkDuration);

          expect(counter.amount).toBe(0);
        },
      });
    });
  });
});

async function renderTest({ routes, path, waitTimeBeforeCheck, expectedResult, expectedResultBeforeGuardWord }) {
  let renderer: TestRenderer.ReactTestRenderer;

  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <MemoryRouter initialEntries={[path]}>
        <RoutesRenderer routes={routes} location={{ pathname: path }} />
      </MemoryRouter>,
    );
  });

  await wait(minimalWorkDuration);

  expect(renderer.toJSON()).toMatchInlineSnapshot(expectedResultBeforeGuardWord);

  await wait(waitTimeBeforeCheck);

  expect(renderer.toJSON()).toMatchInlineSnapshot(expectedResult);
}
