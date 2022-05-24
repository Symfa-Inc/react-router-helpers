import { Guard } from "../reactRouterHelpers";


export class MockGuard implements Guard {
  constructor(private can: boolean = true) {
  }
  async canActivate(): Promise<boolean> {
    await this.wait(2000);
    return this.can;
  }

  private wait(number = 1000) {
    return new Promise(res => {
      setTimeout(res, number);
    })
  }
}

export const hasPermission = () => {
  return false;
};
