import { workerDuration } from './general-utils';
import { wait } from './wait';

export const mockAsyncResolver = (ms = workerDuration, objToReturn: any = null) => () => async () => {
  await wait(ms);
  return objToReturn;
};
