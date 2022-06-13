export const mockGuardWithCounter = (counter: { amount: number }) => () => () => {
  counter.amount += 1;
  return true;
};
