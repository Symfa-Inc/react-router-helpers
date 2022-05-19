import { Guard } from '../../../dist';

export class MockSyncGuard implements Guard {
  constructor(private can: boolean) {}

  canActivate(): boolean {
    return this.can;
  }
}
