import React, { useEffect } from 'react';
import { BrowserRouter as Router, Link, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import { MockGuard } from './guards/MockGuard';
import { Status, useRoutesWithHelper } from './reactRouterHelpers';

function Home() {
  console.log('render 11');


  useEffect(() => {
    console.log('rendered HOME');
  }, []);
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/home22">Home 22</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

function Home2() {
  // useLoadingNotification(Home, (status: Status) => {
  //   console.log(status);
  // });
  useEffect(() => {
    console.log('rendered HOME2');
  }, []);


  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/home22">Home 22</Link>
      </nav>
    </div>
  );
}

// Home.testFunction = () => {
//   console.log('hello from testFunction');
// };

const RoutesWrapper = () => {
  const nav = useNavigate();
  return useRoutesWithHelper([
    {
      path: "/",
      element: <Home />,
      // guards: [new MockGuard()],
      statusChanged: (status: Status) => {
        console.log("status", Status[status]);
      },
      children: [
        {
          path: "home22",
          element: <Home2 />,
          statusChanged: (status: Status) => {
            console.log("status 2", Status[status]);
          },
          guards: [new MockGuard()]
          // children: [
          //   {
          //     path: "nested2",
          //     element: <Home />
          //   }
          // ]
        }
      ]
    },
  ]);
};

function App() {


  return (
    <Router>
      <RoutesWrapper />
      {/*<Routes>*/}
      {/*  <Route path="/" element={*/}
      {/*    new RouteHelper(<Home/>)*/}
      {/*      .withGuards([new MockGuard()])*/}
      {/*      .create()*/}
      {/*  }/>*/}
      {/*  <Route path="/home2" element={<RouteHelper2 element={<Home />} guards={[new MockGuard()]} />}/>*/}
      {/*  /!*<Route path="/" element={<RouteHelper element={<Home />} guards={[new MockGuard()]} />} />*!/*/}
      {/*</Routes>*/}
    </Router>
  );
}

export default App;
