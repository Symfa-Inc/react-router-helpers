import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperRouteObject } from '../../types';
import { RoutesRenderer } from './RoutesRenderer';

export async function testIn3DifferentModes(options: RenderInModesOptions) {

  afterEach(() => {
    if (typeof options.afterEach === 'function') {
      options.afterEach();
    }
  });

  const hasValidateFunction = typeof options.validate === 'function';
  const hasTestEnvValidateFunction = typeof options.validateResultInTestEnv === 'function';
  const hasRealEnvValidateFunction = typeof options.validateResultInRealEnv === 'function';

  if (hasValidateFunction || hasTestEnvValidateFunction) {
    it('render in test mode', async () => {
      let renderer: TestRenderer.ReactTestRenderer;
      act(() => {
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
    });
  }

  if (hasValidateFunction || hasRealEnvValidateFunction) {
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

      if (hasValidateFunction) {
        await options.validate!();
      }
      if (hasRealEnvValidateFunction) {
        await options.validateResultInRealEnv!(rootNode);
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
      if (hasValidateFunction) {
        await options.validate!();
      }
      if (hasRealEnvValidateFunction) {
        await options.validateResultInRealEnv!(rootNode);
      }
    });
  }
}

interface RenderInModesOptions {
  routes: HelperRouteObject[],
  initialPath: string,
  validate?: () => void;
  validateResultInTestEnv?: (renderer: TestRenderer.ReactTestRenderer) => void;
  validateResultInRealEnv?: (root: HTMLElement) => void;
  afterEach?: () => void;
}
