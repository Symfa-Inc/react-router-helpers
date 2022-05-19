import React from 'react';
import { RouteObject } from 'react-router-dom';

export interface Guard {
  canActivate(): Promise<boolean> | boolean;

  redirectUrl?: string;
}

export interface OnlyHelperFields {
  guards?: Guard[];
  onStatusChange?: (status: Status) => void;
}

export interface RouteHelperProps extends OnlyHelperFields {
  element: JSX.Element | React.ReactNode;
}

export interface HelperRouteObject extends RouteObject, OnlyHelperFields {
  children?: HelperRouteObject[];
}

export enum Status {
  Initial,
  Loading,
  Loaded,
  Failed,
}

export interface HelperManager {
  // resolvers: PropsResolvers;
  guards: Guard[];
  // pathname: string;
  // redirectUrl?: string;
}

export type StatusChangeReceiver = (status: Status) => void;
