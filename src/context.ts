import React from 'react';

export const RouteContext = React.createContext<{
  routeResolverInfos: any;
  canStartToLoadWorkers: boolean;
  cancelTitleResolvingForParent: (cancellationKey: string) => void;
}>({
  routeResolverInfos: {},
  canStartToLoadWorkers: true,
  cancelTitleResolvingForParent: (_: string) => {},
});
