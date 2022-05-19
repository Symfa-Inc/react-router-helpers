import { Guard } from '../../../dist';
import { wait } from './wait';

export class MockAsyncGuard implements Guard {
  constructor(private can: boolean, private ms: number) {}

  async canActivate(): Promise<boolean> {
    await wait(this.ms);
    return this.can;
  }
}
