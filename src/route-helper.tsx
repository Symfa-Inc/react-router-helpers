import React, {
  ComponentType,
  createElement,
  forwardRef,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { OutletProps } from 'react-router/lib/components';
import { OutletContext, RouteContext } from './context';
import { ErrorBoundary } from './ErrorBoundary';
import { useManager } from './inner-hooks';
import {
  HelperManager,
  HelperRouteObjectProps,
  LazyLoadingInnerStatus,
  OnlyHelperFields,
  RouteHelperStatus,
} from './types';

const LAZY_LOADING_NORMALIZATION_TIME_PARENT = 1;
const LAZY_LOADING_NORMALIZATION_TIME_CHILD = 10;

const MINIMAL_TIMEOUT_BEFORE_SHOW_LOADING = 100;

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

// Loading component re-renders in slow networks
// Cannot pass to loading component lazy loading status


export const RouteHelper = (props: HelperRouteObjectProps) => {

  //#region hooks usage
  const parentContext = useContext(RouteContext);
  const outletContext = useContext(OutletContext);
  const location = useLocation();
  //#endregion hooks usage

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

  const isFirstRender = useRef(true);
  const hasTaskForMinimalDurationTimer = useRef(false);

  const wasParentTitleResolvingCanceled = useRef(false);

  const setWorkersStartedNormalized = () => {
    if (!wereWorkersStartedRef.current) {
      wereWorkersStartedRef.current = true;
      setWorkersStarted(true);
    }
  };
  //#endregion Refs to prevent double calls

  //#region Outlet helpers
  const [isParent] = useState(false);

  const [canChildStartWorkers, setCanChildStartWorkers] = useState(false);

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
  //#endregion Outlet helpers

  //#region Workers infos
  const [guardStatus, setGuardStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolverStatus, setResolverStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [lazyComponentStatus, setLazyComponentStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);

  const [isMinimalDurationExceed, setMinimalDurationExceed] = useState(false);

  const [isReadyToMountElement, setReadyToMountElement] = useState(false);


  const setMinimalDurationTimer = () => {
    if (!hasTaskForMinimalDurationTimer.current) {
      hasTaskForMinimalDurationTimer.current = true;
      if (MINIMAL_TIMEOUT_BEFORE_SHOW_LOADING === null) {
        setMinimalDurationExceed(true);
      } else {
        setTimeout(() => {
          setMinimalDurationExceed(true);
        }, MINIMAL_TIMEOUT_BEFORE_SHOW_LOADING);
      }
    }
  };

  const setReadyToMountElementNormalized = () => {
    if (!isReadyToMountElement) {
      setTimeout(() => {
        setReadyToMountElement(true);
      }, 1);
    }

  };

  const setGuardStatusNormalized = (status: RouteHelperStatus) => {
    setGuardStatus(prevState => {
      if (guardStatus !== status) {
        return status;
      }
      return prevState;
    });
  };

  const setResolverStatusNormalized = (status: RouteHelperStatus) => {
    setResolverStatus(prevState => {
      if (resolverStatus !== status) {
        return status;
      }
      return prevState;
    });
  };

  const setLazyComponentStatusNormalized = (status: RouteHelperStatus) => {
    setLazyComponentStatus(prevState => {
      if (prevState !== status && prevState !== RouteHelperStatus.Failed) {
        return status;
      }
      return prevState;
    });
  };

  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});
  //#endregion Workers infos

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
      parentContext.cancelTitleResolvingForParent(cancellationKey);
    }
  };

  const initCancellationTitleResolvingForParent = (cancellationKey: string) => {
    cancelParentTitleResolving(cancellationKey);
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

  //#region workers

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolverStatusNormalized(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();


    setLoadedResolverInfos(infos);
    setResolverStatusNormalized(status);

    if (status === RouteHelperStatus.Loaded) {
      setCanChildStartWorkers(true);

      if (isLastChild()) {
        resolveTitle();
      }
    }
  };

  const evaluateGuardsAndResolvers = async () => {
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

    isComponentStillAlive.current = true;

    setTimeout(() => {
      isFirstRender.current = false;
    }, 10);

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

  useEffect(() => {
    if (parentContext.canStartToLoadWorkers && wereWorkersStartedRef.current) {
      setMinimalDurationTimer();
    }
  }, [parentContext, wereWorkersStarted]);

  //#endregion Triggers


  const defaultReadyToMountCondition = useMemo(() => {
    return parentContext.canStartToLoadWorkers &&
      guardStatus === RouteHelperStatus.Loaded &&
      resolverStatus === RouteHelperStatus.Loaded;
  }, [parentContext, guardStatus, resolverStatus]);

  //#region usual component handling
  if (props.loadElement == undefined) {
    if (defaultReadyToMountCondition) {
      setReadyToMountElementNormalized();
    }

    const elementToRender = defaultReadyToMountCondition && isReadyToMountElement ? (
      props.element
    ) : (
      <>
        {wereWorkersStarted && isMinimalDurationExceed && props.loadingComponent}
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
          status: RouteHelperStatus.Initial,
        }}
      >
        <RouteContext.Consumer>{() => elementToRender}</RouteContext.Consumer>
      </RouteContext.Provider>
    );
  }

  //#endregion usual component handling

  //#region lazy
  const [needToShowLoadingComponentToReceivedStatus, setNeedToShowLoadingComponentToReceivedStatus] = useState(false);
  const wasTaskForLazyLoadingNormalizationInited = useRef(false);
  const [lazyLoadingInnerStatus, setLazyLoadingInnerStatus] = useState(LazyLoadingInnerStatus.Initial);
  const wasSetRealTriggerForLazyLoading = useRef(false);

  const setLazyLoadingInnerStatusNormalized = (nextStatus: LazyLoadingInnerStatus) => {
    setLazyLoadingInnerStatus(prevState => {
      if (nextStatus !== prevState && prevState !== LazyLoadingInnerStatus.Failed) {
        return nextStatus;
      }
      return prevState;
    });
  };

  const loadingConditionToShowLazyLoading = useMemo(() => {
    return parentContext.canStartToLoadWorkers && wereWorkersStarted &&
      (guardStatus !== RouteHelperStatus.Loaded ||
        resolverStatus !== RouteHelperStatus.Loaded ||
        lazyLoadingInnerStatus !== LazyLoadingInnerStatus.Loaded);
  }, [parentContext, guardStatus, resolverStatus, lazyComponentStatus, wereWorkersStarted, lazyLoadingInnerStatus]);
  const lazyDefaultReadyToMountCondition = useMemo(() => {
    return defaultReadyToMountCondition &&
      lazyLoadingInnerStatus === LazyLoadingInnerStatus.Loaded;
  }, [defaultReadyToMountCondition, lazyComponentStatus]);


  const initLazyLoadingNormalization = () => {
    if (!wasTaskForLazyLoadingNormalizationInited.current) {
      wasTaskForLazyLoadingNormalizationInited.current = true;
      setLazyLoadingInnerStatusNormalized(LazyLoadingInnerStatus.ManualTriggeredLoading);

      setTimeout(() => {
        if (lazyLoadingInnerStatus !== LazyLoadingInnerStatus.RealTriggeredLoading) {
          setLazyLoadingInnerStatusNormalized(LazyLoadingInnerStatus.Loaded);
        }
      }, LAZY_LOADING_NORMALIZATION_TIME_PARENT);
    }
  };

  const markInitLazyLoadingFromFallback = () => {
    setNeedToShowLoadingComponentToReceivedStatus(true);
    if (!wasSetRealTriggerForLazyLoading.current) {
      wasSetRealTriggerForLazyLoading.current = true;
      setLazyLoadingInnerStatusNormalized(LazyLoadingInnerStatus.RealTriggeredLoading);
    }
  };


  //#region lazy triggers
  useEffect(() => {
    if (lazyDefaultReadyToMountCondition) {
      setTimeout(() => {
        if (needToShowLoadingComponentToReceivedStatus) {
          setNeedToShowLoadingComponentToReceivedStatus(false);
        }
      }, 10); // Need to delay because Loading component need to receive status before destroy
    }
  }, [lazyDefaultReadyToMountCondition]);

  useEffect(() => {
    if (defaultReadyToMountCondition) {
      initLazyLoadingNormalization();
    }
  }, [defaultReadyToMountCondition]);
  //#endregion lazy triggers

  //#region fallback methods
  const onDefaultFallbackInit = useCallback(() => {
    // wasLoadingTriggeredFromFallback.current = true;
    setNeedToShowLoadingComponentToReceivedStatus(true);
    setLazyComponentStatusNormalized(RouteHelperStatus.Loading);
  }, []);

  const onDefaultFallbackDestroy = useCallback(() => {
    setLazyComponentStatusNormalized(RouteHelperStatus.Loaded);
    setLazyLoadingInnerStatusNormalized(LazyLoadingInnerStatus.Loaded);
  }, []);

  const handleSetLazyError = useCallback((error: { message: string; stack: string; }, errorInfo: { componentStack: string; }) => {
    setLazyComponentStatusNormalized(RouteHelperStatus.Failed);
    setLazyLoadingInnerStatusNormalized(LazyLoadingInnerStatus.Failed);
    console.log('error ' + JSON.stringify(error) + JSON.stringify(errorInfo));
  }, []);
  //#endregion fallback methods


  const elementToRender = defaultReadyToMountCondition ? ( // need to keep defaultReadyToMountCondition to start lazy loading for lazy component
    props.loadElement
  ) : (
    <Outlet/>
  );

  const needToRenderLoading = (loadingConditionToShowLazyLoading && isMinimalDurationExceed) || needToShowLoadingComponentToReceivedStatus;
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
        status: RouteHelperStatus.Initial,
      }}
    >
      <RouteContext.Consumer>{() =>
        <>
          <ErrorBoundary onError={handleSetLazyError}>
            <React.Suspense
              fallback={<DefaultFallback onInit={onDefaultFallbackInit} onDestroy={onDefaultFallbackDestroy}/>}>
              {isMinimalDurationExceed && elementToRender}
            </React.Suspense>
          </ErrorBoundary>
          {needToRenderLoading &&
            (<div style={{ display: !lazyDefaultReadyToMountCondition ? 'block' : 'none' }}>
              {props.loadingComponent}
            </div>)}
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


export type PreloadableComponent<T extends ComponentType<any>> = T & {
  preload: () => Promise<void>;
};

export default function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  const LazyComponent = lazy(factory);
  let factoryPromise: Promise<void> | undefined;
  let LoadedComponent: T | undefined;

  const Component = (forwardRef(function LazyWithPreload(props, ref) {
    return createElement(
      LoadedComponent ?? LazyComponent,
      Object.assign(ref ? { ref } : {}, props) as any,
    );
  }) as any) as PreloadableComponent<T>;

  Component.preload = () => {
    if (!factoryPromise) {
      factoryPromise = factory().then((module) => {
        LoadedComponent = module.default;
      });
    }

    return factoryPromise;
  };
  return Component;
}
