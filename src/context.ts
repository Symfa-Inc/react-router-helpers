import React from 'react';

export const RouteContext = React.createContext<{ routeResolverInfos: any }>({
  routeResolverInfos: {},
});
