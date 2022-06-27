import React from "react";
import { HelperOutlet } from '../../src/route-helper';

const LazyChild1 = () => {
  return <div>Child<HelperOutlet/></div>;
};

export default LazyChild1;
