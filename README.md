## Основная информация:

### Зачем вообще нужен этот роутер?
  Цель этой библиотеки упростить и стандартизировать и переложить отвественность за защиту роута с самого компонента на плечи библиотеки.
  Что входит в библиотеку:
  * Защита роута (guard)
  * Предоставление данных роуту перед его отображением (resolver)
  * Встроенная поддержка lazy компонентов
  * Если у юзера нету доступа к запрашиваемому lazy компоненту, то lazy компонент даже не будет загружаться по сети
  * Встроенная поддержка спиннера и предоставление подробных статусов с помощью хуков на всех этапах загрузки компонента

**Ну и конечно в библиотеку входит простой, в стиле реакта и не перегруженный интерфейс взаимодействия с библиотекой.**

## Установка:

установить react-router-dom
установить react-router-helper

Как мигрировать с обычного react-router-dom:

Начиная с версии react-router 6 более удобный способ настройки роутера - через javascript объекты, рассмотрим миграцию react-router с использованием useRoutes
#### Example: ####
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

Нам всего лишь надо заменить useRoutes на useRoutesWithHelper
#### Example: ####
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
Так же, во всех местах где используется `<Outlet />` надо заменить на `<HelperOutlet />`
#### Example: ####
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
Просто заменяем:
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

**И все, фукнционал помощника может быть использовал в полной мере!**

В библиотеке есть 3 вида сущностей:
* Guard
* Resolver
* Lazy component
* 
У всех у них есть индикаторы работы - статусы, всего есть 4 типа статусов:
* **Initial** - Ещё не запущен
* **Loading** - Загружается
* **Loaded** - Загружен
* **Failed** - По каком либо причине не смог отработать

Получить статусы можно внутри компонента `LoadingComponent`:
* Для получение статусов гардов - useGuardStatus
* Для получение статусов резолверов - useResolverStatus
* Для получение статусов lazy компонента - useLazyStatus

Статусы нужны для более гибкого отображение индикаторов загрузки и ошибок.
`LoadingComponent` по мимо того что принимает статусы, ещё используется в качество индикатора загрузки - лоадера.

## Guard:

Когда вам нужно ‘защитить’ страницу от не авторизованного пользователя, ограничить обычного пользователя от админской страницы - гарды придут вам на помощь.
К роутеру всего лишь надо создать сам гард и использовать его на необходимом маршруте, вот как выглядит созданный гард который не пустит не авторизованного пользователя на страницу нашего приложения:
#### Example: ####
```tsx
export const authorizationGuard = () => () => {
  return localStorage.getItem('token') !== null;
};
```

И его использование:
#### Example: ####
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


То есть гард должен вернуть true если пользователь может зайти на данный марштут и false если он не может зайти. Защита для нашего маршрута - готова!
Что бы обработать ситуацию когда гард вернул false и страница не была загружена, нам надо добавить loadingComponent и внутри него у нас есть доступ к хукам которые скажут нам о изменение статуса гарда!
Создание loading component с редиректом:
#### Example: ####
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

#### Example: ####
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

### Более подробная информация о гардах:

* Гарды могут быть как синхронные так и ассинхронные

* В гарде можно использовать хуки для получение данных со стора / параметров маршрута либо диспатчить экшены.

* Если гард возвращает `false` - то статус гардов становится `Failed`

* Статусы гардов можно получить внутри LoadingComponent с помощью хука `useGuardStatus`

* Так как в роуте поле guards - это массив, гардов может быть несколько, порядок вызова гардов, такой как она располагаются в массиве - то есть слево на право, как только один гард возвращает false, все гарды которые находяться правее его - не вызываются.

* Если гард бросил ошибку и она не была обернута в `try catch` внутри гарда - то статус гарда будет - `Failed`.

#### Example с диспатчем: ####
```tsx
export const userProfilePageGuard = () => {
  const params = useParams();
  const user = useSelector();
  
  return () => {
    return params.id === user.id;
  };
};
```

#### Example с получением статусов: ####
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

## Resolver:
Бывает, что нужно показать компонент и предварительно подтянуть к нему данные с сервера
и обычно приходиться использовать `useEffect`, загружать данные, использовать `useState`
для индикации загрузки данных, и здесь как раз нам приходит на помощь - `resolver`.
#### Example - создание резолвера: ####
```tsx
export const userInfoResolver = () => async () => {
  const userInfo = await getUserInfo();
  
  return userInfo;
};
```
#### Example использование резолвера: ####
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

Пока данные грузяться можно показать индикатор загрузки с помощью `LoadingComponent`

#### Example: ####
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

Как только резолверы закончат свою работу, компонент будет отрендерен а данные которые резолверы вернут - можно получить с помощью хука - `useResolver`
#### Example: ####

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

### Подробная информация по `resolver`:

* резолверы могут быть как синхронные так и ассинхронные

* В резолвере можно использовать хуки для получение данных со стора / параметров марштура либо диспатчить экшены.
* Статусы резолверов можно получить внутри LoadingComponent с помощью хука `useResolverStatus`
* Так как в роуте поле `resolvers` - это объект, резолверов может быть несколько.
* Название ключа в объекте резолверов - это название ключа для получения значений внутри компонента при использование хука `useResolver`.

* Если резолвер бросил ошибку и она не была обернута в `try catch` внутри резолвера- то статус резолвера будет - `Failed`.

#### Example с использование с redux toolkit: ####
```tsx
export const profilePageResolver = () => {
  const params = useParams();
  const dispatch = useDispatch();

  return async () => {
    await dispatch(fetchUserById(params.userId));
  };
};
```
#### Example с получением статусов резолвера: ####
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


## Lazy Component:
Библиотека поддерживает `lazy` компоненты из коробки и позволяет использовать их без дополнительных обёрток в виде `React.Suspense`
и так же, позволяет при помощи *guards* оставить загрузку lazy компонента,
если у пользователя нету доступа к странице / компонента - по ангуляровской аналогии *canLoad*.

#### Example стандартное использование lazy компонента в роутере: ####
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

#### Example использование с помощью библиотеки: ####
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
#### Example использование lazy компонента и отображение загрузки: ####
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


### Подробная информация по lazy component:
* Если на роутер у lazy компонента есть гард который вернёт false - lazy компонент даже не начнёт загружаться по сети.
**Таким образом юзер который и не должен получить доступ к запрашиваемой странице - не будет загружать её бандл.**
* С lazy компонентом так же можно использовать `resolvers` и получать значения через `useResolver` внутри lazy компонента
* Информацию о загрузке `lazy` компонента можно получить внутри `LoadingComponent` с помощью хука `useLazyStatus`
* Если при загрузки lazy компонента возникла какая то ошибка (например оборвалось интернет соединение) - то статус `lazy` компонента будет - `Failed`
* Если при загрузки lazy компонента возникла какая то ошибка (например оборвалось интернет соединение) -
* то подробную информацию об ошибке можно получить внутри lazy loading компонента при помощи хука - `useLazyError`
<Код с получение информации об ошибки>

#### Example с получением статусов lazy компонента: ####
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

#### Example получение информации об ошибки: ####
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

## Loading Component:
`Loading component` - обычной компонент и универсальный способ для отображения загрузки и обработки изменений
статусов от `guards`, `resolvers` и от `lazy component`. Внутри Loading component можно использовать стандартные
хуки реакта / диспатчить экшены.
Для того, что бы просто показать загрузку пока гарды, резолверы, lazy component загружаются / работают, достаточно просто написать:
#### Example с отображением загрузки: ####
```tsx
export const LoadingComponent = () => {
  return <>Loading...</>;
};
```

#### Example с использованием LoadingComponent: ####
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

#### Example с использованием LoadingComponent: ####

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
