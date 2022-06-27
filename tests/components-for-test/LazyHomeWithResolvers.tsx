import React from 'react';
import { Outlet } from 'react-router-dom';
import { useResolver } from '../../src/hooks';
import { HelperOutlet } from '../../src/route-helper';

const LazyHomeWithResolvers = () => {
  const info = useResolver<{ userName: string; permissions: string; }>();

  return (
    <div>
      Home
      {info.userName} - {info.permissions}
      <HelperOutlet/>
    </div>);
};

export default LazyHomeWithResolvers;
