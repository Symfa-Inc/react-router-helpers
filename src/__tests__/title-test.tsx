import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { BrowserRouter, MemoryRouter, Outlet } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject } from '../types';
import { GeneralLink } from './utils/GeneralLink';
import { RoutesRenderer } from './utils/RoutesRenderer';
import { wait } from './utils/wait';

describe('title in route', () => {
  describe('title field only', () => {
    describe('for parent route', () => {
      describe('should set title', () => {
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            title: 'Home - Title',
          },
        ];

        checkIn3DifferentModes({
          routes,
          initialPath: '/',
          validate: async () => {
            await wait(1);

            expect(global.window.document.title).toBe('Home - Title');
          },
        });
      });
    });

    describe('for nested child route', () => {
      describe('second nesting layer', () => {
        describe('should set title, parent does not have title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  title: 'Child - Title',
                },
              ],
            },
          ];
          checkIn3DifferentModes({
            routes,
            initialPath: '/child',
            validate: async () => {
              await wait(1);

              expect(global.window.document.title).toBe('Child - Title');
            },
          });

        });

        describe('should set title, parent has title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              title: 'Home - Title',
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  title: 'Child - Title',
                },
              ],
            },
          ];

          checkIn3DifferentModes({
            routes,
            initialPath: '/child',
            validate: async () => {
              await wait(1);

              expect(global.window.document.title).toBe('Child - Title');
            },
          });

        });

      });


      describe('third nesting layer', () => {
        describe('should set title, parent does not have title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  children: [
                    {
                      path: 'child2',
                      element: <div>Child2</div>,
                      title: 'Child2 - Title',
                    },
                  ],
                },
              ],
            },
          ];

          checkIn3DifferentModes({
            routes,
            initialPath: '/child/child2',
            validate: async () => {
              await wait(1);

              expect(global.window.document.title).toBe('Child2 - Title');
            },
          });
        });

        describe('should set title, parent has title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home</div>,
              title: 'Home - Title',
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  title: 'Child - Title',
                  children: [
                    {
                      path: 'child2',
                      element: <div>Child2</div>,
                      title: 'Child2 - Title',
                    },
                  ],
                },
              ],
            },
          ];

          checkIn3DifferentModes({
            routes,
            initialPath: '/child/child2',
            validate: async () => {
              await wait(1);

              expect(global.window.document.title).toBe('Child2 - Title');
            },
          });

        });

        describe('click to the same link again with absolute path', () => {
          const LinkToSecondChild = () => <GeneralLink replace={true} id="link-to-second-child" link="/"  />;

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>
                Home
                <LinkToSecondChild />
                <Outlet />
              </div>,
              title: 'Home - Title',
              children: [
                {
                  path: 'child',
                  element: <div>
                    Child
                    <Outlet />
                  </div>,
                  title: 'Child - Title',
                  children: [
                    {
                      path: ':id',
                      element: <div>Child2</div>,
                      title: 'Child2 - Title',
                    },
                  ],
                },
              ],
            },
          ];

          checkIn3DifferentModes({
            routes,
            initialPath: '/child/1234',
            validateInTestEnvResult: async (renderer) => {
              await wait(1);
              expect(global.window.document.title).toBe('Child2 - Title');

              const linkToFirstChild = renderer.root.findByType(LinkToSecondChild);

              TestRenderer.act(() => {
                linkToFirstChild.findByType('button').props.onClick();
              });

              await wait(1);
              expect(global.window.document.title).toBe('Child2 - Title');
            },
            validateInRealEnvResult: async (root) => {
              await wait(1);
              expect(global.window.document.title).toBe('Child2 - Title');

              await wait(1);

              const linkToFirstChild = root.querySelector('#link-to-second-child');
              expect(linkToFirstChild).not.toBeNull();

              let event: MouseEvent;
              act(() => {
                event = click(linkToFirstChild);
              });

              expect(event.defaultPrevented).toBe(false);

              await wait(1);
              expect(global.window.document.title).toBe('Child2 - Title');
            }
          });
        });
      });
    });
  });
  describe('titleResolver only', () => {
    // TODO: Add tests
  });
  describe('mixed', () => {
    // TODO: Add tests
  });


  describe('title must be applied before workers', () => {
    // TODO: Add tests
  });
  describe('titleResolver must be applied after workers', () => {
    // TODO: Add tests
  });
});

async function checkIn3DifferentModes(options: RenderInModesOptions) {
  it('render in test mode', async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={[options.initialPath]}>
          <RoutesRenderer routes={options.routes} />
        </MemoryRouter>,
      );
    });

    if (typeof options.validate === 'function') {
      await options.validate();
    }
    if (typeof options.validateInTestEnvResult === 'function') {
      await options.validateInTestEnvResult(renderer!);
    }
  });

  it('render in real dev mode', async () => {
    const rootNode = document.createElement('div') as HTMLElement;
    const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);

    act(() => {
      rootToMount.render(
        <React.StrictMode>
          <MemoryRouter initialEntries={[options.initialPath]}>
            <RoutesRenderer routes={options.routes} />
          </MemoryRouter>,
        </React.StrictMode>,
      );
    });

    if (typeof options.validate === 'function') {
      await options.validate();
    }
    if (typeof options.validateInRealEnvResult === 'function') {
      await options.validateInRealEnvResult(rootNode);
    }
  });

  it('render in real production mode', async () => {
    const rootNode = document.createElement('div') as HTMLElement;
    const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);

    act(() => {
      rootToMount.render(
        <MemoryRouter initialEntries={[options.initialPath]}>
          <RoutesRenderer routes={options.routes} />
        </MemoryRouter>,
      );
    });
    if (typeof options.validate === 'function') {
      await options.validate();
    }
    if (typeof options.validateInRealEnvResult === 'function') {
      await options.validateInRealEnvResult(rootNode);
    }
  });
}

interface RenderInModesOptions {
  routes: HelperRouteObject[],
  initialPath: string,
  validate?: () => void;
  validateInTestEnvResult?: (renderer: TestRenderer.ReactTestRenderer) => void;
  validateInRealEnvResult?: (root: HTMLElement) => void;
}


function click(anchor: HTMLAnchorElement, eventInit?: MouseEventInit) {
  let event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });
  anchor.dispatchEvent(event);
  return event;
}
