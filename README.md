# Why do you need it?
The goals for that library are simplify, standardize and shift responsibility from for route protection
from component to library.

What the library can do:
* Route protection (`guard`)
* Providing data for component pages (`resolver`)
* Lazy component support out of the box
* If the user doesn't have access to the lazy component, then the lazy component won't even be loaded over network
* Show loading component and provide detailed statuses with hooks on each step of component loading

**Well, of course, the library includes a simple, react-style and not overloaded interface for interacting with the library. 😃**

# Setup:

* install react-router-dom

* install react-router-helper

# How to migrate from react-router-dom:

Since the 6 version of react-router - the more convenient way of use router - 
with javascript objects, lets go through setup react-router with `useRoutes`

To fully migrate you need to:
* Just need to replace `useRoutes` with `useRoutesWithHelper`
* Replace `<Outlet />` to `<HelperOutlet />` in all places

#### Example default react-router-dom: ####
<br />

```tsx
import { useRoutes } from "react-router-dom";

function App() {
  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          path: "messages",
          element: <DashboardMessages />,
        },
        { path: "tasks", element: <DashboardTasks /> },
      ],
    },
    { path: "team", element: <AboutPage /> },
  ]);
  return element;
}
```
<br />

#### Example with replaced `useRoute` to `useRoutesWithHelper`: ####
<br />

```tsx
import { useRoutesWithHelper } from "react-router-helper";

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          path: "messages",
          element: <DashboardMessages />,
        },
        { path: "tasks", element: <DashboardTasks /> },
      ],
    },
    { path: "team", element: <AboutPage /> },
  ]);
  return element;
}
```
<br />

#### Example before replace: ####
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

#### Example after replace: ####
<br />

```tsx
import { HelperOutlet } from "react-router-helper";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <HelperOutlet />
    </div>
  );
}
```

**That's all, the library's functionality can be fully used!**

There are 3 types of entities in the library:
* Guard
* Resolver
* Lazy component

All of them have indicators of work - statuses, there are 4 types of statuses in total:
* **Initial** - Not initiated yet
* **Loading** - Loading ( ͡° ͜ʖ ͡°)
* **Loaded** - Loaded ( ͡° ͜ʖ ͡°)
* **Failed** - Couldn't work for some reason

You can get statuses inside the `LoadingComponent` component:
* To get guard statuses - useGuardStatus
* To get resolver statuses - useResolverStatus
* To get lazy component statuses - useLazyStatus


Statuses are needed for more flexible display of indicators
loads and errors. `LoadingComponent`, in addition to accepting statuses, is also used as a loading indicator - a loader.

# Guard:
When you need to 'guard' a page from an unauthorized user or restrict a normal user from the admin page - guards will be helpful to you.
You just need to create the guard itself and use it on the needed route,
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
import { useRoutesWithHelper } from "react-router-helper";

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
      element: <Dashboard />,
      guards: [authorizationGuard],
    },
  ]);
  return element;
}
```

In other words, the guard must return true if the user can enter the given route and false if user cannot enter.
Protection for our route - ready!
To handle the situation when the guard returned false and the page was not loaded,
we need to add a loadingComponent and inside that component we have access to hooks that can tell us about status changes of the guard!
<br />

#### Example creating a loading component with a redirect: ####
<br />

```tsx
import { useGuardStatus, RouteHelperStatus } from "react-router-helper";

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

#### Example: ####
<br />

```tsx
import { useRoutesWithHelper } from "react-router-helper";

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
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
* The order in which guards are called the same as they placed in an array - from left to right
* As soon as one guard returns false, all guards on the right of failed one are not called.
* If the guard threw an error, and it was not wrapped in a `try catch` block within the guard, then the guard's status will be `Failed`.

<br />

#### Example with dispatch: ####
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

#### Example with status receiving: ####
<br />

```tsx
import { useGuardStatus } from "react-router-helper";

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
import { useRoutesWithHelper } from "react-router-helper";

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
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

#### Example: ####
<br />

```tsx
import { useRoutesWithHelper } from "react-router-helper";

const Loading = () => {
  return <>Loading...</>;
};

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
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

#### Example: ####
<br />

```tsx
import { useRoutesWithHelper, useResolver } from "react-router-helper";

export function Dashboard() {
  const { userInfo } = useResolver();
  
  return (<>
    <h2>Dashboard Page</h2>
    <h2>{userInfo.name}</h2>
  </>);
}
```

### More detailed information about resolver:
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

#### Example with status receiving: ####
<br />

```tsx
import { useResolverStatus } from "react-router-helper";

export const LoadingComponent = () => {
  const resolverStatus = useResolverStatus();

  useEffect(() => {
    console.log(resolverStatus);
  }, [resolverStatus]);

  return <>Loading...</>;
};
```

# Lazy Component:
Библиотека поддерживает `lazy` компоненты из коробки и позволяет использовать их без дополнительных обёрток в виде `React.Suspense`
и так же, позволяет при помощи *guards* оставить загрузку lazy компонента,
если у пользователя нету доступа к странице / компонента - по ангуляровской аналогии *canLoad*.

<br />

#### Example стандартное использование lazy компонента в роутере: ####
<br />

```tsx
import { useRoutes } from 'react-router-dom';
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

function App() {
  let element = useRoutes([
    {
      path: "/",
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

#### Example использование с помощью библиотеки: ####
<br />

```tsx
import { useRoutesWithHelper } from "react-router-helper";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
      loadElement: <Dashboard />,
    },
  ]);
  return element;
}
```
С использование `LoadingComponent` можно показать индикатор загрузки `lazy` компонента.

<br />

#### Example использование lazy компонента и отображение загрузки: ####
<br />

```tsx
import { useRoutesWithHelper } from "react-router-helper";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

const LoadingComponent = () => <>Loading...</>;

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
      loadElement: <Dashboard />,
      loadingElement: <LoadingComponent />
    },
  ]);
  return element;
}
```

### More detailed information about lazy component:
* Если на роутер у lazy компонента есть гард который вернёт false - lazy компонент даже не начнёт загружаться по сети.
**Таким образом юзер который и не должен получить доступ к запрашиваемой странице - не будет загружать её бандл.**
* С lazy компонентом так же можно использовать `resolvers` и получать значения через `useResolver` внутри lazy компонента
* Информацию о загрузке `lazy` компонента можно получить внутри `LoadingComponent` с помощью хука `useLazyStatus`
* Если при загрузки lazy компонента возникла какая то ошибка (например оборвалось интернет соединение) - то статус `lazy` компонента будет - `Failed`
* Если при загрузки lazy компонента возникла какая то ошибка (например оборвалось интернет соединение) -
* то подробную информацию об ошибке можно получить внутри lazy loading компонента при помощи хука - `useLazyError`
<Код с получение информации об ошибки>

<br />

#### Example с получением статусов lazy компонента: ####
<br />

```tsx
import { useLazyStatus } from "react-router-helper";

export const LoadingComponent = () => {
  const lazyStatus = useLazyStatus();

  useEffect(() => {
    console.log(lazyStatus);
  }, [lazyStatus]);

  return <>Loading...</>;
};
```
<br />

#### Example получение информации об ошибки: ####
<br />

```tsx
import { useLazyStatus, useLazyError } from "react-router-helper";

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
`Loading component` - обычной компонент и универсальный способ для отображения загрузки и обработки изменений
статусов от `guards`, `resolvers` и от `lazy component`. Внутри Loading component можно использовать стандартные
хуки реакта / диспатчить экшены.
Для того, что бы просто показать загрузку пока гарды, резолверы, lazy component загружаются / работают, достаточно просто написать:

<br />

#### Example с отображением загрузки: ####
<br />

```tsx
export const LoadingComponent = () => {
  return <>Loading...</>;
};
```

<br />

#### Example с использованием LoadingComponent: ####
<br />

```tsx
import { useRoutesWithHelper } from "react-router-helper";

function App() {
  let element = useRoutesWithHelper([
    {
      path: "/",
      element: <Dashboard />,
      loadingElement: <LoadingComponent />
    },
  ]);
  return element;
}
```

Если нужно обработать потенциальный `Failed` статус от `guards`, `resolvers`, `lazy component` - тогда можно воспользоваться хуками
* для гарда - useGuardStatus
* для резолвера - useResolverStatus
* для lazy component - useLazyStatus
* для получение подробной ошибки при загрузки `lazy component` - `useLazyError`

<br />

#### Example с использованием LoadingComponent: ####
<br />

```tsx
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
