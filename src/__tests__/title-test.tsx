import * as React from 'react';
import { HelperRouteObject } from '../types';
import { testIn3DifferentModes } from './utils/check-with-3-different-envs';
import { workerDuration, workerDurationTimeBeforeCheck } from './utils/general-utils';
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

        testIn3DifferentModes({
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
          testIn3DifferentModes({
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

          testIn3DifferentModes({
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

          testIn3DifferentModes({
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

          testIn3DifferentModes({
            routes,
            initialPath: '/child/child2',
            validate: async () => {
              await wait(1);

              expect(global.window.document.title).toBe('Child2 - Title');
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
    // TODO: Add tests
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
          title: "Home - Title",
          children: [
            {
              path: 'child',
              element: <div>Child</div>,
              title: "Child - Title"
            },
          ],
        },
      ];

      testIn3DifferentModes({
        routes,
        initialPath: '/child',
        validate: async () => {
          await wait(1);

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
          title: "Home - Title",
          children: [
            {
              path: 'child',
              element: <div>Child</div>,
              title: "Child - Title",
              children: [
                {
                  path: 'child2',
                  element: <div>Child2</div>,
                  title: "Child2 - Title",
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
          await wait(workerDuration + workerDurationTimeBeforeCheck);

          expect(global.window.document.title).toBe('');
        },
      });

    });
  });
});



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
