import React from 'react';

export const RouteContext = React.createContext<{
  routeResolverInfos: any;
  doWork: boolean;
  setCancelTitleResolverForParent: (cancellationKey: string) => void;
}>({
  routeResolverInfos: {},
  doWork: true,
  setCancelTitleResolverForParent: (_: string) => {},
});
