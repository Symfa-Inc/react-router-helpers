import { Guard } from "../reactRouterHelpers";


export class MockGuard implements Guard {
  canActivate(): Promise<boolean> | boolean {
    return false;
  }

}
