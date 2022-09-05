import { Guard } from '../../reactRouterHelpers';

const wait = () => new Promise(res => setTimeout(res, 2000));

export const isAdminGuard: Guard = () => async () => {
  const isAdminRaw = localStorage.getItem('isAdmin');
  await wait();

  return isAdminRaw !== null;
};
