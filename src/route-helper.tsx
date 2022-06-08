import React, { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RouteContext } from "./context";
import { useManager, useStatusNotification } from "./inner-hooks";
import { HelperManager, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from "./types";

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


export const RouteHelper = (props: HelperRouteObjectProps) => {

  //#region hooks usage
  const parentContext = useContext(RouteContext);
  const location = useLocation();
  const notification = useStatusNotification(props.onGuardStatusChange, props.onResolverStatusChange);
  //#endregion hooks usage

  const COMPONENT_NAME = (props.element as any).type.name;

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
  const manager = useManager(initializeManagerParams());

  const isComponentStillAlive = useRef(true);
  const lastLocationKey = useRef<string>("");

  //#region Refs to prevent double calls
  const wereWorkersStarted = useRef(false);
  const wasParentTitleResolvingCanceled = useRef(false);
  //#endregion Refs to prevent double calls

  //#region Workers infos
  const [guardsStatus, setGuardsStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolversStatus, setResolversStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});
  //#endregion Workers infos

  const [canChildStartWorkers, setCanChildStartWorkers] = useState(false);

  //#region titleResolve
  const lastCancellationKeyFromChild = useRef("");

  const setCancellationKeyForCurrentRoute = (cancellationKey: string) => {
    lastCancellationKeyFromChild.current = cancellationKey;
  };

  const resolveTitle = () => {
    manager.resolveTitle(isComponentStillAlive);
  };

  const resetCancellationTitleResolvingForParent = () => {
    wasParentTitleResolvingCanceled.current = false;
  };

  const cancelParentTitleResolving = (cancellationKey: string) => {
    if (!wasParentTitleResolvingCanceled.current) {
      wasParentTitleResolvingCanceled.current = true;
      parentContext.cancelTitleResolvingForParent(cancellationKey);
    }
  };

  const initCancellationTitleResolvingForParent = (cancellationKey: string) => {
    cancelParentTitleResolving(cancellationKey);
    // console.log('initCancellationTitleResolvingForParent +++++++++++++++++++++++ ');
    if (isLastChild()) {
      console.log('initCancellationTitleResolvingForParent +++++++++++++++++++++++ ');
      manager.setTitle();

      // If route was already loaded
      if (resolversStatus === RouteHelperStatus.Loaded) {
        // TODO: Navigate back, BUG with setting title back do we need to solve it?
        resolveTitle();
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
    const isLastChild = lastLocationKey.current !== lastCancellationKeyFromChild.current;
    console.log('isLastChild +++++++++++++++++++++++ ' + COMPONENT_NAME + ' ' + isLastChild);
    return lastLocationKey.current !== lastCancellationKeyFromChild.current;
  };

  //#region workers

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolversStatus(initialStatus);
    notification.notifyResolversStatusChange(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();


    setLoadedResolverInfos(infos);
    setResolversStatus(status);

    notification.notifyResolversStatusChange(status);

    console.log('AFTER RESOLVERS ' + RouteHelperStatus[status] + COMPONENT_NAME);

    if (status === RouteHelperStatus.Loaded) {
      setCanChildStartWorkers(true);

      if (isLastChild()) {
        resolveTitle();
      }
    }
  };

  const evaluateGuardsAndResolvers = async () => {
    const initialStatus = manager.getGuardsStatusBeforeEvaluating();

    console.log('send initial status ' + RouteHelperStatus[initialStatus] + " " + COMPONENT_NAME);

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

  //#endregion workers



  //#region Triggers
  useEffect(() => {
    console.log('mount ' + COMPONENT_NAME);
    lastLocationKey.current = location.key;

    initCancellationTitleResolvingForParent(location.key);

    isComponentStillAlive.current = true;

    return () => {
      console.log('unmount ' + COMPONENT_NAME);
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
      resetCancellationTitleResolvingForParent();
      initCancellationTitleResolvingForParent(lastLocationKey.current);
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
        cancelTitleResolvingForParent: setCancellationKeyForCurrentRoute
      }}
    >
      <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
    </RouteContext.Provider>
  );
};

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
