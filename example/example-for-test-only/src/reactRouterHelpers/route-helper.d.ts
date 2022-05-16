/// <reference types="react" />
import { Guard } from "./types";
export declare class RouteHelper {
    private component;
    private guards;
    constructor(component: JSX.Element);
    withResolvers(): void;
    withGuards(guards: Guard[]): void;
    create(): JSX.Element;
}
