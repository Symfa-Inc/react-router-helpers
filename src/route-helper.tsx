import React, { useEffect, useState } from 'react';
import { RouteContext } from './context';
import { useManager, useStatusNotification } from './inner-hooks';
import { HelperRouteObject, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from './types';

//   // TODO: Add resolvers
//   // TODO: Add resolvers tests

//   // TODO: Add metadata (title)
//   // TODO: Add metadata (title) tests
//
//   // TODO: Add lazy loading
//   // TODO: Add lazy loading tests
//
//   // TODO: Add server side plug
//   // TODO: Add server side plug tests
//

export const RouteHelper = (props: HelperRouteObjectProps) => {
  const manager = useManager({
    guards: props.guards || [],
    resolvers: props.resolvers || {},
  });
  const [status, setStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});

  const notification = useStatusNotification(props.onStatusChange);

  const evaluateGuards = async () => {
    const initialStatus = manager.getStatusBeforeEvaluating();

    setStatus(initialStatus);
    notification.notify(initialStatus);

    const guardStatus = await manager.evaluateGuards();

    setStatus(guardStatus);
    notification.notify(guardStatus);
  };

  const evaluateResolvers = async () => {
    const result = await manager.evaluateResolvers();
    setLoadedResolverInfos(result);
  };

  useEffect(() => {
    (async () => {
      await evaluateGuards();
      await evaluateResolvers();
    })();
  }, []);

  if (status == RouteHelperStatus.Loaded) {
    return (
      <RouteContext.Provider
        value={{
          routeResolverInfos: loadedResolverInfos,
        }}
      >
        <RouteContext.Consumer>{() => props.element}</RouteContext.Consumer>
      </RouteContext.Provider>
    );
  }

  return <></>;
};

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
