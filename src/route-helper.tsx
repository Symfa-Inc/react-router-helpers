import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RouteContext } from './context';
import { useManager, useStatusNotification } from './inner-hooks';
import { HelperManager, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from './types';
/* eslint no-use-before-define: 0 */

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
  const parentContext = useContext(RouteContext);
  const location = useLocation();

  const wereWorkersStarted = useRef(false);

  const wasParentTitleResolveCanceled = useRef(false);

  const lastLocationRef = useRef<string>('');
  const lastCancellationKeyFromChild = useRef('');


  const manager = useManager(initializeManagerParams());

  const [guardsStatus, setGuardsStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolversStatus, setResolversStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});


  const [canChildStartWorkers, setCanChildStartWorkers] = useState(false);

  const notification = useStatusNotification(props.onGuardStatusChange, props.onResolverStatusChange);

  const cancelTitleResolver = (cancellationKey: string) => {
    lastCancellationKeyFromChild.current = cancellationKey;
  };

  function isUpdateOnNewLocation() {
    const isNew = lastLocationRef.current !== '' && lastLocationRef.current !== location.key;
    if (isNew) {
      lastLocationRef.current = location.key;
    }
    return isNew;
  }

  function isLastChild() {
    return lastLocationRef.current !== lastCancellationKeyFromChild.current;
  }


  const resetCancellationTitleResolve = () => {
    wasParentTitleResolveCanceled.current = false;
  };

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolversStatus(initialStatus);
    notification.notifyResolversStatusChange(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();


    setLoadedResolverInfos(infos);
    setResolversStatus(status);

    notification.notifyResolversStatusChange(status);
    setCanChildStartWorkers(true);

    if (status === RouteHelperStatus.Loaded) {
      if (isLastChild()) {
        applyResolveTitle();
      }
    }
  };

  const applyResolveTitle = () => {
    manager.resolveTitle();
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

  function initializeManagerParams(): HelperManager {
    const guards = props.guards || [];
    const resolvers = props.resolvers || {};
    const titleResolver = props.titleResolver || null;

    return {
      guards: guards.map(g => g()),
      resolvers: Object.keys(resolvers).reduce((acc, next) => ({ ...acc, [next]: resolvers[next]() }), {}),
      title: props.title,
      titleResolver: titleResolver !== null ? titleResolver() : null,
    };
  }

  const initCancellation = (cancellationKey: string) => {
    if (!wasParentTitleResolveCanceled.current) {
      wasParentTitleResolveCanceled.current = true;
      parentContext.setCancelTitleResolverForParent(cancellationKey);
    }

    if (isLastChild()) {
      manager.setTitle();

      // If route was already loaded
      if (resolversStatus === RouteHelperStatus.Loaded) {
        // TODO: Navigate back, BUG with setting title back do we need to solve it?
        applyResolveTitle();
      }
    }
  };

  useEffect(() => {
    initCancellation(location.key);
    lastLocationRef.current = location.key;
  }, []);

  useEffect(() => {
    if (parentContext.canStartToLoadWorkers && !wereWorkersStarted.current) {
      wereWorkersStarted.current = true;
      evaluateGuardsAndResolvers();
    }
  }, [parentContext]);

  useEffect(() => {
    if (isUpdateOnNewLocation() && isLastChild()) {
      resetCancellationTitleResolve();
      initCancellation(lastLocationRef.current);
    }
  }, [location]);


  const elementToRender =
    parentContext.canStartToLoadWorkers &&
    guardsStatus === RouteHelperStatus.Loaded &&
    resolversStatus === RouteHelperStatus.Loaded ? (
      props.element
    ) : (
      <Outlet/>
    );
  return (
    <RouteContext.Provider
      value={{
        routeResolverInfos: loadedResolverInfos,
        canStartToLoadWorkers: canChildStartWorkers,
        setCancelTitleResolverForParent: cancelTitleResolver,
      }}
    >
      <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
    </RouteContext.Provider>
  );
};

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
