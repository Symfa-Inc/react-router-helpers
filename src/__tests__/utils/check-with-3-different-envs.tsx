import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject } from '../../types';
import { RoutesRenderer } from './RoutesRenderer';
import { wait } from './wait';

// export async function testIn3DifferentModes(options: RenderInModesOptions) {
//
//   afterEach(() => {
//     if (typeof options.afterEach === 'function') {
//       options.afterEach();
//     }
//   });
//
//   const hasValidateFunction = typeof options.validate === 'function';
//   const hasTestEnvValidateFunction = typeof options.validateResultInTestEnv === 'function';
//   const hasRealEnvValidateFunction = typeof options.validateResultInRealEnv === 'function';
//
//   if (hasValidateFunction || hasTestEnvValidateFunction) {
//     it('render in test mode', async () => {
//       await wait(10);
//       let renderer: TestRenderer.ReactTestRenderer;
//       act(() => {
//         renderer = TestRenderer.create(
//           <MemoryRouter initialEntries={[options.initialPath]}>
//             <RoutesRenderer routes={options.routes} location={{ pathname: options.initialPath }} />
//           </MemoryRouter>,
//         );
//       });
//
//       if (hasValidateFunction) {
//         await options.validate!();
//       }
//       if (hasTestEnvValidateFunction) {
//         await options.validateResultInTestEnv!(renderer!);
//       }
//
//       await wait(10);
//     });
//   }
//
//   // if (hasValidateFunction || hasRealEnvValidateFunction) {
//   //   it('render in real dev mode', async () => {
//   //     await wait(200);
//   //     const rootNode = document.createElement('div') as HTMLElement;
//   //     const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);
//   //
//   //     act(() => {
//   //       rootToMount.render(
//   //         <React.StrictMode>
//   //           <MemoryRouter initialEntries={[options.initialPath]} key="1234">
//   //             <RoutesRenderer routes={options.routes} />
//   //           </MemoryRouter>,
//   //         </React.StrictMode>,
//   //       );
//   //     });
//   //
//   //     if (hasValidateFunction) {
//   //       await options.validate!();
//   //     }
//   //     if (hasRealEnvValidateFunction) {
//   //       await options.validateResultInRealEnv!(rootNode);
//   //     }
//   //   });
//   //
//   //   // it('render in real production mode', async () => {
//   //   //   await wait(2000);
//   //   //   const rootNode = document.createElement('div') as HTMLElement;
//   //   //   const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);
//   //   //
//   //   //   act(() => {
//   //   //     rootToMount.render(
//   //   //       <MemoryRouter initialEntries={[options.initialPath]} key="123">
//   //   //         <RoutesRenderer routes={options.routes} location={{ pathname: options.initialPath }} />
//   //   //       </MemoryRouter>,
//   //   //     );
//   //   //   });
//   //   //   if (hasValidateFunction) {
//   //   //     await options.validate!();
//   //   //   }
//   //   //   if (hasRealEnvValidateFunction) {
//   //   //     await options.validateResultInRealEnv!(rootNode);
//   //   //   }
//   //   // });
//   // }
// }

export async function testIn3DifferentModes(options: RenderInModesOptions) {
  const hasValidateFunction = typeof options.validate === 'function';
  const hasTestEnvValidateFunction = typeof options.validateResultInTestEnv === 'function';
  const hasRealEnvValidateFunction = typeof options.validateResultInRealEnv === 'function';

  const tests = [];
  if (hasValidateFunction || hasTestEnvValidateFunction) {
    tests.push({
      name: 'test mode',
      fn: async () => {
        let renderer: TestRenderer.ReactTestRenderer;
        await TestRenderer.act(async () => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={[options.initialPath]}>
              <RoutesRenderer routes={options.routes} />
            </MemoryRouter>,
          );
        });


        if (hasValidateFunction) {
          await options.validate!();
        }
        if (hasTestEnvValidateFunction) {
          await options.validateResultInTestEnv!(renderer!);
        }
      },
    });
  }

  if ((hasValidateFunction || hasRealEnvValidateFunction) && options.isOnlyRealDevEnv) {
    tests.push({
      name: 'real dev mode',
      fn: async () => {
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

        if (hasValidateFunction) {
          await options.validate!();
        }
        if (hasRealEnvValidateFunction) {
          await options.validateResultInRealEnv!(rootNode);
        }
      },
    });
  }

  if ((hasValidateFunction || hasRealEnvValidateFunction) && options.isOnlyRealProdEnv) {
    tests.push({
      name: 'real prod mode',
      fn: async () => {
        const rootNode = document.createElement('div') as HTMLElement;
        const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);

        act(() => {
          rootToMount.render(
            <MemoryRouter initialEntries={[options.initialPath]}>
              <RoutesRenderer routes={options.routes}  />
            </MemoryRouter>,
          );
        });
        if (hasValidateFunction) {
          await options.validate!();
        }
        if (hasRealEnvValidateFunction) {
          await options.validateResultInRealEnv!(rootNode);
        }
      },
    });
  }

  beforeEach(async () => {
    if (typeof options.beforeEach === "function") {
      await options.beforeEach();
    }
  });

  afterEach(async () => {
    if (typeof options.afterEach === "function") {
      await options.afterEach();
    }
  });

  test.each(tests)('$name', async (t: any) => {
    await wait(100);
    const result = await t.fn();

    return result;
  });
}

interface RenderInModesOptions {
  routes: HelperRouteObject[];
  initialPath: string;
  validate?: () => void;
  validateResultInTestEnv?: (renderer: TestRenderer.ReactTestRenderer) => void;
  validateResultInRealEnv?: (root: HTMLElement) => void;
  afterEach?: () => void;
  beforeEach?: () => void;
  isOnlyRealProdEnv?: boolean;
  isOnlyRealDevEnv?: boolean;
}
