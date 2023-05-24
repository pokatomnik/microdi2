import { Container } from "./Container";

export const initContainer = () => {
  const container = new Container();

  const singleton = <TInstance extends object>(
    identifier: string,
    clazz: new (...args: Array<any>) => TInstance,
    deps: ReadonlyArray<string>
  ) => {
    return container.singleton<TInstance>(identifier, clazz, deps);
  };

  const alwaysFresh = <TInstance extends object>(
    identifier: string,
    clazz: new (...args: Array<any>) => TInstance,
    deps: ReadonlyArray<string>
  ) => {
    return container.alwaysFresh<TInstance>(identifier, clazz, deps);
  };

  const resolve = <TInstance>(identifier: string): TInstance => {
    return container.resolve<TInstance>(identifier);
  };

  return { singleton, alwaysFresh, resolve };
};
