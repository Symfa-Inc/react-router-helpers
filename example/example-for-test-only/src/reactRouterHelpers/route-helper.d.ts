import React from 'react';
import { Guard } from './types';
export declare class RouteHelper {
    private element;
    private guards;
    constructor(element: JSX.Element | React.ReactNode);
    withGuards(guards: Guard[]): RouteHelper;
    private notifyStatusChange;
    create(): JSX.Element;
}
