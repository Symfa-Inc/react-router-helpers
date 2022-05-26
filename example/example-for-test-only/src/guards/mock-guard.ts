import { useParams } from 'react-router-dom';


export const mockGuard = (canActivate: boolean = true) => async () => {
  await wait(2000);
  return canActivate;
};

function wait(number = 1000) {
  return new Promise(res => {
    setTimeout(res, number);
  });
}

export const useGuardWithParams = () => {
  const test = useParams();

  return () => {
    // throw new Error();

    console.log(test);

    return true;
  };
};
