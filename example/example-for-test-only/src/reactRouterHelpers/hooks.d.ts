import { Guard } from "./types";
interface HelperManager {
    guards: Guard[];
}
export declare enum Status {
    Initial = 0,
    Loading = 1,
    Loaded = 2,
    Failed = 3
}
export declare function useManager({ guards }: HelperManager): {
    evaluateGuards: () => Promise<Status>;
};
export {};
