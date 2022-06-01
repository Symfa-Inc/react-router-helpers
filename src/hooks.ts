import React, { useEffect } from "react";
import { RouteContext } from "./context";

export function useResolver<T = any>(): T {
  return React.useContext(RouteContext).routeResolverInfos;
}

