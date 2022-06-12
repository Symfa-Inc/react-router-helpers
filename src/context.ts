import React from 'react';
import { RouteHelperStatus } from './types';

export const RouteContext = React.createContext<{
  routeResolverInfos: any;
  canStartToLoadWorkers: boolean;
  cancelTitleResolvingForParent: (cancellationKey: string) => void;
  isTheFirstParent: boolean;
  guardStatus: RouteHelperStatus;
  resolverStatus: RouteHelperStatus;
}>({
  routeResolverInfos: {},
  canStartToLoadWorkers: true,
  cancelTitleResolvingForParent: (_: string) => {},
  isTheFirstParent: true,
  guardStatus: RouteHelperStatus.Initial,
  resolverStatus: RouteHelperStatus.Initial,
});

export const OutletContext = React.createContext<{
  wasParentOutletLoaded: boolean;
  wasOutletUsedAlready: boolean;
  setWasUsed: () => void;
}>({
  wasParentOutletLoaded: false,
  wasOutletUsedAlready: false,
  setWasUsed: () => {},
});
