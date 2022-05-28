import { RouteObject } from 'react-router-dom';
export declare type Guard = () => () => Promise<boolean> | boolean;
export declare type InnerGuard = () => Promise<boolean> | boolean;
export declare type Resolver = () => () => Promise<any> | Promise<void> | any | void;
export declare type InnerResolver = () => Promise<any> | Promise<void> | any | void;
export interface OnlyHelperFields {
    guards?: Guard[];
    resolvers?: Record<string, Resolver>;
    onGuardStatusChange?: (status: RouteHelperStatus) => void;
    onResolverStatusChange?: (status: RouteHelperStatus) => void;
}
export interface HelperRouteObject extends RouteObject, OnlyHelperFields {
    children?: HelperRouteObject[];
}
export declare type HelperRouteObjectProps = Omit<HelperRouteObject, 'path'>;
export declare enum RouteHelperStatus {
    Initial = 0,
    Loading = 1,
    Loaded = 2,
    Failed = 3
}
export interface HelperManager {
    resolvers: Record<string, InnerResolver>;
    guards: InnerGuard[];
}
export declare type StatusChangeReceiver = (status: RouteHelperStatus) => void;
