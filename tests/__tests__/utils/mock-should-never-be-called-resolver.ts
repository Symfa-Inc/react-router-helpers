export const mockShouldNeverBeCalledResolver = (counter: { amount: number }) => () => () => {
  counter.amount += 1;
  return true;
};
