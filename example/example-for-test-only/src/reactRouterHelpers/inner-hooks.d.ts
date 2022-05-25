import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from './types';
export declare function useManager({ guards, resolvers }: HelperManager): {
    evaluateGuards: () => Promise<RouteHelperStatus>;
    getStatusBeforeEvaluating: () => RouteHelperStatus;
    evaluateResolvers: () => Promise<{}>;
};
export declare function useStatusNotification(receiver?: StatusChangeReceiver): {
    notify: (status: RouteHelperStatus) => void;
};
