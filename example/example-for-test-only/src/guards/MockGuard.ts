import { Guard } from "../reactRouterHelpers";


export class MockGuard implements Guard {
  async canActivate(): Promise<boolean> {
    await this.wait(2000);
    return true;
  }

  private wait(number = 1000) {
    return new Promise(res => {
      setTimeout(res, number);
    })
  }
}
