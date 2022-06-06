import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject } from '../types';
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

        checkIn3DifferentModes(routes, '/', async () => {
          await wait(1);

          expect(global.window.document.title).toBe('Home - Title');
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
          checkIn3DifferentModes(routes, '/child', async () => {
            await wait(1);

            expect(global.window.document.title).toBe('Child - Title');
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

          checkIn3DifferentModes(routes, '/child', async () => {
            await wait(1);

            expect(global.window.document.title).toBe('Child - Title');
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

          checkIn3DifferentModes(routes, '/child/child2', async () => {
            await wait(1);

            expect(global.window.document.title).toBe('Child2 - Title');
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

          checkIn3DifferentModes(routes, '/child/child2', async () => {
            await wait(1);

            expect(global.window.document.title).toBe('Child2 - Title');
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

async function checkIn3DifferentModes(routes: HelperRouteObject[], initialPath: string, validateTestResults: () => void) {
  it('render in test mode', async () => {
    act(() => {
      TestRenderer.create(
        <MemoryRouter initialEntries={[initialPath]}>
          <RoutesRenderer routes={routes}/>
        </MemoryRouter>,
      );
    });

    await validateTestResults();
  });

  it('render in real dev mode', async () => {
    const rootToMount = ReactDOM.createRoot(
      document.createElement('div') as HTMLElement,
    );

    act(() => {
      rootToMount.render(
        <React.StrictMode>
          <MemoryRouter initialEntries={[initialPath]}>
            <RoutesRenderer routes={routes}/>
          </MemoryRouter>
        </React.StrictMode>,
      );
    });

    await validateTestResults();
  });

  it('render in real production mode', async () => {
    const rootToMount = ReactDOM.createRoot(
      document.createElement('div') as HTMLElement,
    );

    act(() => {
      rootToMount.render(
        <MemoryRouter initialEntries={[initialPath]}>
          <RoutesRenderer routes={routes}/>
        </MemoryRouter>,
      );
    });

    await validateTestResults();
  });
}
