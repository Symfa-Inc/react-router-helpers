import React from "react";
import { Outlet } from 'react-router-dom';
import { HelperOutlet } from '../route-helper';

const LazyHomeWithOutlet = () => {
  return <div>Home<Outlet/></div>;
};

export default LazyHomeWithOutlet;
