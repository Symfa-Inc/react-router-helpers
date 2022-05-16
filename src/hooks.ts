import { Guard } from "./types";

interface HelperManager {
  // resolvers: PropsResolvers;
  guards: Guard[];
  // pathname: string;
  // redirectUrl?: string;
}

export enum Status {
  Initial,
  Loading,
  Loaded,
  Failed,
}

export function useManager({ guards }: HelperManager) {
  // const infoAboutComponent = useRef<InfoAboutComponent>({});
  // if (!infoAboutComponent.current[pathname]) {
  //   infoAboutComponent.current[pathname] = {
  //     resolvers,
  //     guards,
  //     pathname,
  //     props: {},
  //     redirectUrl,
  //   };
  // }

  async function evaluateGuards(): Promise<Status> {
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate();
        if (!canActivate) {
          return Status.Failed;
        }
      } catch (e) {
        console.error('Error in guards');
        console.error(e);
        return Status.Failed;
      }
    }

    return Status.Loaded;
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
  function getStatusBeforeEvaluating(): Status {

  }

  return { evaluateGuards, getStatusBeforeEvaluating };
}
