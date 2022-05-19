import { Guard } from '../../../dist';
export declare class MockAsyncGuard implements Guard {
    private can;
    private ms;
    constructor(can: boolean, ms: number);
    canActivate(): Promise<boolean>;
}
