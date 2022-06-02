import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RouteContext } from './context';
import { useManager, useStatusNotification } from './inner-hooks';
import { HelperManager, HelperRouteObjectProps, OnlyHelperFields, RouteHelperStatus } from './types';

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

  const wasWorkStarted = useRef(false);
  const wasParentTitleResolveCanceledRef = useRef(false);
  const wasTitleResolveCanceledRef = useRef(false);
  // const isFirstLoadRef = useRef(true);
  const lastLocationRef = useRef<string>('');

  const lastCancellationKey = useRef('');
  const lastCancellationKeyFromChild = useRef('');

  const manager = useManager(initializeManagerParams());

  const [guardsStatus, setGuardsStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [resolversStatus, setResolversStatus] = useState<RouteHelperStatus>(RouteHelperStatus.Initial);
  const [loadedResolverInfos, setLoadedResolverInfos] = useState({});

  // const [isCancelTitleResolver, setCancelTitleResolver] = useState(false);

  const [childNeedToDoWork, setChildNeedToDoWork] = useState(false);

  const notification = useStatusNotification(props.onGuardStatusChange, props.onResolverStatusChange);

  const cancelTitleResolver = (cancellationKey: string) => {
    wasTitleResolveCanceledRef.current = true;
    lastCancellationKeyFromChild.current = cancellationKey;
  };

  useEffect(() => {
    if (lastLocationRef.current !== '' && lastLocationRef.current !== location.key) {
      // if () {}
      lastLocationRef.current = location.key;
      if (lastLocationRef.current !== lastCancellationKeyFromChild.current) {
        console.log('UPDDATE ' + (props.element as any).type.name);
        resetCancellationTitleResolver();
        initCanc(lastLocationRef.current);
      }
    }

  }, [location]);

  const resetCancellationTitleResolver = () => {
    wasParentTitleResolveCanceledRef.current = false;
    wasTitleResolveCanceledRef.current = false;
  };

  const evaluateResolvers = async () => {
    const initialStatus = manager.getResolversStatusBeforeEvaluating();

    setResolversStatus(initialStatus);
    notification.notifyResolversStatusChange(initialStatus);

    const { status, infos } = await manager.evaluateResolvers();

    console.log('before call resolveTitle ' + (props.element as any).type.name);

    setLoadedResolverInfos(infos);
    setResolversStatus(status);

    notification.notifyResolversStatusChange(status);
    setChildNeedToDoWork(true);
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

  useEffect(() => {
    initCanc(location.key);
    lastLocationRef.current = location.key;
    // isFirstLoadRef.current = false;
    // (async () => {
    //   await evaluateGuardsAndResolvers();
    // })();
  }, []);

  const initCanc = (cancellationKey: string) => {
    if (!wasParentTitleResolveCanceledRef.current) {
      // console.log('cancel from ' + (props.element as any).type.name);
      wasParentTitleResolveCanceledRef.current = true;
      parentContext.setCancelTitleResolverForParent(cancellationKey);
    }

    if (!wasTitleResolveCanceledRef.current) {
      //   // TODO: BUG if titleResolver works for too long need to block UI?
      //   // TODO: IF you hit direct path, should parents set their own titles?
      //   // TODO: Navigate back, BUG with setting title back do we need to solve it?
      //   console.log('call resolveTitle ' + (props.element as any).type.name);
      manager.resolveTitle();
    }
  };

  useEffect(() => {
    // parentContext.setCancelTitleResolverForParent();
    if (parentContext.doWork && !wasWorkStarted.current) {
      wasWorkStarted.current = true;
      evaluateGuardsAndResolvers();
    }
    // console.log(parentContext.doWork, (props.element as any).type.name);
  }, [parentContext]);

  // if (guardsStatus == RouteHelperStatus.Loaded && resolversStatus === RouteHelperStatus.Loaded) {
  //   return (
  //     <RouteContext.Provider
  //       value={{
  //         routeResolverInfos: loadedResolverInfos,
  //         doWork: childNeedToDoWork,
  //       }}
  //     >
  //       <RouteContext.Consumer>{() => props.element}</RouteContext.Consumer>
  //     </RouteContext.Provider>
  //   );
  // }

  const elementToRender =
    parentContext.doWork && guardsStatus === RouteHelperStatus.Loaded && resolversStatus === RouteHelperStatus.Loaded ? (
      props.element
    ) : (
      <Outlet />
    );
  return (
    <RouteContext.Provider
      value={{
        routeResolverInfos: loadedResolverInfos,
        doWork: childNeedToDoWork,
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
