import React from "react";
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

export function useLazyComponentStatus() {
  return React.useContext(RouteContext).lazyComponentStatus;
}

export function useStatus() {
  return React.useContext(RouteContext).status;
}
