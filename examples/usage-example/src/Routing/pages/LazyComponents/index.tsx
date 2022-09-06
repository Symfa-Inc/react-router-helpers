import { useEffect } from 'react';
import bigFile from './big-file.json';

function LazyComponentsPage() {
  useEffect(() => {
    // const test = bigFile.find((i: any) => i._id === 1);
    // if (test) {console.log(test);}
    console.log(Array.isArray(bigFile));
  }, []);
  return <>Lazy components page</>;
};

export default LazyComponentsPage;
