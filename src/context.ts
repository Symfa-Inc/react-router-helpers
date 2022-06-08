import React from 'react';

export const RouteContext = React.createContext<{
  routeResolverInfos: any;
  canStartToLoadWorkers: boolean;
  cancelTitleResolvingForParent: (cancellationKey: string) => void;
  isTheFirstParent: boolean;
}>({
  routeResolverInfos: {},
  canStartToLoadWorkers: true,
  cancelTitleResolvingForParent: (_: string) => {},
  isTheFirstParent: true,
});
