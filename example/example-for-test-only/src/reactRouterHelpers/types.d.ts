import React from 'react';
import { RouteObject } from 'react-router-dom';
export interface Guard {
    canActivate(): Promise<boolean> | boolean;
    redirectUrl?: string;
}
export interface OnlyHelperFields {
    guards?: Guard[];
    onStatusChange?: (status: RouteHelperStatus) => void;
}
export interface RouteHelperProps extends OnlyHelperFields {
    element: JSX.Element | React.ReactNode;
}
export interface HelperRouteObject extends RouteObject, OnlyHelperFields {
    children?: HelperRouteObject[];
}
export declare enum RouteHelperStatus {
    Initial = 0,
    Loading = 1,
    Loaded = 2,
    Failed = 3
}
export interface HelperManager {
    guards: Guard[];
}
export declare type StatusChangeReceiver = (status: RouteHelperStatus) => void;
