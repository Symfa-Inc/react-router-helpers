/// <reference types="react" />
import { HelperRouteObject } from '../../types';
export declare function RoutesRenderer({ routes, location, }: {
    routes: HelperRouteObject[];
    location?: Partial<Location> & {
        pathname: string;
    };
}): import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | null;
