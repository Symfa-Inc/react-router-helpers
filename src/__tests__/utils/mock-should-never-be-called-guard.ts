import { Guard } from '../../../dist';

export class MockShouldNeverBeCalledGuard implements Guard {
  constructor(private counter: { amount: number }) {}
  async canActivate(): Promise<boolean> {
    this.counter.amount += 1;
    return true;
  }
}
