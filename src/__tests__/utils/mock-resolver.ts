import { workerDuration } from './general-utils';
import { wait } from './wait';

export const mockResolver = (ms = workerDuration, objToReturn: any = null) => () => async () => {
  await wait(ms);
  return objToReturn;
};
