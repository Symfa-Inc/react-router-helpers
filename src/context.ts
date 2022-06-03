import React from 'react';

export const RouteContext = React.createContext<{
  routeResolverInfos: any;
  canStartToLoadWorkers: boolean;
  setCancelTitleResolverForParent: (cancellationKey: string) => void;
}>({
  routeResolverInfos: {},
  canStartToLoadWorkers: true,
  setCancelTitleResolverForParent: (_: string) => {},
});
