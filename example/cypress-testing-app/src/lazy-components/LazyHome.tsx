import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelperOutlet } from '../reactRouterHelpers';
import bigFile from './big-file.json';

function LazyHome() {

  useEffect(() => {
    const test = bigFile.find((i: any) => i._id === 1);
    if (test) {
      console.log(test);
    }
  }, []);
  return (
    <div>
      <h2>LAZY</h2>
      <h2>{Date.now()}</h2>
      <Link to="/">Home</Link> |{' '}
      <Link to="/login">Login</Link> |{' '}
      <Link to="/child">Child</Link> |{' '}
      <Link to="/child/1234">Child 2</Link> |{' '}
      <Link to="/child/child2/child3">Child 3</Link>
      <div>
        <HelperOutlet/>
      </div>
    </div>
  );
}

export default LazyHome;
