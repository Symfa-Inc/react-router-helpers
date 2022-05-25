import { RouteObject } from 'react-router-dom';

export type Guard = () => Promise<boolean> | boolean;

export type Resolver = () => Promise<any> | Promise<void> | any | void;

export interface OnlyHelperFields {
  guards?: Guard[];
  resolvers?: Record<string, Resolver>;
  onStatusChange?: (status: RouteHelperStatus) => void;
}

export interface HelperRouteObject extends RouteObject, OnlyHelperFields {
  children?: HelperRouteObject[];
}
export type HelperRouteObjectProps = Omit<HelperRouteObject, 'path'>;

export enum RouteHelperStatus {
  Initial,
  Loading,
  Loaded,
  Failed,
}

export interface HelperManager {
  resolvers: Record<string, Resolver>;
  guards: Guard[];
  // pathname: string;
  // redirectUrl?: string;
}

export type StatusChangeReceiver = (status: RouteHelperStatus) => void;
