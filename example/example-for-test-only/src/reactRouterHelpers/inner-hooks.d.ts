import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from './types';
export declare function useManager({ guards, resolvers }: HelperManager): {
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
};
export declare function useStatusNotification(guardsStatusChangeReceiver?: StatusChangeReceiver, resolversStatusChangeReceiver?: StatusChangeReceiver): {
    notifyGuardStatusChange: (status: RouteHelperStatus) => void;
    notifyResolversStatusChange: (status: RouteHelperStatus) => void;
};
