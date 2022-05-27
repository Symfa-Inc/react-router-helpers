import * as React from 'react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import * as TestRenderer from 'react-test-renderer';
import { RouteHelper } from '../route-helper';
import { workerDurationTimeBeforeCheck, workerDuration } from './utils/general-utils';
import { mockAsyncGuard } from './utils/mock-async-guard';
import { wait } from './utils/wait';

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

      await wait(1);
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
                        Home <Outlet />
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
                element={
                  <RouteHelper guards={[mockAsyncGuard(true, workerDuration)]} element={<div>Home</div>} />
                }
              />
            </Routes>
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
                    guards={[mockAsyncGuard(true, workerDuration)]}
                    element={
                      <div>
                        Home <Outlet />
                      </div>
                    }
                  />
                }
              >
                <Route path="child" element={<RouteHelper guards={[mockAsyncGuard(true, workerDuration)]} element={<div>Child</div>} />}></Route>
              </Route>
            </Routes>
          </MemoryRouter>,
        );
      });

      await wait(1);
      expect(renderer.toJSON()).toMatchInlineSnapshot(`null`);

      await wait(workerDuration * 2 + workerDurationTimeBeforeCheck);
    });
  });
});
