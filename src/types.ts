import { RouteObject } from 'react-router-dom';

export type Guard = () => () => Promise<boolean> | boolean;
export type InnerGuard = () => Promise<boolean> | boolean;

export type Resolver = () => () => Promise<any> | Promise<void> | any | void;
export type InnerResolver = () => Promise<any> | Promise<void> | any | void;

export type TitleResolver = () => () => Promise<string> | string;
export type InnerTitleResolver = () => Promise<string> | string;

export interface OnlyHelperFields {
  guards?: Guard[];
  resolvers?: Record<string, Resolver>;
  onGuardStatusChange?: (status: RouteHelperStatus) => void;
  onResolverStatusChange?: (status: RouteHelperStatus) => void;
  title?: string;
  titleResolver?: TitleResolver;
  loadingTitle?: string;
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
  resolvers: Record<string, InnerResolver>;
  guards: InnerGuard[];
  title?: string;
  loadingTitle?: string;
  titleResolver: InnerTitleResolver | null;
}

export type StatusChangeReceiver = (status: RouteHelperStatus) => void;
