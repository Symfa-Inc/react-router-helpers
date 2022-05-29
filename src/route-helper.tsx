import React, { useEffect, useState } from 'react';
import { RouteContext } from './context';
import { useManager, useStatusNotification } from './inner-hooks';
import { HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from './types';

//   // TODO: Add resolvers
//   // TODO: Add resolvers tests

//   // TODO: Add metadata (title)
//   // TODO: Add metadata (title) tests

//  // TODO: Add preserve query params strategy for Link component
//  // TODO: Add preserve query params strategy for Link component tests
//
//   // TODO: Add lazy loading
//   // TODO: Add lazy loading tests
//
//   // TODO: Add server side plug
//   // TODO: Add server side plug tests
//

export const RouteHelper = (props: HelperRouteObjectProps) => {
  const guards = props.guards || [];
  const resolvers = props.resolvers || {};

  const manager = useManager({
    guards: guards.map(g => g()),
    resolvers: Object.keys(resolvers).reduce((acc, next) => ({ ...acc, [next]: resolvers[next]() }), {}),
  });

  const [guardsStatus, setGuardsStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolversStatus, setResolversStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});

  const notification = useStatusNotification(props.onGuardStatusChange, props.onResolverStatusChange);

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolversStatus(initialStatus);
    notification.notifyResolversStatusChange(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();
    setLoadedResolverInfos(infos);
    setResolversStatus(status);

    notification.notifyResolversStatusChange(status);
  };

  const evaluateGuardsAndResolvers = async () => {
    const initialStatus = manager.getGuardsStatusBeforeEvaluating();

    setGuardsStatus(initialStatus);
    notification.notifyGuardStatusChange(initialStatus);

    const guardStatus = await manager.evaluateGuards();

    notification.notifyGuardStatusChange(guardStatus);

    if (guardStatus == RouteHelperStatus.Loaded) {
      await evaluateResolvers();
    }

    setGuardsStatus(guardStatus);
  };

  useEffect(() => {
    (async () => {
      await evaluateGuardsAndResolvers();
    })();
  }, []);

  if (guardsStatus == RouteHelperStatus.Loaded && resolversStatus === RouteHelperStatus.Loaded) {
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
