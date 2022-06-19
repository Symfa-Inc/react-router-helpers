import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { OutletProps } from 'react-router/lib/components';
import { OutletContext, RouteContext } from './context';
import { ErrorBoundary } from './ErrorBoundary';
import { useManager } from './inner-hooks';
import { HelperManager, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from './types';

const LAZY_LOADING_NORMALIZATION_TIME = 150;

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

  const locationOnInit = useRef<string>('');

  const COMPONENT_NAME = (props.element as any)?.type?.name;

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
  const wereWorkersStartedRef = useRef(false); // Need to duplicate state with ref, to prevent double calls in dev mode
  const [wereWorkersStarted, setWorkersStarted] = useState(wereWorkersStartedRef.current);

  const wasParentTitleResolvingCanceled = useRef(false);

  const setWorkersStartedNormalized = () => {
    if (!wereWorkersStartedRef.current) {
      wereWorkersStartedRef.current = true;
      setWorkersStarted(true);
    }
  };
  //#endregion Refs to prevent double calls

  //#region Workers infos
  const [guardStatus, setGuardStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolverStatus, setResolverStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [lazyComponentStatus, setLazyComponentStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);

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

  const setLazyComponentStatusNormalized = (status: RouteHelperStatus) => {
    if (lazyComponentStatus !== status) {
      setLazyComponentStatus(status);
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
    console.log('initCancellationTitleResolvingForParent ' + COMPONENT_NAME);
    if (isComponentParentOrParentOutletWasInitialized() && isLastChild()) {
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
    if (isNew) {
      lastLocationKey.current = location.key;
    }
    return isNew;
  };

  const isLastChild = () => {
    return lastLocationKey.current !== lastCancellationKeyFromChild.current;
  };

  const isComponentParentOrParentOutletWasInitializedAndNotUsed = () => {
    const wasOutletLoadedAndWasNotUsedAlready = (outletContext.wasParentOutletLoaded && !outletContext.wasOutletUsedAlready);
    if (wasOutletLoadedAndWasNotUsedAlready) {
      outletContext.setWasUsed();
    }

    return parentContext.isTheFirstParent || wasOutletLoadedAndWasNotUsedAlready;
  };

  const isComponentParentOrParentOutletWasInitialized = () => {

    return parentContext.isTheFirstParent || outletContext.wasParentOutletLoaded;
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
    console.log('evaluateGuardsAndResolvers ' + COMPONENT_NAME);
    const initialStatus = manager.getGuardsStatusBeforeEvaluating();


    setGuardStatusNormalized(initialStatus);

    const guardStatus = await manager.evaluateGuards(isComponentStillAlive);
    if (guardStatus === null) {
      return;
    }

    setGuardStatusNormalized(guardStatus);

    if (guardStatus == RouteHelperStatus.Loaded) {
      await evaluateResolvers();
    }
  };

  //#endregion workers


  //#region Triggers

  useEffect(() => {
    lastLocationKey.current = location.key;

    initCancellationTitleResolvingForParent(location.key);
    locationOnInit.current = location.pathname;

    isComponentStillAlive.current = true;

    return () => {
      isComponentStillAlive.current = false;
      wereWorkersStartedRef.current = false;

      outletContext.resetOutletState();
    };
  }, []);

  useEffect(() => {
    if (parentContext.canStartToLoadWorkers &&
      isComponentParentOrParentOutletWasInitializedAndNotUsed() &&
      !wereWorkersStartedRef.current
    ) {
      setWorkersStartedNormalized();
      evaluateGuardsAndResolvers();
    }
  }, [parentContext]);


  useEffect(() => {
    if (isUpdateOnNewLocation() && isComponentParentOrParentOutletWasInitialized()) {
      resetCancellationTitleResolvingForParent();
      initCancellationTitleResolvingForParent(lastLocationKey.current);
    }
  }, [location, outletContext]);

  //#endregion Triggers


  const defaultReadyToMountCondition = useMemo(() => {
    return parentContext.canStartToLoadWorkers &&
      guardStatus === RouteHelperStatus.Loaded &&
      resolverStatus === RouteHelperStatus.Loaded;
  }, [parentContext, guardStatus, resolverStatus]);

  const handleSetLazyError = (error: { message:string; stack: string; }, errorInfo: { componentStack: string; }) => {
    setLazyComponentStatusNormalized(RouteHelperStatus.Failed);
    console.log('error ' + JSON.stringify(error) + JSON.stringify(errorInfo));
  };

  //#region usual component handling
  if (props.loadElement == undefined) {
    if (defaultReadyToMountCondition) {
      setReadyToMountElementNormalized();
    }

    const elementToRender = defaultReadyToMountCondition && isReadyToMountElement ? (
      props.element
    ) : (
      <>
        {wereWorkersStarted && props.loadingComponent}
        <Outlet/>
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
          lazyComponentStatus,
          status: RouteHelperStatus.Initial
        }}
      >
        <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
      </RouteContext.Provider>
    );
  }

  //#endregion usual component handling

  //#region lazy
  const wasLoadingTriggeredFromFallback = useRef(false);
  const wasLazyLoadingTimerForNormalizingSet = useRef(false);
  const wasLazyLoadingNormalizationInitiated = useRef(false);

  const loadingConditionToShowLazyLoading = useMemo(() => {
    return parentContext.canStartToLoadWorkers && wereWorkersStarted &&
      (guardStatus !== RouteHelperStatus.Loaded ||
        resolverStatus !== RouteHelperStatus.Loaded ||
        lazyComponentStatus !== RouteHelperStatus.Loaded);
  }, [parentContext, guardStatus, resolverStatus, lazyComponentStatus, wereWorkersStarted]);
  const lazyDefaultReadyToMountCondition = useMemo(() => {
    return defaultReadyToMountCondition &&
      resolverStatus === RouteHelperStatus.Loaded;
  }, [defaultReadyToMountCondition, lazyComponentStatus]);

  const initNormalizationForLazyLoading = () => {
    if (!wasLazyLoadingNormalizationInitiated.current) {
      wasLazyLoadingNormalizationInitiated.current = true;
      setLazyComponentStatusNormalized(RouteHelperStatus.Loading);
    }

    if (!wasLazyLoadingTimerForNormalizingSet.current) {
      wasLazyLoadingTimerForNormalizingSet.current = true;

      setTimeout(() => {
        if (!wasLoadingTriggeredFromFallback.current) {
          setLazyComponentStatusNormalized(RouteHelperStatus.Loaded);
        }
      }, LAZY_LOADING_NORMALIZATION_TIME);
    }
  };

  useEffect(() => {
    if (defaultReadyToMountCondition) {
      initNormalizationForLazyLoading();
    }
  }, [defaultReadyToMountCondition]);

  useEffect(() => {
    if (lazyDefaultReadyToMountCondition) {
      setReadyToMountElementNormalized();
    }
  }, [lazyDefaultReadyToMountCondition]);

  //#region fallback methods
  const onDefaultFallbackInit = useCallback(() => {
    wasLoadingTriggeredFromFallback.current = true;
    setLazyComponentStatusNormalized(RouteHelperStatus.Loading);
  }, []);
  const onDefaultFallbackDestroy = useCallback(() => {
    setLazyComponentStatusNormalized(RouteHelperStatus.Loaded);
  }, []);
  //#endregion fallback methods


  const elementToRender = defaultReadyToMountCondition && isReadyToMountElement ? ( // need to keep defaultReadyToMountCondition to start lazy loading for lazy component
    props.loadElement
  ) : (
    <Outlet/>
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
        lazyComponentStatus,
        status: RouteHelperStatus.Initial
      }}
    >
      <RouteContext.Consumer>{() =>
        <>
          <ErrorBoundary onError={handleSetLazyError}>
            <React.Suspense
              fallback={<DefaultFallback onInit={onDefaultFallbackInit} onDestroy={onDefaultFallbackDestroy}/>}>
              {!loadingConditionToShowLazyLoading && elementToRender}
              {loadingConditionToShowLazyLoading && props.loadingComponent}
            </React.Suspense>
          </ErrorBoundary>
        </>}

      </RouteContext.Consumer>
    </RouteContext.Provider>
  );
  //#endregion lazy
};


export const HelperOutlet = (props: OutletProps) => {
  const [wasParentOutletLoaded] = useState(true);
  const [wasOutletUsed, setWasOutletUsed] = useState(false);

  const setWasOutletUsedNormalized = () => {
    if (!wasOutletUsed) {
      setWasOutletUsed(true);
    }
  };

  const resetOutletState = () => {
    setWasOutletUsed(false);
  };

  return (
    <OutletContext.Provider value={{
      wasParentOutletLoaded,
      wasOutletUsedAlready: wasOutletUsed,
      setWasUsed: setWasOutletUsedNormalized,
      resetOutletState,
    }}>
      <Outlet {...props} />
    </OutletContext.Provider>);
};

export const wrapRouteToHelper = (props: OnlyHelperFields) => {
  return <RouteHelper {...props} />;
};

const DefaultFallback = React.memo<{ onInit: () => void; onDestroy: () => void; }>((props) => {
  useEffect(() => {
    props.onInit();
    return () => {
      props.onDestroy();
    };
  }, []);


  return <></>;
});
