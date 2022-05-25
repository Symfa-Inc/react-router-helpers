import React, { useEffect } from 'react';
import { BrowserRouter as Router, Link, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import { mockGuard } from './guards/mock-guard';
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
        <Link to="/child">Child</Link> |{" "}
        <Link to="/child/child2">Child 2</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

function Child() {
  return (
    <div>
      <h1>Child </h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/child">Child</Link> |{" "}
        <Link to="/child/child2">Child 2</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

function Child2() {
  return (
    <div>
      <h1>Child 2</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/child">Child</Link> |{" "}
        <Link to="/child/child2">Child 2</Link> |{" "}
        <Link to="child3">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

function Child3() {

  return (
    <div>
      <h1>Child 3</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/child">Child</Link> |{" "}
        <Link to="/child/child2">Child 2</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

const RoutesWrapper = () => {
  const nav = useNavigate();

  return useRoutesWithHelper([
    {
      path: "/",
      element: <Home />,
      guards: [mockGuard()],
      // onStatusChange: (status: Status) => {
      //   console.log("status", Status[status]);
      // },
      children: [
        {
          path: "child",
          element: <Child />,

          guards: [mockGuard()],
          children: [
            {
              path: "child2",
              element: <Child2 />,
              guards: [mockGuard()],
              children: [
                {
                  path: "child3",
                  element: <Child3 />,
                  guards: [mockGuard()],
                  onStatusChange: (status: RouteHelperStatus) => {
                    // if (status === RouteHelperStatus.Failed) {
                    //   nav('/login', { replace: true });
                    // }
                  },
                }
              ]
            }
          ]
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
      {/*      .withGuards([mockGuard])*/}
      {/*      .create()*/}
      {/*  }/>*/}
      {/*  <Route path="/home2" element={<RouteHelper2 element={<Home />} guards={[mockGuard]} />}/>*/}
      {/*  /!*<Route path="/" element={<RouteHelper element={<Home />} guards={[mockGuard]} />} />*!/*/}
      {/*</Routes>*/}
    </Router>
  );
}

export default App;
