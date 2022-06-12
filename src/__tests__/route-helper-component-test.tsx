import * as React from 'react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { HelperOutlet, RouteHelper } from '../route-helper';
import { mediumWorkDuration, longestWorkDuration, minimalWorkDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { wait } from './utils/wait';
import { expect } from '@jest/globals';

describe('route helper component', () => {
  describe('without extra functionality', () => {
    it('should render route', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<RouteHelper element={<div>Home</div>} />} />
            </Routes>
          </MemoryRouter>,
        );
      });

      await wait(mediumWorkDuration + minimalWorkDuration);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
              <div>
                Home
              </div>
          `);
    });

    it('should render route nested route', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/child']}>
            <Routes>
              <Route
                path="/"
                element={
                  <RouteHelper
                    element={
                      <div>
                        Home <HelperOutlet />
                      </div>
                    }
                  />
                }
              >
                <Route path="child" element={<RouteHelper element={<div>Child</div>} />}></Route>
              </Route>
            </Routes>
          </MemoryRouter>,
        );
      });

      await wait(mediumWorkDuration);
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

  describe('with guard', () => {
    it('should render route', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route
                path="/"
                element={<RouteHelper guards={[mockAsyncGuard(true, longestWorkDuration)]} element={<div>Home</div>} />}
              />
            </Routes>
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration + mediumWorkDuration);

      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <div>
          Home
        </div>
      `);
    });

    it('should render route nested route', async () => {
      let renderer: TestRenderer.ReactTestRenderer;

      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={['/child']}>
            <Routes>
              <Route
                path="/"
                element={
                  <RouteHelper
                    guards={[mockAsyncGuard(true, longestWorkDuration)]}
                    element={
                      <div>
                        Home <Outlet />
                      </div>
                    }
                  />
                }
              >
                <Route
                  path="child"
                  element={<RouteHelper guards={[mockAsyncGuard(true, longestWorkDuration)]} element={<div>Child</div>} />}
                ></Route>
              </Route>
            </Routes>
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(longestWorkDuration * 2 + mediumWorkDuration);
    });
  });
});
