import { Guard } from '../../../dist';
export declare class MockShouldNeverBeCalledGuard implements Guard {
    private counter;
    constructor(counter: {
        amount: number;
    });
    canActivate(): Promise<boolean>;
}
