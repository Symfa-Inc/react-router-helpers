import React, { useRef } from 'react';
import { HelperManager, OnStatusChange, RouteHelperStatus, TitleResolverStatus } from './types';

const isNullOrUndefined = (obj?: any) => {
  return obj === null || obj === undefined;
};

export function useManager({ guards, resolvers, title, titleResolver }: HelperManager) {

  const previouslyResolvedTitleRef = useRef<string>('');
  // useEffect(() => {
  //   if (hasRouteTitle()) {
  //     const prevTitle = document.title;
  //     document.title = title!;
  //
  //     return () => {
  //       if (hasRouteTitle()) {
  //         document.title = prevTitle;
  //       }
  //     };
  //   }
  // }, []);

  async function evaluateGuards(isComponentAliveRef: React.MutableRefObject<boolean>): Promise<RouteHelperStatus | null> {
    for (const guard of guards) {
      try {
        if (!isComponentAliveRef.current) {
          return null;
        }
        const canActivate = await guard();
        if (!canActivate) {
          return RouteHelperStatus.Failed;
        }
      } catch (e) {
        console.error("Error in guards");
        console.error(e);
        return RouteHelperStatus.Failed;
      }
    }

    return RouteHelperStatus.Loaded;
  }

  async function evaluateResolvers() {
    let status: RouteHelperStatus = RouteHelperStatus.Loaded;

    const keys = Object.keys(resolvers).map(resolverKey => resolverKey);
    const promises = [];
    for (const resolverKey of Object.keys(resolvers)) {
      try {
        promises.push(resolvers[resolverKey]());
      } catch {
        status = RouteHelperStatus.Failed;
      }
    }

    const resultOfResolvers = await Promise.all(promises).catch(e => {
      console.error("Error in resolvers");
      console.error(e);
      status = RouteHelperStatus.Failed;
    });

    if (status === RouteHelperStatus.Failed) {
      return {
        status,
        infos: {}
      };
    }

    const infos = (resultOfResolvers as []).reduce((acc, next, index) => {
      const key = keys[index];
      return { ...acc, [key]: next };
    }, {});

    return {
      infos,
      status
    };
  }

  function getGuardsStatusBeforeEvaluating(): RouteHelperStatus {
    return guards.length === 0 ? RouteHelperStatus.Loaded : RouteHelperStatus.Loading;
  }

  function getResolversStatusBeforeEvaluating(): RouteHelperStatus {
    return Object.keys(resolvers).length === 0 ? RouteHelperStatus.Loaded : RouteHelperStatus.Loading;
  }

  function setTitleWithName(title: string) {
    // console.log('SET TITLE +++++++++++++++++++++++ ' + title);
    document.title = title;
  }

  function hasRouteTitleResolver(): boolean {
    return typeof titleResolver == "function";
  }

  function setTitle() {
    if (!isNullOrUndefined(title) && !hasRouteTitleResolver()) {
      setTitleWithName(title!);
    }
  }

  async function resolveTitle(isComponentAliveRef: React.MutableRefObject<boolean>) {
    if (hasRouteTitleResolver()) {
      if (previouslyResolvedTitleRef.current !== '') {
        setTitleWithName(previouslyResolvedTitleRef.current);
        return;
      }

      const titleFromResolver = await titleResolver!(TitleResolverStatus.RouteLoaded);
      previouslyResolvedTitleRef.current = titleFromResolver;

      if (isComponentAliveRef.current) {
        setTitleWithName(titleFromResolver);
      }
    }
  }

  return {
    evaluateGuards,
    getGuardsStatusBeforeEvaluating,
    evaluateResolvers,
    getResolversStatusBeforeEvaluating,
    resolveTitle,
    setTitle
  };
}

export function useStatusNotification(
  guardsStatusChangeReceiver?: OnStatusChange,
  resolversStatusChangeReceiver?: OnStatusChange
) {
  const stackGuardsRef = useRef<RouteHelperStatus[]>([]);
  const stackResolversRef = useRef<RouteHelperStatus[]>([]);

  return {
    notifyGuardStatusChange: (status: RouteHelperStatus) => {
      if (guardsStatusChangeReceiver != null && stackGuardsRef.current[stackGuardsRef.current.length - 1] !== status) {
        stackGuardsRef.current.push(status);
        guardsStatusChangeReceiver(status);
      }
    },
    notifyResolversStatusChange: (status: RouteHelperStatus) => {
      if (resolversStatusChangeReceiver != null && stackResolversRef.current[stackResolversRef.current.length - 1] !== status) {
        stackResolversRef.current.push(status);
        resolversStatusChangeReceiver(status);
      }
    }
  };
}
