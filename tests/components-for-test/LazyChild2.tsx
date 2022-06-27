import React from "react";
import { HelperOutlet } from '../../src/route-helper';

const LazyChild2 = () => {
  return <div>Child 2<HelperOutlet/></div>;
};

export default LazyChild2;
