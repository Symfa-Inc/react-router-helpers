import { HelperManager, Status } from './types';
export declare function useManager({ guards }: HelperManager): {
    evaluateGuards: () => Promise<Status>;
    getStatusBeforeEvaluating: () => Status;
};
declare type Fn = (status: Status) => void;
export declare const useLoadingNotification: (element: any, fn: Fn) => void;
export {};
