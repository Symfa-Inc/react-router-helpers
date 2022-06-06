import React from "react";
import { HelperManager, RouteHelperStatus, OnStatusChange } from "./types";
export declare function useManager({ guards, resolvers, title, titleResolver }: HelperManager): {
    evaluateGuards: (isComponentAliveRef: React.MutableRefObject<boolean>) => Promise<RouteHelperStatus | null>;
    getGuardsStatusBeforeEvaluating: () => RouteHelperStatus;
    evaluateResolvers: () => Promise<{
        status: RouteHelperStatus.Failed;
        infos: {};
    } | {
        infos: {};
        status: RouteHelperStatus.Loaded;
    }>;
    getResolversStatusBeforeEvaluating: () => RouteHelperStatus;
    resolveTitle: (isComponentAliveRef: React.MutableRefObject<boolean>) => Promise<void>;
    setTitle: () => void;
};
export declare function useStatusNotification(guardsStatusChangeReceiver?: OnStatusChange, resolversStatusChangeReceiver?: OnStatusChange): {
    notifyGuardStatusChange: (status: RouteHelperStatus) => void;
    notifyResolversStatusChange: (status: RouteHelperStatus) => void;
};
