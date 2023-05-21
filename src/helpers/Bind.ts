export function Bind<
  TInstance extends object,
  TArguments extends ReadonlyArray<unknown>,
  TReturn extends unknown
>(
  originalMethod: (this: TInstance, ...args: TArguments) => TReturn,
  _: ClassMethodDecoratorContext<
    TInstance,
    (this: TInstance, ...args: TArguments) => TReturn
  >
) {
  _.addInitializer(function () {
    const instance: any = this;
    instance[originalMethod.name] = method.bind(this);
  });
  function method(this: TInstance, ...args: TArguments): TReturn {
    return originalMethod.call(this, ...args);
  }
  return method;
}
