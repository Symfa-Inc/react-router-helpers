import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useResolver } from '../../src/hooks';
import { HelperOutlet } from '../../src/route-helper';

const LazyHomeWithAnError = () => {
  const info = useResolver<{ userName: string; permissions: string; }>();

  useEffect(() => {
    throw new Error('ooops');
  }, []);
  return (
    <div>
      Home
      {info.userName} - {info.permissions}
      <HelperOutlet/>
    </div>);
};

export default LazyHomeWithAnError;
