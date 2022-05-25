import { wait } from './wait';

export const mockAsyncGuard = (canActivate: boolean, ms: number) => async () => {
  await wait(ms);
  return canActivate;
};
