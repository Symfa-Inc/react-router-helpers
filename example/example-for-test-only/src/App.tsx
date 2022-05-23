import React, { useEffect } from 'react';
import { BrowserRouter as Router, Link, Outlet, useNavigate, useRoutes } from 'react-router-dom';
import './App.css';
import { MockGuard } from './guards/MockGuard';
import { RouteHelperStatus, useRoutesWithHelper } from './reactRouterHelpers';

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
  // useLoadingNotification(Home, (status: RouteHelperStatus) => {
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
//
// function canActivate() {
//   return true;
// }
// const RoutesWrapper = () => {
//   // const nav = useNavigate();
//
//   return useRoutes([
//     {
//       path: "/",
//       element: <Home />,
//       // guards: [new MockGuard()],
//       // onStatusChange: (status: RouteHelperStatus) => {
//       //   console.log("status", RouteHelperStatus[status]);
//       // },
//       children: [
//         {
//           path: "home22",
//           element: <Home2 />,
//           // onStatusChange: (status: RouteHelperStatus) => {
//           //   console.log("status 2", RouteHelperStatus[status]);
//           // },
//           // guards: [new MockGuard()]
//           // children: [
//           //   {
//           //     path: "nested2",
//           //     element: <Home />
//           //   }
//           // ]
//         }
//       ]
//     },
//   ]);
// };

function App() {


  return (
    <Home />
  );
}

export default App;
