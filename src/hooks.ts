import React, { useEffect } from "react";
import { RouteContext } from "./context";

export function useResolver<T = any>(): T {
  return React.useContext(RouteContext).routeResolverInfos;
}

export function useGuardStatus() {
  return React.useContext(RouteContext).guardStatus;
}

export function useResolverStatus() {
  return React.useContext(RouteContext).resolverStatus;
}
