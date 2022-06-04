import React, { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RouteContext } from "./context";
import { useManager, useStatusNotification } from "./inner-hooks";
import { HelperManager, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from "./types";
/* eslint no-use-before-define: 0 */

//   // TODO: Add metadata (title)
//   // TODO: Add metadata (title) tests

// TODO: BUG if press on the same link again
// TODO: BUG if press on the last link - title was set from first parent
// TODO: BUG if first press on child1 and then second press on child 2 - title was set from child1

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


  //#region initialize helpers
  const initializeManagerParams = (): HelperManager => {
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
  //#endregion initialize helpers

  const manager = useManager(initializeManagerParams());

  //#region Refs to prevent double calls
  const wereWorkersStarted = useRef(false);
  const wasParentTitleResolveCanceled = useRef(false);
  //#endregion Refs to prevent double calls

  const isComponentStillAlive = useRef(true);

  const lastLocationKey = useRef<string>("");
  const lastCancellationKeyFromChild = useRef("");

  //#region Workers infos
  const [guardsStatus, setGuardsStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolversStatus, setResolversStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});
  //#endregion Workers infos

  const [canChildStartWorkers, setCanChildStartWorkers] = useState(false);

  const notification = useStatusNotification(props.onGuardStatusChange, props.onResolverStatusChange);


  //#region titleResolve
  const cancelTitleResolveForCurrentRoute = (cancellationKey: string) => {
    lastCancellationKeyFromChild.current = cancellationKey;
  };

  const applyResolveTitle = () => {
    manager.resolveTitle(isComponentStillAlive);
  };

  const resetCancellationTitleResolve = () => {
    wasParentTitleResolveCanceled.current = false;
  };

  const bubbleUpResolveCancellationToParent = (cancellationKey: string) => {
    if (!wasParentTitleResolveCanceled.current) {
      wasParentTitleResolveCanceled.current = true;
      parentContext.setCancelTitleResolverForParent(cancellationKey);
    }
  };

  const initCancellation = (cancellationKey: string) => {
    bubbleUpResolveCancellationToParent(cancellationKey);

    if (isLastChild()) {
      manager.setTitle();

      // If route was already loaded
      if (resolversStatus === RouteHelperStatus.Loaded) {
        // TODO: Navigate back, BUG with setting title back do we need to solve it?
        applyResolveTitle();
      }
    }
  };
  //#endregion titleResolve


  const isUpdateOnNewLocation = () => {
    const isNew = lastLocationKey.current !== "" && lastLocationKey.current !== location.key;
    if (isNew) {
      lastLocationKey.current = location.key;
    }
    return isNew;
  };

  const isLastChild = () => {
    return lastLocationKey.current !== lastCancellationKeyFromChild.current;
  };

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolversStatus(initialStatus);
    notification.notifyResolversStatusChange(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();


    setLoadedResolverInfos(infos);
    setResolversStatus(status);

    notification.notifyResolversStatusChange(status);

    if (status === RouteHelperStatus.Loaded) {
      setCanChildStartWorkers(true);

      if (isLastChild()) {
        applyResolveTitle();
      }
    }
  };

  const evaluateGuardsAndResolvers = async () => {
    const initialStatus = manager.getGuardsStatusBeforeEvaluating();

    setGuardsStatus(initialStatus);
    notification.notifyGuardStatusChange(initialStatus);

    const guardStatus = await manager.evaluateGuards(isComponentStillAlive);
    if (guardStatus === null) {
      return;
    }

    notification.notifyGuardStatusChange(guardStatus);

    if (guardStatus == RouteHelperStatus.Loaded) {
      await evaluateResolvers();
    }

    setGuardsStatus(guardStatus);
  };



  //#region Triggers
  useEffect(() => {
    console.log('mount ' + (props.element as any).type.name);

    initCancellation(location.key);

    lastLocationKey.current = location.key;
    isComponentStillAlive.current = true;

    return () => {
      console.log('unmount ' + (props.element as any).type.name);
      isComponentStillAlive.current = false;
    };
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
      initCancellation(lastLocationKey.current);
    }
  }, [location]);

  //#endregion Triggers


  const elementToRender =
    parentContext.canStartToLoadWorkers &&
    guardsStatus === RouteHelperStatus.Loaded &&
    resolversStatus === RouteHelperStatus.Loaded ? (
      props.element
    ) : (
      <Outlet />
    );
  return (
    <RouteContext.Provider
      value={{
        routeResolverInfos: loadedResolverInfos,
        canStartToLoadWorkers: canChildStartWorkers,
        setCancelTitleResolverForParent: cancelTitleResolveForCurrentRoute
      }}
    >
      <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
    </RouteContext.Provider>
  );
};

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
