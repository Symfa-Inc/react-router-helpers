import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { mockGuard, useGetUserInfoResolver } from './guards/mock-guard';
import { RouteHelperStatus, useRoutesWithHelper } from './reactRouterHelpers';
import { HelperOutlet, useGuardStatus, useResolverStatus } from './reactRouterHelpers/index';

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

// function Another() {
//   useEffect(() => {
//     console.log('Another inited');
//     return () => {
//       console.log('Another uninited');
//     };
//   }, []);
//   return <>Hello</>
// }

function Home() {

  const [needToShow, setNeedToShow] = useState(false);

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log('SET OUTLET');
  //     setNeedToShow(true);
  //   }, 2000);
  //   // console.log('rendered HOME', resolverInfos);
  //   // useResolverForHome();
  //   // manager();
  // }, []);
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/1234">Child 2</Link> |{' '}
        <Link to="/child/child2/child3">Child 3</Link>
        <HelperOutlet />
      </nav>
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
      {/*<HelperOutlet />*/}
    </div>
  );
}

function Child2() {
  const params = useParams();

  useEffect(() => {
    console.log('params', params);
  }, []);
  return (
    <div>
      <h1>Child 2</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/child2" id="link-to-second-child">Child 2</Link> |{' '}
        <Link to="child3">Child 3</Link> |{' '}
        <Link to="../54321">Child 2 different link</Link>
        <Link to="/child/child2/child3/child33">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}

function Child3() {
  const params = useParams();

  useEffect(() => {
    console.log('params child 3', params);
  }, []);

  useEffect(() => {
    console.log('update child 3', params);
  }, [params]);
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
  const LoadingComponent = () => {
    const guardStatus = useGuardStatus();
    const resolverStatus = useResolverStatus();
    // const navigate = useNavigate();
    // const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
      console.log('INITED');
      return () => {
        console.log('UNINITED');
        // dispatch(fetchUserById(1));
      };
    }, []);

    useEffect(() => {
      console.log('GUARD CHANGED ' + RouteHelperStatus[guardStatus]);
      // if (guardStatus === RouteHelperStatus.Failed) {
      //   navigate('/login');
      // }
    }, [guardStatus]);

    useEffect(() => {
      console.log('RESOLVER CHANGED ' + RouteHelperStatus[resolverStatus]);
    }, [resolverStatus]);
    // // const [isLoading, setLoading] = useState(false);
    //
    // useEffect(() => {
    //   setTimeout(() => setLoading(true), 200);
    // }, []);
    return <></>;
  };
  return useRoutesWithHelper([
    {
      path: 'login',
      element:<div>Login page</div>
    },
    {
      path: "/",
      element: <Home />,
      loadingComponent: <LoadingComponent />,
      // loadElement: () => import('./LazyComponent'),
      title: 'HOME',
      // guards: [mockGuard(), mockGuard()],
      resolvers: {
        userInfo: useGetUserInfoResolver,
      },
      children: [
        {
          path: "child",
          element: <Child />,
          loadingComponent: <LoadingComponent />,
          title: "loading...",
          // titleResolver: () => () => "test",
          guards: [mockGuard(true, 'CHILD 1 =========================='), mockGuard()],
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
              guards: [mockGuard(true, 'CHILD 1 ==========================')],
              title: "2 test title",
              // guards: [mockGuard(true, "CHILD GUARD")],
              // resolvers: {
              //     userInfo: () => () => {
              //       console.log('resolver info');
              //       return {userName: 'eugene', name: 'eugene', lastName: 'tsarenko'};
              //     }
              // },
              // titleResolver: () => () => 'title from ',
              // titleResolver: () => {
              //   return async (status: TitleResolverStatus) => {
              //     await wait(2000);
              //     return "Title from resolver";
              //   };
              // },

              children: [
                {
                  path: "child3/child33",
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
