import React, { useEffect, useState } from 'react';

export class RouteHelper {
  constructor(private component: JSX.Element) {}

  // TODO: Add resolvers
  // TODO: Add resolvers tests

  // TODO: Add guards
  // TODO: Add guards tests

  // TODO: Add something like (useRoutes) with RouteHelper
  // TODO: Add something like (useRoutes) with RouteHelper tests

  // TODO: Add metadata (title)
  // TODO: Add metadata (title) tests

  // TODO: Add lazy loading
  // TODO: Add lazy loading tests

  // TODO: Add server side plug
  // TODO: Add server side plug tests

  public withResolvers(): void {}

  public withGuards(): void {}

  public create(): JSX.Element {
    const [isSet, set] = useState(false);

    const setSomething = () => {
      setTimeout(() => {
        set(true);
      }, 2000);
    };

    useEffect(() => {
      setSomething();
    }, []);

    if (!isSet) {
      return <h1>loading...</h1>;
    }
    return <>{this.component}</>;
  }
}
