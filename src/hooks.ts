import React, { useRef } from 'react';
import { RouteContext } from './context';
import { HelperManager, RouteHelperStatus, StatusChangeReceiver } from './types';

export function useResolver<T = any>(): T {
  return React.useContext(RouteContext).routeResolverInfos;
}
