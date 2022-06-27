import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelperOutlet } from './reactRouterHelpers';
import bigFile from './big-file.json';

function LazyComponent() {

  useEffect(() => {
    const test = bigFile.find((i: any) => i._id === 1);
    if (test) {console.log(test);}
  }, []);
  return (
    <div>
      <h1>Lazy child 2</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/1234">Child 2</Link> |{' '}
        <Link to="./1234">Child 2 relative</Link> |{' '}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <HelperOutlet />
    </div>
  );
}
export default LazyComponent;
