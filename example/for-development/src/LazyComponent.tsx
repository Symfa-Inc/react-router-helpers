import { HelperOutlet, useResolver } from './reactRouterHelpers/index';

function LazyComponent() {
  const data = useResolver();
  console.log(data);
  return (
    <div>
      <h2>Lazy component</h2>
      <HelperOutlet />
    </div>
  );
}
export default LazyComponent;
