# Why do you need it?
The goals for that library are simplify, standardize and shift responsibility for the route protection
from component to library.

What the library can do:
* Route protection (`guard`)
* Providing data for component pages (`resolver`)
* Lazy component support out of the box
* If the user doesn't have access to the lazy component, then the lazy component won't even be loaded over network
* Show loading component and provide detailed statuses with hooks on each step of component loading

**Well, of course, the library includes a simple, react-style and not overloaded interface for interacting with the library. 😃**

# Requirements:
* React v16.8.0+
* React Router DOM v6.0.0+

# Setup:

* npm i react-router-dom@6

* npm i @symfa/react-router-helpers

# Configuration:
**NOTE**: Follow the [default tutorial](https://reactrouter.com/en/main/start/tutorial) for basic configuration!

# How to migrate from react-router-dom:

Since the 6 version of react-router - the more convenient way of using the router is with javascript objects,
this way allows to have more smooth experience.

To fully migrate you need to:
* Just need to replace `useRoutes` with `useRoutesWithHelper`
* Replace `<Outlet />` to `<HelperOutlet />` in all places
* If you are using `Route` and component style - you need to wrap your component into `<RouteHelper />`

#### Example - before migration default react-router-dom: ####
<br />

```tsx
import { useRoutes } from 'react-router-dom';

function App() {
  let element = useRoutes([
    {
      path: '/',
      element: <Dashboard />,
      children: [
        {
          path: 'messages',
          element: <DashboardMessages />,
        },
        { path: 'tasks', element: <DashboardTasks /> },
      ],
    },
    { path: 'team', element: <AboutPage /> },
  ]);
  return element;
}
```
<br />

#### Example - after migration with replaced `useRoute` to `useRoutesWithHelper`: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      element: <Dashboard />,
      children: [
        {
          path: 'messages',
          element: <DashboardMessages />,
        },
        { path: 'tasks', element: <DashboardTasks /> },
      ],
    },
    { path: 'team', element: <AboutPage /> },
  ]);
  return element;
}
```
<br />

#### Example - before migration `<Outlet />`: ####
<br />

```tsx
import { Outlet } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Outlet />
    </div>
  );
}
```
<br />

#### Example - after migration to `<HelperOutlet />`: ####
<br />

```tsx
import { HelperOutlet } from '@symfa/react-router-helpers';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <HelperOutlet />
    </div>
  );
}
```

<br />

#### Example before migration - component style `Route`: ####
<br />

```tsx
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);
```
<br />

#### Example after migration - component style `Route`: ####
<br />

```tsx
import { RouteHelper } from '@symfa/react-router-helpers';

root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<RouteHelper element={<Dashboard />} />} />
    </Routes>
  </BrowserRouter>
);
```
<br />

#### Example after migration - component style `Route` how to pass props: ####
<br />

```tsx
import { RouteHelper } from '@symfa/react-router-helpers';

root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<RouteHelper
        element={<Dashboard />}
        guards={[authorizationGuard]}
      />} />
    </Routes>
  </BrowserRouter>
);
```

**That's all, the library's functionality can be fully used!**

There are 3 types of entities in the library:
* Guard
* Resolver
* Lazy component

All of them have indicators of work - statuses, there are 4 types of statuses in total:
* **Initial** - Not initiated yet
* **Loading**
* **Loaded**
* **Failed** - Couldn't work for some reason

You can get statuses inside the `LoadingComponent` component:
* To get guard statuses - `useGuardStatus`
* To get resolver statuses - `useResolverStatus`
* To get lazy component statuses - `useLazyStatus`


Statuses are needed for more flexible display of indicators
loads and errors. `LoadingComponent`, in addition to accepting statuses, is also used as a loading indicator - a loader.

# Check out more our [examples](https://github.com/Aiscom-LLC/react-router-helpers/tree/master/examples/usage-example)!

# Guard:
When you need to 'guard' a page from an unauthorized user or a regular user from the admin page - guards will be helpful to you.
You just need to create the guard itself and use it on the needed route.
Here is what the created guard looks like that will not let an unauthorized user to hit the page of your application:

<br />

#### Example: ####
<br />

```tsx
export const authorizationGuard = () => () => {
  return localStorage.getItem('token') !== null;
};
```

Usage:

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      element: <Dashboard />,
      guards: [authorizationGuard],
    },
  ]);
  return element;
}
```

In other words, the guard must return `true` if the user can enter the given route and `false` if user cannot enter.
Protection for our route - ready!

To handle the situation when the guard returned `false` and the page was not loaded,
we need to add a loadingComponent and inside that component we have access to hooks that can tell us about status changes of the guard!
<br />

#### Example creating a loading component with a redirect: ####
<br />

```tsx
import { useGuardStatus, RouteHelperStatus } from '@symfa/react-router-helpers';

export const LoadingComponent = () => {
  const guardStatus = useGuardStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (guardStatus === RouteHelperStatus.Failed) {
      navigate('/login');
    }
  }, [guardStatus]);
  
  return <>Loading...</>;
};
```
<br />

#### Example usage: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      element: <Dashboard />,
      guards: [authorizationGuard],
      loadingComponent: <Loading />
    },
  ]);
  return element;
}
```

### More detailed information about guards:

* Guards can be either synchronous or asynchronous.
* In the guard, you can use hooks to get data from the store/route params or dispatch actions.
* If the guard returns `false` - then the status of the guard is `Failed`
* Guard statuses can be received inside LoadingComponent using the `useGuardStatus` hook
* Since the guards field in the route is an array, there can be several guards
* The order in which guards are called is the same as they placed in an array - from left to right
* As soon as one guard returns `false`, all guards on the right of failed one are not called.
* If the guard threw an error, and it was not wrapped in a `try catch` block within the guard, then the guard's status will be `Failed`.

<br />

#### Example guard with dispatch: ####
<br />

```tsx
export const userProfilePageGuard = () => {
  const params = useParams();
  const user = useSelector();
  
  return () => {
    return params.id === user.id;
  };
};
```
<br />

#### Example guard with status receiving: ####
<br />

```tsx
import { useGuardStatus } from '@symfa/react-router-helpers';

export const LoadingComponent = () => {
  const guardStatus = useGuardStatus();

  useEffect(() => {
    console.log(guardStatus);
  }, [guardStatus]);
  
  return <>Loading...</>;
};
```

# Resolver:
It happens that you need to show a component and first pull data from the server to it,
and usually you have to use `useEffect`, load data, use `useState`
to indicate data loading, and this is where `resolver` comes to our help.

<br />

#### Example - resolver creation: ####
<br />

```tsx
export const userInfoResolver = () => async () => {
  const userInfo = await getUserInfo();
  
  return userInfo;
};
```
<br />

#### Example resolver usage: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      element: <Dashboard />,
      resolvers: {
        userInfo: userInfoResolver
      },
    },
  ]);
  return element;
}
```

While the data is being loaded, you can show a loading indicator using `LoadingComponent`

<br />

#### Example resolver with loading indicator - LoadingComponent: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';

const Loading = () => {
  return <>Loading...</>;
};

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      element: <Dashboard />,
      loadingComponent: <Loading />,
      resolvers: {
        userInfo: userInfoResolver
      },
    },
  ]);
  return element;
}
```

As soon as the resolvers finish their work, the component will be rendered and the data that the resolvers will
return can be received with the hook - `useResolver`

<br />

#### Example receiving data with hook useResolver: ####
<br />

```tsx
import { useRoutesWithHelper, useResolver } from '@symfa/react-router-helpers';

export function Dashboard() {
  const { userInfo } = useResolver();
  
  return (<>
    <h2>Dashboard Page</h2>
    <h2>{userInfo.name}</h2>
  </>);
}
```

### More detailed information about resolvers:
* Resolvers can be either synchronous or asynchronous.
* Resolvers, unlike guards, run simultaneously
* In the resolver, you can use hooks to get data from the store / route parameters or dispatch actions.
* Resolver statuses can be received inside LoadingComponent with the `useResolverStatus` hook
* Since the `resolvers` field in the route is an object, there can be multiple resolvers.
* The name of the key in the resolvers object is the name of the key to get values inside
  the component when using the `useResolver` hook.
* If the resolver threw an error, and it was not wrapped in a `try catch` within the resolver, then the resolver status will be `Failed`.

<br />

#### Example usage with redux toolkit: ####
<br />

```tsx
export const profilePageResolver = () => {
  const params = useParams();
  const dispatch = useDispatch();

  return async () => {
    await dispatch(fetchUserById(params.userId));
  };
};
```
<br />

#### Example with status receiving inside LoadingComponent: ####
<br />

```tsx
import { useResolverStatus } from '@symfa/react-router-helpers';

export const LoadingComponent = () => {
  const resolverStatus = useResolverStatus();

  useEffect(() => {
    console.log(resolverStatus);
  }, [resolverStatus]);

  return <>Loading...</>;
};
```

# Lazy Component:
The library supports `lazy` components out of the box and allows you to use them without additional
wrapper - `React.Suspense`
and also allows using `guards` to stop lazy component from loading -
if the user does not have access to the page / component - by the Angular analogy *canLoad*.

<br />

#### Example - default usage of lazy component with react-router-dom: ####
<br />

```tsx
import { useRoutes } from 'react-router-dom';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
  let element = useRoutes([
    {
      path: '/',
      element: (
        <React.Suspense fallback={<>Loading</>}>
          <Dashboard />
        </React.Suspense>
      ),
    },
  ]);
  return element;
}
```
<br />

#### Example - usage with library: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      lazyElement: <Dashboard />,
    },
  ]);
  return element;
}
```
If you need to show loading indicator - you can use `LoadingComponent`

<br />

#### Example - using lazy component and show loading: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const LoadingComponent = () => <>Loading...</>;

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      lazyElement: <Dashboard />,
      loadingElement: <LoadingComponent />
    },
  ]);
  return element;
}
```

### More detailed information about lazy component:
* If the lazy component has a guard on the router that returns `false`, the lazy component will not even start loading over the network.
  **In other words, a user who should not have access to the requested page / component will not download its bundle.**
* With a lazy component, you can also use `resolvers` and get values with `useResolver` inside the lazy component
* Detailed information about statuses `lazy` component can be received inside `LoadingComponent` with the `useLazyStatus` hook
* If some error occurred while loading the lazy component (for example, the Internet connection was interrupted) -
  then the status of the `lazy` component will be `Failed`
* If some error occurred while loading the lazy component (for example, the Internet connection was interrupted) -
  then detailed information about the error can be received inside the lazy loading component with the hook - `useLazyError`

<br />

#### Example with receiving lazy component statuses: ####
<br />

```tsx
import { useLazyStatus } from '@symfa/react-router-helpers';

export const LoadingComponent = () => {
  const lazyStatus = useLazyStatus();

  useEffect(() => {
    console.log(lazyStatus);
  }, [lazyStatus]);

  return <>Loading...</>;
};
```
<br />

#### Example - with receiving lazy component error: ####
<br />

```tsx
import { useLazyStatus, useLazyError } from '@symfa/react-router-helpers';

export const LoadingComponent = () => {
  const lazyStatus = useLazyStatus();
  const lazyError = useLazyError();

  useEffect(() => {
    console.log(lazyStatus);
  }, [lazyStatus]);

  useEffect(() => {
    console.log(useLazyError);
  }, [useLazyError]);

  return <>Loading...</>;
};
```

# Loading Component:
`Loading component` - a usual component and a generic way to show loading and handle status changes
from `guards`, `resolvers` and from `lazy component`. Inside the Loading component, you can use the standard
react hooks / dispatch actions.
To simply show the loading while guards, resolvers, lazy components are loading / working,
you just need to create simple `Loading component`:

<br />

#### Example - with loading: ####
<br />

```tsx
export const LoadingComponent = () => {
  return <>Loading...</>;
};
```

<br />

#### Example - usage of LoadingComponent: ####
<br />

```tsx
import { useRoutesWithHelper } from '@symfa/react-router-helpers';

function App() {
  let element = useRoutesWithHelper([
    {
      path: '/',
      element: <Dashboard />,
      loadingElement: <LoadingComponent />
    },
  ]);
  return element;
}
```

If you need to handle statuses from `guards`, `resolvers`, `lazy components` - then you can use hooks
* For `guards` - useGuardStatus
* For `resolvers` - useResolverStatus
* For `lazy component` - useLazyStatus
* To get detailed information about `lazy component` error - `useLazyError`

<br />

#### Example - of usage LoadingComponent: ####
<br />

```tsx
import { useGuardStatus, useResolverStatus, useLazyStatus, useLazyError, useNavigate } from '@symfa/react-router-helpers';
import { RouteHelperStatus } from './types';

const LoadingComponent = () => {
  const guardStatus = useGuardStatus();
  const resolverStatus = useResolverStatus();
  const lazyComponentStatus = useLazyStatus();
  const lazyError = useLazyError();
  const navigate = useNavigate();

  useEffect(() => {
    if (lazyError?.error) {
      navigate('/error-page');
    }
  }, [error]);

  useEffect(() => {
    if (guardStatus === RouteHelperStatus.Failed) {
      navigate('/login');
    }
  }, [guardStatus]);

  useEffect(() => {
    if (resolverStatus === RouteHelperStatus.Failed) {
      navigate('/error-page');
    }
  }, [resolverStatus]);

  useEffect(() => {
    console.log(lazyComponentStatus);
  }, [lazyComponentStatus]);

  return <>Loading</>;
};
```
