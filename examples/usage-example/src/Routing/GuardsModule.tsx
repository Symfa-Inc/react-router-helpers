import { HelperRouteObject, useRoutesWithHelper } from '../reactRouterHelpers';
import { HelperOutlet } from '../reactRouterHelpers/index';


const Routes = () => {
  return useRoutesWithHelper([
    {
      path: 'test',
      element: <>Guards page</>
    }
  ]);
};
export const GuardsModule = () => {
  // return useRoutesWithHelper([
  //   {
  //     path: './',
  //     element: <>Guards page</>
  //   },
  // ]);
  return <>
    <>test</>
    {/*<Routes />*/}
    <HelperOutlet />
  </>;
};
// export const guardRoutes: HelperRouteObject[] = [
//   {
//     path: '/test',
//     element: <>Guards page</>
//   }
// ];
