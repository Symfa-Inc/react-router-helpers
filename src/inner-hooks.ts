import { useEffect, useRef } from "react";
import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from "./types";

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

  async function evaluateGuards(): Promise<RouteHelperStatus> {
    for (const guard of guards) {
      try {
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
    document.title = title;
  }

  function hasRouteTitle(): boolean {
    return !isNullOrUndefined(title) || typeof titleResolver == "function";
  }

  function setTitle() {
    if (!isNullOrUndefined(title)) {
      setTitleWithName(title!);
    }
  }

  async function resolveTitle() {
    if (typeof titleResolver == "function") {
      if (previouslyResolvedTitleRef.current !== '') {
        setTitleWithName(previouslyResolvedTitleRef.current);
        return;
      }

      const titleFromResolver = await titleResolver();
      previouslyResolvedTitleRef.current = titleFromResolver;

      setTitleWithName(titleFromResolver);
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
  guardsStatusChangeReceiver?: StatusChangeReceiver,
  resolversStatusChangeReceiver?: StatusChangeReceiver
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
