import React, { useEffect } from 'react';
import { BrowserRouter as Router, Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { mockGuard, useGuardWithParams } from './guards/mock-guard';
import { RouteHelperStatus, useResolver, useRoutesWithHelper } from './reactRouterHelpers';

// const useResolverForHome = () => {
//   const test = useParams();
//
//   return () => {
//     console.log(test);
//   };
// };

// const useManager = (hook: any) => {
//   return () => {
//     const result = hook();
//
//   };
// };

function Home() {
  // console.log('render 11');
  const resolverInfos = useResolver<{ test: string; }>();
  // const manager = useResolverForHome();
  // useGuardWithParams();


  // useEffect(() => {
  //   console.log('rendered HOME', resolverInfos);
  //   // useResolverForHome();
  //   // manager();
  // }, []);
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/child">Child</Link> |{" "}
        <Link to="/child/1234">Child 2</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

function Child() {
  const resolverInfos = useResolver<{ userName: string; lastName: string; }>();

  // useEffect(() => {
  //   console.log('rendered Child', resolverInfos);
  // }, []);

  return (
    <div>
      <h1>Child </h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/child">Child</Link> |{" "}
        <Link to="/child/1234">Child 2</Link> |{" "}
        <Link to="/child/child2/child3">Child 3</Link>
        <h2>resolver info: {resolverInfos.lastName}</h2>
      </nav>
      <Outlet/>
    </div>
  );
}

function Child2() {
  const params = useParams();

  // useEffect(() => {
  //   console.log('params', params);
  // }, []);
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

function wait(number = 1000) {
  return new Promise(res => {
    setTimeout(res, number);
  });
}

const RoutesWrapper = () => {
  const nav = useNavigate();

  return useRoutesWithHelper([
    {
      path: "/",
      element: <Home />,

      // guards: [mockGuard()],
      // resolvers: {
      //   test: useResolverForHome
      // },
      onGuardsStatusChange: (status: RouteHelperStatus) => {
        console.log("onGuardsStatusChange", RouteHelperStatus[status]);
      },
      onResolversStatusChange: (status: RouteHelperStatus) => {
        console.log("onResolversStatusChange", RouteHelperStatus[status]);
      },
      children: [
        {
          path: "child",
          element: <Child />,

          // guards: [mockGuard()],
          // resolvers: {
          //   'userInfo': () => {
          //     return {userName: 'eugene', name: 'eugene', lastName: 'tsarenko'}
          //   }
          // },
          children: [
            {
              path: ":id",
              element: <Child2 />,
              guards: [useGuardWithParams],
              children: [
                {
                  path: "child3",
                  element: <Child3 />,
                  // guards: [mockGuard()],
                  onGuardsStatusChange: (status: RouteHelperStatus) => {
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
