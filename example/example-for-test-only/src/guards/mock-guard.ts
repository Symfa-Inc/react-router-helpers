import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AppDispatch, fetchUserById } from '../store';


export const mockGuard = (canActivate: boolean = true, message: string = "") => () => async () => {
  console.log(message);
  await wait(2000);
  return canActivate;
};

function wait(number = 1000) {
  return new Promise(res => {
    setTimeout(res, number);
  });
}

export const useGetUserInfoResolver = () => {
  const dispatch: AppDispatch = useDispatch();

  return async () => {
    await dispatch(fetchUserById(123));
  };
};

export const useGuardWithParams = () => {
  const test = useParams();
  // dispatch
  // wait


  return () => {
    // throw new Error();

    console.log(test);

    return true;
  };
};
