import { CyclicDepsError } from "./CyclicDepsError";
import { MissingClassError } from "./MissingClassError";

interface ClassWithDepsRecord {
  readonly class: new (...args: ReadonlyArray<unknown>) => unknown;
  readonly deps: ReadonlyArray<string>;
  readonly instantiationType: "SINGLETON" | "ALWAYS_FRESH";
}

export class Container {
  private readonly _classesMap = new Map<string, ClassWithDepsRecord>();

  private readonly _instancesMap = new Map<string, unknown>();

  private checkCycles(path: ReadonlyArray<string>): boolean {
    return new Set(path).size !== path.length;
  }

  private resolveInternal<TInstance>(
    identifier: string,
    path: ReadonlyArray<string>
  ): TInstance {
    const hasCycles = this.checkCycles(path);
    if (hasCycles) {
      throw new CyclicDepsError(identifier, path);
    }

    const classWithDeps = this._classesMap.get(identifier);
    if (!classWithDeps) {
      throw new MissingClassError(identifier);
    }

    const {
      class: Clazz,
      deps: depsIndentifiers,
      instantiationType,
    } = classWithDeps;

    if (instantiationType === "SINGLETON") {
      const existingInstance = this._instancesMap.get(identifier);
      if (existingInstance) {
        return existingInstance as TInstance;
      }
    }

    const deps = depsIndentifiers.map((depIdentifier) => {
      return this.resolveInternal(depIdentifier, path.concat(depIdentifier));
    });
    const instance = new Clazz(...deps);

    if (instantiationType === "SINGLETON") {
      this._instancesMap.set(identifier, instance);
    }

    return instance as TInstance;
  }

  public resolve<TInstance>(identifier: string): TInstance {
    return this.resolveInternal(identifier, []);
  }

  public singleton(
    identifier: string,
    clazz: new (...args: Array<any>) => unknown,
    deps: ReadonlyArray<string>
  ) {
    this._classesMap.set(identifier, {
      class: clazz,
      instantiationType: "SINGLETON",
      deps,
    });
    return this;
  }

  public alwaysFresh(
    identifier: string,
    clazz: new (...args: Array<any>) => unknown,
    deps: ReadonlyArray<string>
  ) {
    this._classesMap.set(identifier, {
      class: clazz,
      instantiationType: "ALWAYS_FRESH",
      deps,
    });
    return this;
  }
}
