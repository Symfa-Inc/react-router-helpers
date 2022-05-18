import React, { useEffect, useState } from 'react';
import { useManager, useStatusNotification } from './hooks';
import { HelperRouteObject, OnlyHelperFields, Status } from './types';

export const RouteHelper = (props: HelperRouteObject) => {
  const manager = useManager({ guards: props.guards || [] });
  const [status, setStatus] = useState<Status>(Status.Initial);
  const notification = useStatusNotification(props.statusChanged);

  const evaluateGuards = async () => {
    const initialStatus = manager.getStatusBeforeEvaluating();

    setStatus(initialStatus);
    notification.notify(initialStatus);

    const guardStatus = await manager.evaluateGuards();

    setStatus(guardStatus);
    notification.notify(guardStatus);
  };

  useEffect(() => {
    (async () => {
      await evaluateGuards();
    })();
  }, []);

  if (status == Status.Loaded) {
    return <>{props.element}</>;
  }

  return <></>;
};

// export class RouteHelper {
//   private guards: Guard[] = [];
//   private path: string;
//
//   constructor(private element: JSX.Element | React.ReactNode) {
//   }
//
//   // TODO: Add guards tests
//
//   // TODO: Add ability to show loading
//
//   // TODO: Add resolvers
//   // TODO: Add resolvers tests
//
//   // TODO: Add something like (useRoutes) with RouteHelper
//   // TODO: Add something like (useRoutes) with RouteHelper tests
//
//   // TODO: Add metadata (title)
//   // TODO: Add metadata (title) tests
//
//   // TODO: Add lazy loading
//   // TODO: Add lazy loading tests
//
//   // TODO: Add server side plug
//   // TODO: Add server side plug tests
//
//   // public withResolvers(): void {}
//
//   public withGuards(guards: Guard[]): RouteHelper {
//     this.guards = guards;
//     return this;
//   }
//
//   public withPath(path: string) {
//     this.path = path;
//     return this;
//   }
//
//   private notifyStatusChange(status: Status) {
//     const notifyFunction = (this.element as any).type['__notifyLoading'];
//     if (typeof notifyFunction === 'function') {
//       notifyFunction(status);
//     }
//   }
//
//   public create(): JSX.Element {
//     const manager = useManager({ guards: this.guards });
//     const [status, setStatus] = useState<Status>(Status.Initial);
//     // const path = useResolvedPath('home22');
//     const match = useMatch('home/home22');
//     const location = useLocation();
//
//     // const evaluateGuards = async () => {
//     //   const initialStatus = manager.getStatusBeforeEvaluating();
//     //
//     //   setStatus(initialStatus);
//     //   this.notifyStatusChange(initialStatus);
//     //
//     //   const guardStatus = await manager.evaluateGuards();
//     //
//     //   setStatus(guardStatus);
//     //   this.notifyStatusChange(initialStatus);
//     //   if (status === Status.Failed) {
//     //     console.log('Need to do something');
//     //   }
//     // };
//
//     useEffect(() => {
//       console.log('rendered inside' + this.element);
//     //   (async () => {
//     //     // console.log(path);
//     //     await evaluateGuards();
//     //   })();
//     }, []);
//
//     // useEffect(() => {
//     //   console.log(match);
//     // }, [location]);
//
//     // if (status == Status.Loading) {
//     //   return <h1>loading...</h1>;
//     // }
//     // if (status == Status.Failed) {
//     //   return <h1>failed to load...</h1>;
//     // }
//
//     // if (status == Status.Loaded) {
//       return <>{this.element}</>;
//     // }
//
//     return <></>;
//   }
// }

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
