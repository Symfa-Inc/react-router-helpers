import React, { useEffect, useState } from 'react';
import { useManager, useStatusNotification } from './hooks';
import { HelperRouteObject, OnlyHelperFields, RouteHelperStatus } from './types';


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

export const RouteHelper = (props: HelperRouteObject) => {
  const manager = useManager({ guards: props.guards || [] });
  const [status, setStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const notification = useStatusNotification(props.onStatusChange);

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

  if (status == RouteHelperStatus.Loaded) {
    return <>{props.element}</>;
  }

  return <></>;
};


export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
