import React, { FC, lazy, useContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Link, Outlet } from 'react-router-dom';
import {
  RouteHelperStatus,
  useGuardStatus,
  useLazyComponentStatus,
  useResolverStatus,
  useRoutesWithHelper,
} from './reactRouterHelpers';
import { HelperOutlet } from './reactRouterHelpers';

const LazyHome = lazy(() => import('./lazy-components/LazyHome'));
const LazyChild = lazy(() => import('./lazy-components/LazyChild'));

const wait = (ms: number) => {
  return new Promise(res => setTimeout(res, ms));
};

export const mockGuard = (canActivate: boolean, ms: number) => () => async () => {
  await wait(ms);
  return canActivate;
};

export const mockResolver = (ms: number, objToReturn: any = null) => () => async () => {
  await wait(ms);
  return objToReturn;
};


function Home() {
  return (
    <div>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/child" id="link-to-first-child">Child</Link> |{' '}
        <Link to="/child/1234" id="absolute-link-to-second-child">Child 2</Link> |{' '}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <HelperOutlet/>
    </div>
  );
}

function Child() {
  return (
    <div>
      <h1>Child </h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="./child2" id="relative-link-to-second-child">Child 2 R</Link> |{' '}
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
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/child2">Child 2</Link> |{' '}
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
        <Link to="/">Home</Link> |{' '}
        <Link to="/child">Child</Link> |{' '}
        <Link to="/child/child2">Child 2</Link> |{' '}
        <Link to="/child/child2/child3">Child 3</Link>
      </nav>
      <Outlet/>
    </div>
  );
}


interface ContextForTests {
  setGuardStatuses: (status: RouteHelperStatus) => void;
  setResolverStatuses: (status: RouteHelperStatus) => void;
  setLazyLoadingStatuses: (status: RouteHelperStatus) => void;
  incrementCounter: () => void;
}

const TestContext = React.createContext<ContextForTests>({
  setGuardStatuses: (_) => {
  },
  setResolverStatuses: (_) => {
  },
  setLazyLoadingStatuses: (_) => {
  },
  incrementCounter: () => {
  },
});


const LoadingComponent: FC<{ prefix?: string; }> = ({ prefix = '' }) => {
  const guardStatus = useGuardStatus();
  const resolverStatus = useResolverStatus();
  const lazyComponentStatus = useLazyComponentStatus();

  const context = useContext(TestContext);

  useEffect(() => {
    context.incrementCounter();
  }, []);

  useEffect(() => {
    context.setGuardStatuses(guardStatus);
  }, [guardStatus]);

  useEffect(() => {
    context.setResolverStatuses(resolverStatus);
  }, [resolverStatus]);

  useEffect(() => {
    context.setLazyLoadingStatuses(lazyComponentStatus);
  }, [lazyComponentStatus]);

  return <>LOADING</>;
};


const RoutesWrapper = () => {
  return useRoutesWithHelper([
    {
      path: '/',
      lazyElement: <LazyHome/>,
      loadingComponent: <LoadingComponent/>,
      guards: [mockGuard(true, 400), mockGuard(true, 400)],
      resolvers: {
        userName: mockResolver(400, 'john'),
        permissions: mockResolver(400, 'admin'),
      },
      children: [
        {
          path: 'child',
          lazyElement: <LazyChild />,
          guards: [mockGuard(true, 400)],
        },
      ],
    },
  ]);
  // return useRoutesWithHelper([
  //   {
  //     path: "/",
  //     element: <Home />,
  //     title: 'Home - Title',
  //     children: [
  //       {
  //         path: "child",
  //         element: <Child />,
  //         title: "Child1 - Title",
  //         children: [
  //           {
  //             path: ":id",
  //             element: <Child2 />,
  //             title: "Child2 - Title",
  //             children: [
  //               {
  //                 path: "child3",
  //                 element: <Child3 />,
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     ]
  //   },
  // ]);
};

function App() {
  const [guardStatuses, setGuardStatuses] = useState<RouteHelperStatus[]>([]);
  const [resolverStatuses, setResolverStatuses] = useState<RouteHelperStatus[]>([]);
  const [lazyLoadingStatuses, setLazyLoadingStatuses] = useState<RouteHelperStatus[]>([]);

  const [counter, setCounter] = useState(0);


  return (
    <TestContext.Provider value={{
      setGuardStatuses: (status) => {
        setGuardStatuses((prevState) => {
          return [...prevState, status];
        });
      },
      setResolverStatuses: (status) => {
        setResolverStatuses((prevState) => {
          return [...prevState, status];
        });
      },
      setLazyLoadingStatuses: (status) => {
        setLazyLoadingStatuses((prevState) => {
          return [...prevState, status];
        });
      },
      incrementCounter: () => setCounter(prev => prev + 1),
    }}>
      <TestContext.Consumer>{() => (<>
          <div id={'rerender-counter'}>Counter = {counter}</div>
          <div id={'guard-statuses'}>Guards = {guardStatuses.join(', ')}</div>
          <div id={'resolver-statuses'}>Resolvers = {resolverStatuses.join(', ')}</div>
          <div id={'lazy-loading-statuses'}>Lazy Loading = {lazyLoadingStatuses.join(', ')}</div>
          <Router>
            <RoutesWrapper/>
          </Router>
        </>
      )}
      </TestContext.Consumer>
    </TestContext.Provider>
  );
}


export default App;
