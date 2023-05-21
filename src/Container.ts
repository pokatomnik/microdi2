import { InstantiationError } from "./InstantiationError";
import { Bind } from "./helpers/Bind";

interface ClassWithDepsRecord {
  readonly class: new (...args: ReadonlyArray<unknown>) => unknown;
  readonly deps: ReadonlyArray<string>;
}

export class Container {
  private static _default: Container | null = null;

  public static get default() {
    return this._default ?? (this._default = new Container());
  }

  private readonly _classesMap = new Map<string, ClassWithDepsRecord>();

  private readonly _instancesMap = new Map<string, unknown>();

  @(Bind<Container, [identifier: string], any>)
  public resolve<TInstance>(identifier: string): TInstance {
    const classWithDeps = this._classesMap.get(identifier);
    if (!classWithDeps) {
      throw new InstantiationError(identifier);
    }

    const existingInstance = this._instancesMap.get(identifier);
    if (existingInstance) {
      return existingInstance as TInstance;
    }

    const { class: Clazz, deps: depsIndentifiers } = classWithDeps;
    const deps = depsIndentifiers.map((depIdentifier) => {
      return this.resolve(depIdentifier);
    });
    const instance = new Clazz(...deps);

    this._instancesMap.set(identifier, instance);

    return instance as TInstance;
  }

  @Bind
  public provide(
    identifier: string,
    clazz: new (...args: Array<any>) => unknown,
    deps: ReadonlyArray<string>
  ) {
    this._classesMap.set(identifier, { class: clazz, deps });
    return this;
  }
}
