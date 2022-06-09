import React from 'react';
import { BrowserRouter as Router, Link, Outlet } from 'react-router-dom';
import { useRoutesWithHelper } from './reactRouterHelpers';
import { HelperOutlet } from './reactRouterHelpers/index';


function Home() {
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/child" id="link-to-first-child">Child</Link> |{" "}
        <Link to="/child/1234" id="absolute-link-to-second-child">Child 2</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <HelperOutlet />
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
        <Link to="./child2" id="relative-link-to-second-child">Child 2 R</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <HelperOutlet/>
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
  return useRoutesWithHelper([
    {
      path: "/",
      element: <Home />,
      title: 'Home - Title',
      children: [
        {
          path: "child",
          element: <Child />,
          title: "Child1 - Title",
          children: [
            {
              path: ":id",
              element: <Child2 />,
              title: "Child2 - Title",
              children: [
                {
                  path: "child3",
                  element: <Child3 />,
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
    </Router>
  );
}

export default App;
