import { useRoutesWithHelper } from '../../../src/route-helper-wrappers';
import { HelperRouteObject } from '../../../src/types';

export function RoutesRenderer({
  routes,
  location,
}: {
  routes: HelperRouteObject[];
  location?: Partial<Location> & { pathname: string };
}) {
  return useRoutesWithHelper(routes, location);
}
