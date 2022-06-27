export const mockSyncResolver = (objToReturn: any = null) => () => () => {
  return objToReturn;
};
