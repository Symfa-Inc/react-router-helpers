import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject } from '../../../src/types';
import { RoutesRenderer } from './RoutesRenderer';
import { wait } from './wait';

export function testIn3DifferentModes(options: RenderInModesOptions) {
  const hasValidateFunction = typeof options.validate === 'function';
  const hasTestEnvValidateFunction = typeof options.validateResultInTestEnv === 'function';
  const hasRealEnvValidateFunction = typeof options.validateResultInRealEnv === 'function';

  const waitTimeBeforeRunTests = options.msWaitBeforeTests ?? 0;
  const waitTimeAfterRunTests = options.msWaitAfterTests ?? 0;

  const tests = [];
  const needToRunTest = options.needToRunInTest ?? true;
  if ((hasValidateFunction || hasTestEnvValidateFunction) && needToRunTest) {
    tests.push({
      name: 'test mode',
      fn: async () => {
        await wait(waitTimeBeforeRunTests);
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

        renderer.unmount();
        await wait(waitTimeAfterRunTests);
      },
    });
  }

  const needToRunInDev = options.needToRunInDev ?? true;
  if ((hasValidateFunction || hasRealEnvValidateFunction) && needToRunInDev) {
    tests.push({
      name: 'real dev mode',
      fn: async () => {
        await wait(waitTimeBeforeRunTests * 2);
        const rootNode = document.createElement('div') as HTMLElement;
        const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);

        await TestRenderer.act(() => {
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

        rootToMount.unmount();
        await wait(waitTimeAfterRunTests * 2);
      },
    });
  }

  const needToRunInProd = options.needToRunInProd ?? true;
  if ((hasValidateFunction || hasRealEnvValidateFunction) && needToRunInProd) {
    tests.push({
      name: 'real prod mode',
      fn: async () => {
        await wait(waitTimeBeforeRunTests);
        const rootNode = document.createElement('div') as HTMLElement;
        const rootToMount = ReactDOM.createRoot(rootNode as HTMLElement);

        await TestRenderer.act(() => {
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

        rootToMount.unmount();
        await wait(waitTimeAfterRunTests);

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

  return test.each(tests)('$name', async (t: any) => {
    console.log('RUN ' + t.name);
    const r =  await t.fn();
    console.log('AFTER ' + t.name);
    return r;
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
  needToRunInProd?: boolean;
  needToRunInDev?: boolean;
  needToRunInTest?: boolean;
  msWaitBeforeTests?: number;
  msWaitAfterTests?: number;
}
