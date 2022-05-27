import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Link, MemoryRouter, Outlet, useParams } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject, RouteHelperStatus } from '../types';
import { workerDurationTimeBeforeCheck, workerDuration } from './utils/guard-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { mockShouldNeverBeCalledGuard } from './utils/mock-should-never-be-called-guard';
import { mockSyncGuard } from './utils/mock-sync-guard';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

function click(anchor: HTMLAnchorElement, eventInit?: MouseEventInit) {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });
  anchor.dispatchEvent(event);
  return event;
}

describe('Guards in route', () => {
  describe('with async guards', () => {
    it('with 1 guard which return true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(true, workerDuration)],
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
          guards: [mockAsyncGuard(false, workerDuration)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which return true - first true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(true, workerDuration)],
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
          guards: [mockAsyncGuard(false, workerDuration), mockAsyncGuard(false, workerDuration)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which first guard true - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(true, workerDuration), mockAsyncGuard(false, workerDuration)],
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

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guard which first guard false - second true', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockAsyncGuard(false, workerDuration), mockAsyncGuard(true, workerDuration)],
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

      await wait(1);

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

      await wait(1);

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

      await wait(1);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);
    });

    it('with 2 guards which first guard false - second false', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: <div>Home</div>,
          guards: [mockSyncGuard(false, workerDuration), mockSyncGuard(false, workerDuration)],
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
            guards: [mockSyncGuard(false), mockShouldNeverBeCalledGuard(counter)],
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
            guards: [mockSyncGuard(true), mockSyncGuard(false), mockShouldNeverBeCalledGuard(counter)],
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
            guards: [mockAsyncGuard(false, workerDuration), mockShouldNeverBeCalledGuard(counter)],
          },
        ];

        TestRenderer.act(() => {
          TestRenderer.create(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
          );
        });

        await wait(workerDuration + workerDurationTimeBeforeCheck);
        expect(counter.amount).toBe(0);
      });

      it('with 3 guards', async () => {
        const counter = { amount: 0 };
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [
              mockAsyncGuard(true, workerDuration),
              mockAsyncGuard(false, workerDuration),
              mockShouldNeverBeCalledGuard(counter),
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

        await wait(workerDuration * 2 + workerDurationTimeBeforeCheck);
        expect(counter.amount).toBe(0);
      });
    });
  });

  describe('check guard render', () => {
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
                    Home <Outlet />
                  </div>
                ),
                children: [{ path: 'child', element: <div>Child</div> }],
                guards: [mockAsyncGuard(true, workerDuration)],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                    Home <Outlet />
                  </div>
                ),
                children: [{ path: 'child', element: <div>Child</div> }],
                guards: [mockAsyncGuard(false, workerDuration)],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                    Home <Outlet />
                  </div>
                ),
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, workerDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                    Home <Outlet />
                  </div>
                ),
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(false, workerDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                    Home <Outlet />
                  </div>
                ),
                guards: [mockAsyncGuard(true, workerDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, workerDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: workerDuration * 2 + workerDurationTimeBeforeCheck,
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
                    Home <Outlet />
                  </div>
                ),
                guards: [mockAsyncGuard(true, workerDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, workerDuration)],
                    element: (
                      <div>
                        Child
                        <Outlet />
                      </div>
                    ),
                    children: [
                      {
                        path: 'child2',
                        guards: [mockAsyncGuard(true, workerDuration)],
                        element: <div>Child 2</div>,
                      },
                    ],
                  },
                ],
              },
            ],
            path: '/child/child2',
            waitTimeBeforeCheck: workerDuration * 3 + workerDurationTimeBeforeCheck,
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
                    Home <Outlet />
                  </div>
                ),
                guards: [mockAsyncGuard(true, workerDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(true, workerDuration)],
                    element: (
                      <div>
                        Child
                        <Outlet />
                      </div>
                    ),
                    children: [
                      {
                        path: 'child2',
                        guards: [mockAsyncGuard(true, workerDuration)],
                        element: (
                          <div>
                            Child 2
                            <Outlet />
                          </div>
                        ),
                        children: [
                          {
                            path: 'child3',
                            guards: [mockAsyncGuard(true, workerDuration)],
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
            waitTimeBeforeCheck: workerDuration * 4 + workerDurationTimeBeforeCheck * 4,
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
                    Home <Outlet />
                  </div>
                ),
                guards: [mockAsyncGuard(false, workerDuration)],
                children: [
                  {
                    path: 'child',
                    guards: [mockAsyncGuard(false, workerDuration)],
                    element: <div>Child</div>,
                  },
                ],
              },
            ],
            path: '/child',
            waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                  Home <Outlet />
                </div>
              ),
              children: [
                {
                  path: 'child',
                  guards: [mockAsyncGuard(true, workerDuration)],
                  element: <div>Child</div>,
                },
              ],
              guards: [mockAsyncGuard(true, workerDuration)],
            },
          ],
          path: '/',
          waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                  Home <Outlet />
                </div>
              ),
              children: [
                {
                  path: 'child',
                  guards: [mockAsyncGuard(false, workerDuration)],
                  element: <div>Child</div>,
                },
              ],
              guards: [mockAsyncGuard(false, workerDuration)],
            },
          ],
          path: '/',
          waitTimeBeforeCheck: workerDuration + workerDurationTimeBeforeCheck,
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
                Home <Outlet />
              </div>
            ),
            guards: [mockAsyncGuard(true, workerDuration)],
            children: [
              {
                path: 'child',
                guards: [mockAsyncGuard(true, workerDuration)],
                element: (
                  <div>
                    Child
                    <Outlet />
                  </div>
                ),
                children: [
                  {
                    path: 'child2',
                    guards: [mockAsyncGuard(true, workerDuration)],
                    element: (
                      <div>
                        Child 2
                        <Outlet />
                      </div>
                    ),
                    children: [
                      {
                        path: 'child3',
                        guards: [mockAsyncGuard(true, workerDuration)],
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

        await wait(1);

        expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

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
            </div>
          </div>
         `);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

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

        await wait(workerDuration + workerDurationTimeBeforeCheck);

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

    describe('with dynamic path', () => {
      let node: HTMLDivElement;
      beforeEach(() => {
        node = document.createElement('div');
        document.body.appendChild(node);
      });

      afterEach(() => {
        document.body.removeChild(node);
        node = null!;
      });

      it('with 3 children, check guards to be correctly rendered and should not be rendered twice for parents', async () => {
        const Home = () => (
          <div>
            <h1>Home test</h1>
            <Link to="child" id="link-to-first-child">
              Child
            </Link>
            <div id="parent-outlet">
              <Outlet />
            </div>
          </div>
        );

        const Child = () => (
          <div>
            <h1>Child</h1>
            <Link to="child2" id="link-to-second-child">
              Child2
            </Link>
            <div id="first-child-outlet">
              <Outlet />
            </div>
          </div>
        );

        const Child2 = () => (
          <div>
            <h1>Child 2</h1>
            <Link to="child3" id="link-to-third-child">
              Child3
            </Link>
            <div id="second-child-outlet">
              <Outlet />
            </div>
          </div>
        );

        const Child3 = () => <div id="third-child-content">Child 3</div>;

        const routes = [
          {
            path: '/',
            guards: [mockAsyncGuard(true, workerDuration)],
            element: <Home />,
            children: [
              {
                path: 'child',
                guards: [mockAsyncGuard(true, workerDuration)],
                element: <Child />,
                children: [
                  {
                    path: 'child2',
                    guards: [mockAsyncGuard(true, workerDuration)],
                    element: <Child2 />,
                    children: [
                      {
                        path: 'child3',
                        guards: [mockAsyncGuard(true, workerDuration)],
                        element: <Child3 />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        act(() => {
          ReactDOM.render(
            <MemoryRouter initialEntries={['/']}>
              <RoutesRenderer routes={routes} />
            </MemoryRouter>,
            node,
          );
        });

        await wait(1);

        // Elements should not be rendered immediately after initialization, since the first parent has guard
        let parentOutlet = node.querySelector('#parent-outlet');
        expect(parentOutlet).toBeNull();

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        // As soon as guard for <Home /> has finished his work, we should be able to see the content,
        // but not the child <Child />, because it has guard as well
        parentOutlet = node.querySelector('#parent-outlet');
        expect(parentOutlet).not.toBeNull();
        expect(parentOutlet!.children.length).toBe(0);

        let linkToFirstChild = node.querySelector('#link-to-first-child');
        expect(linkToFirstChild).not.toBeNull();

        let event: MouseEvent;
        act(() => {
          event = click(linkToFirstChild);
        });

        expect(event!.defaultPrevented).toBe(true);
        await wait(1);

        // Just after click we still shouldn't be able to see <Child /> content, since it has async guard
        parentOutlet = node.querySelector('#parent-outlet');
        expect(parentOutlet!.children.length).toBe(0);

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        // Just after first child guard work we should be able to see the child content and container for
        // the next child but not child itself <Child2 />
        parentOutlet = node.querySelector('#parent-outlet');
        let linkToSecondChild = node.querySelector('#link-to-second-child');
        let firstChildOutlet = node.querySelector('#first-child-outlet');

        expect(parentOutlet!.children.length).toBe(1);
        expect(linkToSecondChild).not.toBeNull();
        expect(firstChildOutlet).not.toBeNull();
        expect(firstChildOutlet!.children.length).toBe(0);

        let event2: MouseEvent;
        act(() => {
          event2 = click(linkToSecondChild);
        });

        expect(event2.defaultPrevented).toBe(true);

        firstChildOutlet = node.querySelector('#first-child-outlet');
        linkToSecondChild = node.querySelector('#link-to-second-child');

        // Just after click we should not see the content of <Child2 />, because of guards
        // but we still should be able to see already loaded content <Home />, <Child />
        expect(firstChildOutlet).not.toBeNull();
        expect(firstChildOutlet!.children.length).toBe(0);
        expect(linkToSecondChild).not.toBeNull();

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        firstChildOutlet = node.querySelector('#first-child-outlet');
        let linkToThirdChild = node.querySelector('#link-to-third-child');

        // As soon as guard in <Child2 /> has finished his work,
        // we should be able to see content of component
        expect(firstChildOutlet).not.toBeNull();
        expect(firstChildOutlet!.children.length).toBe(1);
        expect(linkToThirdChild).not.toBeNull();

        // let linkToThirdChild = node.querySelector('#link-to-third-child');
        let event3: MouseEvent;
        act(() => {
          event3 = click(linkToThirdChild);
        });

        expect(event3.defaultPrevented).toBe(true);

        // Just after click we should not see the content of <Child3 />, because of guards
        // but we still should be able to see already loaded content <Home />, <Child />, <Child2 />
        let thirdChildContent = node.querySelector('#third-child-content');
        linkToThirdChild = node.querySelector('#link-to-third-child');

        expect(linkToThirdChild).not.toBeNull();
        expect(thirdChildContent).toBeNull();

        await wait(workerDuration + workerDurationTimeBeforeCheck);

        // As soon as guard in <Child3 /> has finished his work,
        // we should be able to see content of component
        thirdChildContent = node.querySelector('#third-child-content');
        linkToThirdChild = node.querySelector('#link-to-third-child');

        expect(linkToThirdChild).not.toBeNull();
        expect(thirdChildContent).not.toBeNull();

        expect(thirdChildContent.innerHTML).toMatch('Child 3');

        // check reverse link clicking to the parent

        linkToSecondChild = node.querySelector('#link-to-second-child');
        expect(linkToSecondChild).not.toBeNull();

        // Click back to the previous child link <Child2 />
        let event4: MouseEvent;
        act(() => {
          event4 = click(linkToSecondChild);
        });

        expect(event4.defaultPrevented).toBe(true);

        // Just after click, we should be able to see <Child2 /> and <Child3 /> should disappear
        thirdChildContent = node.querySelector('#third-child-content');
        linkToThirdChild = node.querySelector('#link-to-third-child');

        expect(linkToThirdChild).not.toBeNull();
        expect(thirdChildContent).toBeNull();

        linkToFirstChild = node.querySelector('#link-to-first-child');

        expect(linkToFirstChild).not.toBeNull();
        expect(firstChildOutlet).not.toBeNull();

        let event5: MouseEvent;
        act(() => {
          event5 = click(linkToFirstChild);
        });

        expect(event5.defaultPrevented).toBe(true);

        parentOutlet = node.querySelector('#parent-outlet');
        firstChildOutlet = node.querySelector('#first-child-outlet');

        expect(firstChildOutlet).not.toBeNull();
        expect(firstChildOutlet!.children.length).toBe(0);
        expect(parentOutlet!.children.length).toBe(1);
      });
    });
  });

  describe('guards has access to standard hook functionality', () => {
    describe('has access to useParamsWithContext', () => {
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
              Home <Outlet />
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

        await wait(1);

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

        await wait(1);

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
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            guards: [guardWithException],
            onGuardsStatusChange: (s: RouteHelperStatus) => {
              status = s;
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
        expect(status).toBe(RouteHelperStatus.Failed);
      });

      it('with nested route', async () => {
        let renderer: TestRenderer.ReactTestRenderer;

        let status: RouteHelperStatus;
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
                guards: [guardWithException],
                onGuardsStatusChange: (s: RouteHelperStatus) => {
                  status = s;
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
        expect(status).toBe(RouteHelperStatus.Failed);
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

  await wait(1);

  expect(renderer.toJSON()).toMatchInlineSnapshot(expectedResultBeforeGuardWord);

  await wait(waitTimeBeforeCheck);

  expect(renderer.toJSON()).toMatchInlineSnapshot(expectedResult);
}
