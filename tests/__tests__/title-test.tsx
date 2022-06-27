import { expect } from '@jest/globals';
import * as React from 'react';
import { HelperOutlet } from '../../src/route-helper';
import { HelperRouteObject } from '../../src/types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { longestWorkDuration, mediumWorkDuration, minimalWorkDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { wait } from './utils/wait';

describe.skip('title in route', () => {
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

        testIn3DifferentModes({
          routes,
          initialPath: '/',
          validate: async () => {
            await wait(minimalWorkDuration);

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
              element: <div>Home <HelperOutlet/></div>,
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  title: 'Child - Title',
                },
              ],
            },
          ];
          testIn3DifferentModes({
            routes,
            initialPath: '/child',
            validate: async () => {
              await wait(minimalWorkDuration);

              expect(global.window.document.title).toBe('Child - Title');
            },
          });

        });

        describe('should set title, parent has title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home <HelperOutlet/></div>,
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

          testIn3DifferentModes({
            routes,
            initialPath: '/child',
            validate: async () => {
              await wait(minimalWorkDuration);

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
              element: <div>Home <HelperOutlet/></div>,
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  children: [
                    {
                      path: 'child2',
                      element: <div>Child2</div>,
                      title: 'Child2 - Title - Nest',
                    },
                  ],
                },
              ],
            },
          ];

          testIn3DifferentModes({
            routes,
            initialPath: '/child/child2',
            validate: async () => {
              await wait(minimalWorkDuration);

              expect(global.window.document.title).toBe('Child2 - Title - Nest');
            },
          });
        });

        describe('should set title, parent has title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home <HelperOutlet/></div>,
              title: 'Home - Title',
              children: [
                {
                  path: 'child',
                  element: <div>Child <HelperOutlet/></div>,
                  title: 'Child - Title',
                  children: [
                    {
                      path: 'child2',
                      element: <div>Child2</div>,
                      title: 'Child2 - Title - Nest Parent has title',
                    },
                  ],
                },
              ],
            },
          ];

          testIn3DifferentModes({
            routes,
            initialPath: '/child/child2',
            msWaitAfterTests: mediumWorkDuration,
            validate: async () => {
              await wait(mediumWorkDuration);

              expect(global.window.document.title).toBe('Child2 - Title - Nest Parent has title');

              global.window.document.title = '';
            },
          });

        });
      });
    });
  });

  describe('title field should be ignored if titleResolver is passed', () => {
    describe('for parent route', () => {
      describe('should set title from resolver only', () => {
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            title: 'Home - Title',
            titleResolver: () => async () => {
              await wait(mediumWorkDuration);
              return 'Home - Title from resolver';
            },
          },
        ];

        testIn3DifferentModes({
          afterEach: () => {
            global.window.document.title = '';
          },
          routes,
          initialPath: '/',
          validate: async () => {
            await wait(minimalWorkDuration);

            expect(global.window.document.title).toBe('');

            await wait(mediumWorkDuration * 2);

            expect(global.window.document.title).toBe('Home - Title from resolver');
          },
        });
      });

      describe('second nesting layer', () => {
        describe('should set title, parent does not have title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home <HelperOutlet/></div>,
              children: [
                {
                  path: 'child',
                  element: <div>Child</div>,
                  title: 'Child - Title',
                  titleResolver: () => async () => {
                    await wait(mediumWorkDuration);
                    return 'Child - Title from resolver';
                  },
                },
              ],
            },
          ];

          testIn3DifferentModes({
            routes,
            initialPath: '/child',
            validate: async () => {
              global.window.document.title = '';
              await wait(minimalWorkDuration);

              expect(global.window.document.title).toBe('');
              await wait(mediumWorkDuration * 2);

              expect(global.window.document.title).toBe('Child - Title from resolver');
            },
          });

        });

        describe('should set title, parent has title', () => {

          const routes: HelperRouteObject[] = [
            {
              path: '/',
              element: <div>Home <HelperOutlet/></div>,
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

          testIn3DifferentModes({
            routes,
            initialPath: '/child',
            validate: async () => {
              await wait(minimalWorkDuration);

              expect(global.window.document.title).toBe('Child - Title');

              global.window.document.title = '';
            },
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
    describe('for parent route', () => {
      describe('should set title', () => {
        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home</div>,
            title: 'Home - Title',
            guards: [mockAsyncGuard(true, mediumWorkDuration)],
          },
        ];

        testIn3DifferentModes({
          routes,
          initialPath: '/',
          validate: async () => {
            await wait(mediumWorkDuration + minimalWorkDuration);

            expect(global.window.document.title).toBe('Home - Title');

            global.window.document.title = '';
          },
        });
      });
    });

    describe('for nested route', () => {
      describe('should set title', () => {// TODO: REAL FAIL
        afterEach(() => {
          global.window.document.title = '';
        });

        const routes: HelperRouteObject[] = [
          {
            path: '/',
            element: <div>Home <HelperOutlet/></div>,
            guards: [mockAsyncGuard(true, minimalWorkDuration)],
            children: [
              {
                path: 'child',
                element: <div>Child</div>,
                title: 'Child - Title 2',
                guards: [mockAsyncGuard(true, minimalWorkDuration)],
              },
            ],
          },
        ];
        testIn3DifferentModes({
          routes,
          initialPath: '/child',
          afterEach: () => {
            global.window.document.title = '';
          },
          validate: async () => {
            await wait(minimalWorkDuration);
            const titleAfterRender = global.window.document.title;

            await wait(longestWorkDuration);

            expect(titleAfterRender).toBe('Child - Title 2');
          },
        });
      });

    });
  });
  describe('titleResolver must be applied after workers', () => {
    // TODO: Add tests
  });

  describe('parent route does not have Outlet child title should not be set', () => {
    describe('second nesting route', () => {
      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: (
            <div>
              Home
            </div>
          ),
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

      testIn3DifferentModes({
        routes,
        initialPath: '/child',
        msWaitBeforeTests: mediumWorkDuration,
        msWaitAfterTests: mediumWorkDuration,
        validate: async () => {
          await wait(minimalWorkDuration);

          expect(global.window.document.title).toBe('');
        },
      });
    });
    describe('third nesting route', () => {

      const routes: HelperRouteObject[] = [
        {
          path: '/',
          element: (
            <div>
              Home
            </div>
          ),
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

      testIn3DifferentModes({
        routes,
        initialPath: '/child/child2',
        validate: async () => {
          await wait(minimalWorkDuration);

          expect(global.window.document.title).toBe('');
        },
      });

    });
  });
});


function click(anchor: HTMLAnchorElement, eventInit?: MouseEventInit) {
  let event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });
  anchor.dispatchEvent(event);
  return event;
}
