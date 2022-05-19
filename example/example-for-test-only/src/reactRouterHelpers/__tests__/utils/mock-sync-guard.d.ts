import { Guard } from '../../../dist';
export declare class MockSyncGuard implements Guard {
    private can;
    constructor(can: boolean);
    canActivate(): boolean;
}
