import React, { useEffect, useState } from "react";
import { Status, useManager } from "./hooks";
import { Guard } from "./types";

export class RouteHelper {
  private guards: Guard[] = [];

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

  public withGuards(guards: Guard[]): void {
    this.guards = guards;
  }

  public create(): JSX.Element {

    const manager = useManager({guards: this.guards});
    const [status, setStatus] = useState<Status>(Status.Initial);
    // const [isSet, set] = useState(false);

    const evaluateGuards = async () => {
      const initialStatus = manager.getStatusBeforeAvaluating();
      setStatus(Status.Loading);
      const guardStatus = await manager.evaluateGuards();
      console.log('wat');
      setStatus(guardStatus);
      if (status === Status.Failed) {
        console.log('Need to do something');
      }
    };

    useEffect(() => {
      (async () => {
        await evaluateGuards();
      })();
    }, []);

    if (status == Status.Initial) {
      return <h1>loading...</h1>;
    }
    if (status == Status.Failed) {
      return <h1>failed to load...</h1>;
    }
    return <>{this.component}</>;
  }
}
