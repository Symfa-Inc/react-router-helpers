export const mockSyncGuard = (canActivate: boolean) => () => () => {
  return canActivate;
};
