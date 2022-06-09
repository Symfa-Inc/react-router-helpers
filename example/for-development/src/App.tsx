import React, { useContext, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Outlet, Route, Routes,
  UNSAFE_NavigationContext,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import './App.css';
import { TitleResolverStatus } from '../../../src/types';
import { mockGuard, useGetUserInfoResolver, useGuardWithParams } from './guards/mock-guard';
import { RouteHelperStatus, useResolver, useRoutesWithHelper, HelperOutlet } from './reactRouterHelpers';
import { RouteHelper } from './reactRouterHelpers/index';

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

  const [needToShow, setNeedToShow] = useState(false);

  useEffect(() => {
    // setTimeout(() => {
    //   console.log('SET OUTLET');
    //   setNeedToShow(true);
    // }, 2000);
    // console.log('rendered HOME', resolverInfos);
    // useResolverForHome();
    // manager();
  }, []);
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/1234">Child 2</Link> |{' '}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      {/*{needToShow && <HelperOutlet/>}*/}
      <HelperOutlet/>
    </div>
  );
}

const Lazy = React.lazy(() => import('./LazyComponent'));
const Lazy2 = React.lazy(() => import('./LazyComponent2'));

function Child() {
  // const resolverInfos = useResolver<{ userName: string; lastName: string; }>();

  // useEffect(() => {
  //   // console.log('rendered Child', resolverInfos);
  //
  //   return () => {
  //     console.log('child destroyed');
  //   };
  // }, []);

  return (
    <div>
      <h1>Child </h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/1234">Child 2</Link> |{' '}
        <Link to="./1234">Child 2 relative</Link> |{' '}
        <Link to="/child/child2/child3">Child 3</Link>
        {/*<h2>resolver info: {resolverInfos.lastName}</h2>*/}
      </nav>
      <Outlet/>
    </div>
  );
}

function Child2() {
  // const params = useParams();

  // useEffect(() => {
  //   console.log('params', params);
  // }, []);
  return (
    <div>
      <h1>Child 2</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/child2" id="link-to-second-child">Child 2</Link> |{' '}
        <Link to="child3">Child 3</Link> |{' '}
        <Link to="../54321">Child 2 different link</Link>
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
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/child2">Child 2</Link> |{' '}
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
  // const nav = useNavigate();
  // const navigator = useContext(UNSAFE_NavigationContext).navigator;
  // useEffect(() => {
  //   const listener = ({ location, action }: any) => {
  //     console.log('listener', { location, action });
  //     if (action === 'POP') {
  //       console.log({ location, action });
  //     }
  //   };
  //
  //   const unlisten = (navigator as any).listen(listener);
  //   return unlisten;
  // }, [navigator]);
  return useRoutesWithHelper([
    {
      path: 'login',
      element:<div>Login page</div>
    },
    {
      path: "/",
      element: <Home />,
      // loadElement: () => import('./LazyComponent'),
      title: 'HOME',
      guards: [mockGuard(), mockGuard(true)],
      resolvers: {
        userInfo: useGetUserInfoResolver,
      },
      children: [
        {
          path: "child",
          element: <Child />,
          title: "loading...",
          // titleResolver: () => () => "test",
          // guards: [mockGuard(true, 'CHILD 1 =========================='), mockGuard(true, 'CHILD 2 CHILD 1 ==========================')],
          // titleResolver: () => async () => {
          //   await wait(2000);
          //   return "RESOLVED TITLE";
          // },
          // titleResolver: () => async () => {
          //   await wait(2000);
          //   return 'BUG';
          // },
          // guards: [mockGuard(false)],
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
              title: "2 test title",
              guards: [mockGuard(true, "CHILD GUARD")],
              resolvers: {
                  userInfo: () => () => {
                    console.log('resolver info');
                    return {userName: 'eugene', name: 'eugene', lastName: 'tsarenko'};
                  }
              },
              // titleResolver: () => () => 'title from ',
              titleResolver: () => {
                return async (status: TitleResolverStatus) => {
                  await wait(2000);
                  return "Title from resolver";
                };
              },

              children: [
                {
                  path: "child3",
                  element: <Child3 />,
                  // guards: [mockGuard()],
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
      {/*  /!*<Route*!/*/}
      {/*  /!*  path="/"*!/*/}
      {/*  /!*  element={*!/*/}
      {/*  /!*    <RouteHelper*!/*/}
      {/*  /!*      guards={[mockGuard()]}*!/*/}
      {/*  /!*      load={import('./LazyComponent')}*!/*/}
      {/*  /!*    />*!/*/}
      {/*  /!*  }*!/*/}
      {/*  /!*>*!/*/}
      {/*  /!*  <Route*!/*/}
      {/*  /!*    path="/child"*!/*/}
      {/*  /!*    element={*!/*/}
      {/*  /!*      <RouteHelper*!/*/}
      {/*  /!*        guards={[mockGuard(false)]}*!/*/}
      {/*  /!*        element={*!/*/}
      {/*  /!*          <React.Suspense fallback={<>...</>}>*!/*/}
      {/*  /!*            <Lazy2/>*!/*/}
      {/*  /!*          </React.Suspense>*!/*/}
      {/*  /!*        }/>*!/*/}
      {/*  /!*    }></Route>*!/*/}
      {/*  /!*</Route>*!/*/}
      {/*  /!*  <Route path="/" element={*!/*/}
      {/*  /!*    new RouteHelper(<Home/>)*!/*/}
      {/*  /!*      .withGuards([mockGuard])*!/*/}
      {/*  /!*      .create()*!/*/}
      {/*  /!*  }/>*!/*/}
      {/*  /!*  <Route path="/home2" element={<RouteHelper2 element={<Home />} guards={[mockGuard]} />}/>*!/*/}
      {/*  /!*  /!*<Route path="/" element={<RouteHelper element={<Home />} guards={[mockGuard]} />} />*!/*!/*/}
      {/*</Routes>*/}
    </Router>
  );
}

export default App;
