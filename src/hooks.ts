import { useRef } from 'react';
import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from './types';

export function useManager({ guards }: HelperManager) {
  async function evaluateGuards(): Promise<RouteHelperStatus> {
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate();
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

  // async function loadResolvers() {
  //   const keys = Object.keys(resolvers).map(resolverKey => resolverKey);
  //   const promises = Object.keys(resolvers).map(resolverKey => resolvers[resolverKey].resolve());
  //   const resultOfResolvers = await Promise.all(promises).catch(e => {
  //     console.error('Error in resolvers');
  //     console.error(e);
  //   });
  //   return (resultOfResolvers as []).reduce((acc, next, index) => {
  //     const key = keys[index];
  //     return { ...acc, [key]: next };
  //   }, {});
  // }

  // function getRedirectUrl(): string | undefined {
  //   if (infoAboutComponent.current[pathname].redirectUrl) {
  //     return infoAboutComponent.current[pathname].redirectUrl as string;
  //   };
  // }
  function getStatusBeforeEvaluating(): RouteHelperStatus {
    return guards.length === 0 ? RouteHelperStatus.Loaded : RouteHelperStatus.Loading;
  }

  return { evaluateGuards, getStatusBeforeEvaluating };
}

export function useStatusNotification(receiver?: StatusChangeReceiver) {
  const stackRef = useRef<RouteHelperStatus[]>([]);
  return {
    notify: (status: RouteHelperStatus) => {
      if (receiver != null && stackRef.current[stackRef.current.length - 1] !== status) {
        stackRef.current.push(status);
        receiver(status);
      }
    }
  };
};

type Fn = (status: RouteHelperStatus) => void;
