import { Guard } from '../../../dist';
export declare class MockShouldNeverBeCalledGuard implements Guard {
    canActivate(): Promise<boolean>;
}
