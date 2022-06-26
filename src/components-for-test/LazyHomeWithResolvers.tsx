import React from 'react';
import { Outlet } from 'react-router-dom';
import { useResolver } from '../hooks';
import { HelperOutlet } from '../route-helper';

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
