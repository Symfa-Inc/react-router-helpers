import React from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import { wrapRouteToHelper } from './route-helper';
import { HelperRouteObject } from './types';

const wrapRoutesToHelper = (routes: HelperRouteObject[]): RouteObject[] => {
  return routes.map(props => {
    const children = Array.isArray(props.children) ? wrapRoutesToHelper(props.children) : [];
    return {
      ...props,
      element: wrapRouteToHelper(props),
      children,
    };
  });
};

export const useRoutesWithHelper = (routes: HelperRouteObject[]) => {
  return useRoutes(wrapRoutesToHelper(routes));
};
