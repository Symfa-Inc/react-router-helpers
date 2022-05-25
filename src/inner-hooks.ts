import { useRef } from 'react';
import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from './types';

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
    const keys = Object.keys(resolvers).map(resolverKey => resolverKey);
    const promises = Object.keys(resolvers).map(resolverKey => resolvers[resolverKey]());
    const resultOfResolvers = await Promise.all(promises).catch(e => {
      console.error('Error in resolvers');
      console.error(e);
    });
    return (resultOfResolvers as []).reduce((acc, next, index) => {
      const key = keys[index];
      return { ...acc, [key]: next };
    }, {});
  }

  function getStatusBeforeEvaluating(): RouteHelperStatus {
    return guards.length === 0 ? RouteHelperStatus.Loaded : RouteHelperStatus.Loading;
  }

  return { evaluateGuards, getStatusBeforeEvaluating, evaluateResolvers };
}

export function useStatusNotification(receiver?: StatusChangeReceiver) {
  const stackRef = useRef<RouteHelperStatus[]>([]);
  return {
    notify: (status: RouteHelperStatus) => {
      if (receiver != null && stackRef.current[stackRef.current.length - 1] !== status) {
        stackRef.current.push(status);
        receiver(status);
      }
    },
  };
}
