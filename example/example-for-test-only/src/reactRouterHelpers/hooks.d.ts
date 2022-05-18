import { HelperManager, Status, StatusChangeReceiver } from './types';
export declare function useManager({ guards }: HelperManager): {
    evaluateGuards: () => Promise<Status>;
    getStatusBeforeEvaluating: () => Status;
};
export declare function useStatusNotification(receiver?: StatusChangeReceiver): {
    notify: (status: Status) => void;
};
declare type Fn = (status: Status) => void;
export declare const useLoadingNotification: (element: any, fn: Fn) => void;
export {};
