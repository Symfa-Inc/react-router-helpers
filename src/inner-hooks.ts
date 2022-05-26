import { useRef } from 'react';
import { Guard, HelperManager, InnerGuard, RouteHelperStatus, StatusChangeReceiver } from './types';

export function useManager({ guards, resolvers }: HelperManager) {
  async function evaluateGuards(): Promise<RouteHelperStatus> {
    for (const guard of guards) {
      try {
        const canActivate = await guard();
        if (!canActivate) {
          return RouteHelperStatus.Failed;
        }
      } catch (e) {
        console.error('Error in guards');
        console.error(e);
        return RouteHelperStatus.Failed;
      }
    }

    return RouteHelperStatus.Loaded;
  }

  async function evaluateResolvers() {
    let status = RouteHelperStatus.Loaded;

    const keys = Object.keys(resolvers).map(resolverKey => resolverKey);
    const promises = Object.keys(resolvers).map(resolverKey => resolvers[resolverKey]());

    const resultOfResolvers = await Promise.all(promises).catch(e => {
      console.error('Error in resolvers');
      console.error(e);
      status = RouteHelperStatus.Failed;
    });

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

  return {
    evaluateGuards,
    getGuardsStatusBeforeEvaluating,
    evaluateResolvers,
    getResolversStatusBeforeEvaluating
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
    },
  };
}
