import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from './types';
export declare function useManager({ guards }: HelperManager): {
    evaluateGuards: () => Promise<RouteHelperStatus>;
    getStatusBeforeEvaluating: () => RouteHelperStatus;
};
export declare function useStatusNotification(receiver?: StatusChangeReceiver): {
    notify: (status: RouteHelperStatus) => void;
};
