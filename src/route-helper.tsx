import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { OutletProps } from 'react-router/lib/components';
import { OutletContext, RouteContext } from './context';
import { useManager } from './inner-hooks';
import { HelperManager, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from './types';

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
  const outletContext = useContext(OutletContext);
  const location = useLocation();
  //#endregion hooks usage

  const locationOnInit = useRef<string>("");

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
  };
  const manager = useManager(initializeManagerParams());

  const isComponentStillAlive = useRef(true);
  const lastLocationKey = useRef<string>('');

  //#region Refs to prevent double calls
  // const wereWorkersStarted = useRef(false);
  const [wereWorkersStarted, setWorkersStarted] = useState(false);
  const wasParentTitleResolvingCanceled = useRef(false);
  //#endregion Refs to prevent double calls

  //#region Workers infos
  const [guardStatus, setGuardStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolverStatus, setResolverStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [isReadyToMountElement, setReadyToMountElement] = useState(false);

  const setReadyToMountElementNormalized = () => {
    if (!isReadyToMountElement) {
      setTimeout(() => {
        setReadyToMountElement(true);
      }, 1);
    }
  };

  const setGuardStatusNormalized = (status: RouteHelperStatus) => {
    if (guardStatus !== status) {
      setGuardStatus(status);
    }
  };

  const setResolverStatusNormalized = (status: RouteHelperStatus) => {
    if (resolverStatus !== status) {
      setResolverStatus(status);
    }
  };

  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});
  //#endregion Workers infos

  const [isParent] = useState(false);

  const [canChildStartWorkers, setCanChildStartWorkers] = useState(false);

  //#region titleResolve
  const lastCancellationKeyFromChild = useRef('');

  const setCancellationKeyForCurrentRoute = (cancellationKey: string) => {
    lastCancellationKeyFromChild.current = cancellationKey;

    // lastLocationKey.current = cancellationKey;
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
      // console.log('cancelParentTitleResolving ' + COMPONENT_NAME);
      parentContext.cancelTitleResolvingForParent(cancellationKey);
    }
  };

  const initCancellationTitleResolvingForParent = (cancellationKey: string) => {
    cancelParentTitleResolving(cancellationKey);
    // console.log('initCancellationTitleResolvingForParent +++++++++++++++++++++++ ');
    if (isComponentParentOrParentOutletWasInitialized() && isLastChild()) {
      // console.log('initCancellationTitleResolvingForParent ' + COMPONENT_NAME);
      manager.setTitle();

      // If route was already loaded
      if (resolverStatus === RouteHelperStatus.Loaded) {
        // TODO: Navigate back, BUG with setting title back do we need to solve it?
        resolveTitle();
      }
    }
  };
  //#endregion titleResolve


  const isUpdateOnNewLocation = () => {
    const isNew = lastLocationKey.current !== '' && lastLocationKey.current !== location.key;
    // console.log(`isUpdateOnNewLocation  ${COMPONENT_NAME}  ${location.key} ${lastLocationKey.current}`);
    if (isNew) {
      lastLocationKey.current = location.key;
    }
    return isNew;
  };

  const isLastChild = () => {
    const isLastChild = lastLocationKey.current !== lastCancellationKeyFromChild.current;
    // console.log('isLastChild +++++++++++++++++++++++ ' + COMPONENT_NAME + ' ' + isLastChild);
    // console.log(`isLastChild ${COMPONENT_NAME} curr: ${lastLocationKey.current} from child loc: ${lastCancellationKeyFromChild.current}`);
    return lastLocationKey.current !== lastCancellationKeyFromChild.current;
  };

  const isComponentParentOrParentOutletWasInitialized = () => {
    console.log(`outletContext.wasParentOutletLoaded ${outletContext.wasParentOutletLoaded} ${COMPONENT_NAME}`);
    const wasOutletLoadedAndWasNotUsedAlready = (outletContext.wasParentOutletLoaded && !outletContext.wasOutletUsedAlready);
    if (wasOutletLoadedAndWasNotUsedAlready) {
      outletContext.setWasUsed();
    }

    return parentContext.isTheFirstParent || wasOutletLoadedAndWasNotUsedAlready;
  };

  //#region workers

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolverStatusNormalized(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();


    setLoadedResolverInfos(infos);
    setResolverStatusNormalized(status);

    // console.log('AFTER RESOLVERS ' + RouteHelperStatus[status] + COMPONENT_NAME);

    if (status === RouteHelperStatus.Loaded) {
      setCanChildStartWorkers(true);

      if (isLastChild()) {
        resolveTitle();
      }
    }
  };

  const evaluateGuardsAndResolvers = async () => {
    const initialStatus = manager.getGuardsStatusBeforeEvaluating();

    // console.log('send initial status ' + RouteHelperStatus[initialStatus] + " " + COMPONENT_NAME);

    setGuardStatusNormalized(initialStatus);

    const guardStatus = await manager.evaluateGuards(isComponentStillAlive);
    if (guardStatus === null) {
      return;
    }

    if (guardStatus == RouteHelperStatus.Loaded) {
      await evaluateResolvers();
    }

    setGuardStatusNormalized(guardStatus);
  };

  //#endregion workers

  // const startDoingWork = () => {
  //   evaluateGuardsAndResolvers();
  // };

  //#region Triggers
  useEffect(() => {
    // console.log('mount ' + COMPONENT_NAME);
    lastLocationKey.current = location.key;

    initCancellationTitleResolvingForParent(location.key);
    locationOnInit.current = location.pathname;

    isComponentStillAlive.current = true;

    return () => {
      // console.log('unmount ' + COMPONENT_NAME);
      isComponentStillAlive.current = false;
    };
  }, []);

  useEffect(() => {
    console.log('PARENT CONTEXT CHANGED ' + COMPONENT_NAME + ' ' + isComponentParentOrParentOutletWasInitialized());
    if (parentContext.canStartToLoadWorkers &&
      isComponentParentOrParentOutletWasInitialized() &&
      !wereWorkersStarted
    ) {

      setWorkersStarted(true);
      evaluateGuardsAndResolvers();
    }
  }, [parentContext]);



  // useEffect(() => {
  //   if (isComponentParentOrParentOutletWasInitialized()) {
  //     console.log('OUTLET CONTEXT CHANGED + ' + COMPONENT_NAME);
  //   }
  //   // if (parentContext.canStartToLoadWorkers && !wereWorkersStarted.current) {
  //   //   wereWorkersStarted.current = true;
  //   //   evaluateGuardsAndResolvers();
  //   // }
  // }, [outletContext]);

  useEffect(() => {
    if (isUpdateOnNewLocation() && isComponentParentOrParentOutletWasInitialized()) {
      // console.log('UPDATE AND CANCEL ' + COMPONENT_NAME);
      resetCancellationTitleResolvingForParent();
      initCancellationTitleResolvingForParent(lastLocationKey.current);

      // if (location.pathname.indexOf(locationOnInit.current) === -1) {
      //   console.log("RUN GUARDS AGAIN " + COMPONENT_NAME);
      // }

      // if (parentContext.canStartToLoadWorkers) {
      //   // wereWorkersStarted.current = false;
      //
      //   evaluateGuardsAndResolvers();
      // }

    }
  }, [location, outletContext]);

  //#endregion Triggers



  // const DefaultWrapper: FC<PropsWithChildren> = (props) => {
  //   const elementToRender =
  //     parentContext.canStartToLoadWorkers &&
  //     guardStatus === RouteHelperStatus.Loaded &&
  //     resolverStatus === RouteHelperStatus.Loaded ? (
  //       props.children
  //     ) : (
  //       <Outlet/>
  //     );
  //   return (
  //     <RouteContext.Provider
  //       value={{
  //         routeResolverInfos: loadedResolverInfos,
  //         canStartToLoadWorkers: canChildStartWorkers,
  //         cancelTitleResolvingForParent: setCancellationKeyForCurrentRoute,
  //         isTheFirstParent: isParent,
  //         guardStatus,
  //         resolverStatus,
  //       }}
  //     >
  //       <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
  //     </RouteContext.Provider>
  //   )
  // };


  // if (props.loadElement != undefined) {
  //   const LazyComponent = React.lazy(() => props.loadElement!());
  //
  //   return (
  //     <DefaultWrapper>
  //       <React.Suspense fallback={<>Loading...</>}>
  //         <LazyComponent />
  //       </React.Suspense>
  //     </DefaultWrapper>
  //   );
  // }



  // const WW = React.memo(WrappedLoadingComponent);

  // console.log('RENDER ' + Date.now());

  const WrappedLoadingComponent = () => {
    return (<>
      {wereWorkersStarted && props.loadingComponent}
      <Outlet/>
    </>);
  };

  const readyToMountElementCondition = parentContext.canStartToLoadWorkers &&
    guardStatus === RouteHelperStatus.Loaded &&
    resolverStatus === RouteHelperStatus.Loaded;

  if (readyToMountElementCondition) {
    setReadyToMountElementNormalized();
  }

  const elementToRender = readyToMountElementCondition && isReadyToMountElement? (
      props.element
    ) : (
      <>
        {wereWorkersStarted && props.loadingComponent}
        <Outlet />
      </>
    );

  return (
    <RouteContext.Provider
      value={{
        routeResolverInfos: loadedResolverInfos,
        canStartToLoadWorkers: canChildStartWorkers,
        cancelTitleResolvingForParent: setCancellationKeyForCurrentRoute,
        isTheFirstParent: isParent,
        guardStatus,
        resolverStatus,
      }}
    >
      <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
    </RouteContext.Provider>
  )
};



export const HelperOutlet = (props: OutletProps) => {
  const [wasParentOutletLoaded] = useState(true);
  const [wasOutletUsed, setWasOutletUsed] = useState(false);

  const setWasOutletUsedNormalized = () => {
    if (!wasOutletUsed) {
      setWasOutletUsed(true);
    }
  };

  return (
    <OutletContext.Provider value={{
      wasParentOutletLoaded,
      wasOutletUsedAlready: wasOutletUsed,
      setWasUsed: setWasOutletUsedNormalized
    }}>
      <Outlet {...props} />
    </OutletContext.Provider>);
};

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};
