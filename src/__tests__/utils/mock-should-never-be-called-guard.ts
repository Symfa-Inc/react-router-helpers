import { Guard } from '../../../dist';

export class MockShouldNeverBeCalledGuard implements Guard {
  async canActivate(): Promise<boolean> {
    throw new Error();
  }
}
