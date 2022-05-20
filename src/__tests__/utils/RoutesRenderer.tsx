import { useRoutesWithHelper } from '../../route-helper-wrappers';
import { HelperRouteObject } from '../../types';

export function RoutesRenderer({
  routes,
  location,
}: {
  routes: HelperRouteObject[];
  location?: Partial<Location> & { pathname: string };
}) {
  return useRoutesWithHelper(routes, location);
}
