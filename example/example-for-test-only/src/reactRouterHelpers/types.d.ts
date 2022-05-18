import React from 'react';
import { RouteObject } from 'react-router-dom';
export interface Guard {
    canActivate(): Promise<boolean> | boolean;
    redirectUrl?: string;
}
export interface OnlyHelperFields {
    guards?: Guard[];
    statusChanged?: (status: Status) => void;
}
export interface RouteHelperProps extends OnlyHelperFields {
    element: JSX.Element | React.ReactNode;
}
export interface HelperRouteObject extends RouteObject, OnlyHelperFields {
    children?: HelperRouteObject[];
}
export declare enum Status {
    Initial = 0,
    Loading = 1,
    Loaded = 2,
    Failed = 3
}
export interface HelperManager {
    guards: Guard[];
}
export declare type StatusChangeReceiver = (status: Status) => void;
