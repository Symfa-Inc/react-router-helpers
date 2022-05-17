import React from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import { RouteHelper } from './route-helper';
import { HelperRouteObject, OnlyHelperFields, RouteHelperProps } from './types';

const createWrapperRoute = (props: OnlyHelperFields, element: JSX.Element | React.ReactNode) => {
  const helper = new RouteHelper(element);
  if (Array.isArray(props.guards)) {
    helper.withGuards(props.guards);
  }
  return helper.create();
};

const wrapRoutesToHelper = (routes: HelperRouteObject[]): RouteObject[] => {
  return routes.map(({ element, ...others }) => {
    const children = Array.isArray(others.children) ? wrapRoutesToHelper(others.children) : [];
    return {
      ...others,
      element: createWrapperRoute(others, element),
      children,
    };
  });
};

export const RouteHelper2 = (props: RouteHelperProps) => {
  return createWrapperRoute(props, props.element);
};

export const useRoutesWithHelper = (routes: HelperRouteObject[]) => {
  return useRoutes(wrapRoutesToHelper(routes));
};
