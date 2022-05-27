import { wait } from './wait';

export const mockResolver = (ms = 2000, objToReturn: any = null) => () => async () => {
  await wait(ms);
  return objToReturn;
};
