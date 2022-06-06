import { RouteObject } from 'react-router-dom';
export declare type Guard = () => () => Promise<boolean> | boolean;
export declare type InnerGuard = () => Promise<boolean> | boolean;
export declare type Resolver = () => () => Promise<any> | Promise<void> | any | void;
export declare type InnerResolver = () => Promise<any> | Promise<void> | any | void;
export declare type TitleResolver = () => () => Promise<string> | string;
export declare type InnerTitleResolver = () => Promise<string> | string;
export declare type OnStatusChange = (status: RouteHelperStatus) => void;
export interface OnlyHelperFields {
    guards?: Guard[];
    resolvers?: Record<string, Resolver>;
    onGuardStatusChange?: OnStatusChange;
    onResolverStatusChange?: OnStatusChange;
    title?: string;
    titleResolver?: TitleResolver;
    loadingTitle?: string;
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
    title?: string;
    loadingTitle?: string;
    titleResolver: InnerTitleResolver | null;
}
