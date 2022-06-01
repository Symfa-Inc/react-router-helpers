import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from "./types";
export declare function useManager({ guards, resolvers, title, titleResolver }: HelperManager): {
    evaluateGuards: () => Promise<RouteHelperStatus>;
    getGuardsStatusBeforeEvaluating: () => RouteHelperStatus;
    evaluateResolvers: () => Promise<{
        status: RouteHelperStatus.Failed;
        infos: {};
    } | {
        infos: {};
        status: RouteHelperStatus.Loaded;
    }>;
    getResolversStatusBeforeEvaluating: () => RouteHelperStatus;
    resolveTitle: () => Promise<void>;
};
export declare function useStatusNotification(guardsStatusChangeReceiver?: StatusChangeReceiver, resolversStatusChangeReceiver?: StatusChangeReceiver): {
    notifyGuardStatusChange: (status: RouteHelperStatus) => void;
    notifyResolversStatusChange: (status: RouteHelperStatus) => void;
};
