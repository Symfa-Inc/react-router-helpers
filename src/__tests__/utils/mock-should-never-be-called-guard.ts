export const mockShouldNeverBeCalledGuard = (counter: { amount: number }) => () => () => {
  counter.amount += 1;
  return true;
};
