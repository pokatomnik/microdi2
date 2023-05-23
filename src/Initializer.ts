import { Container } from "./Container";

export const initContainer = () => {
  const container = new Container();

  const provide = (
    identifier: string,
    clazz: new (...args: Array<any>) => unknown,
    deps: ReadonlyArray<string>
  ) => {
    return container.singleton(identifier, clazz, deps);
  };

  const resolve = <TInstance>(identifier: string): TInstance => {
    return container.resolve<TInstance>(identifier);
  };

  return { provide, resolve };
};
