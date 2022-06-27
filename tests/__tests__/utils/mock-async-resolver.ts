import { longestWorkDuration } from './general-utils';
import { wait } from './wait';

export const mockAsyncResolver = (ms = longestWorkDuration, objToReturn: any = null) => () => async () => {
  await wait(ms);
  return objToReturn;
};
