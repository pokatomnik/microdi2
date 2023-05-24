# Micro Dependency injection library

![Tests](https://github.com/pokatomnik/microdi2/actions/workflows/node.js.yml/badge.svg)

## Installation

```sh
npm i microdi2
```

## The problem

First, let's imagine we have such classes, one depends on another one.

```typescript
// IA.ts
export interface A {
  a(): string;
}

// A.ts
import type { IA } from "./IA";

export class A implements IA {
  public a(): string {
    return "A";
  }
}

// IB.ts
export interface IB {
  b(): string;
}

// B.ts
import type { IA } from "./IA";
import type { IB } from "./IB";

export class B implements IB {
  public constructor(private readonly a: IA) {}

  public b() {
    return "B";
  }
}
```

All of them must be instantiated, so we'll apply this logic to do that:

```typescript
export const instanceB = new B(new A());
```

Looks simple, right? But when a class has a lot of dependencies and Its dependencies has their own dependencies (and so on), the instantiation logic might be very complicated:

```typescript
const app = new App(new Router(), new Authorization(new HttpClient(new UserService)), new Whatever(), ...);
```

Simple? Not quite.

## The solution

We may have a container that resolves our dependencies (and event instantiate classes on demand):

```typescript
// container.ts
// Container has been initialized internally:
import { initContainer } from "microdi2";

export const { provide, singleton, alwaysFresh } = initContainer();
```

```typescript
// DIConfig.ts:
import { singleton } from "./container.ts";
import { A } from "./A";
import type { IA } from "./IA";
import { B } from "./B";
import type { IB } from "./IB";

export const resolveA = singleton<IA>(
  // Identifier
  "IA",
  // Class
  A,
  // Dependency list
  []
);

export const resolveB = singleton<IB>(
  // Identifier
  "IB",
  // Class
  B,
  // B constructor must be invoked with an instance of IA type
  ["IA"]
);
```

And then, all of these classes can be received with the following:

```typescript
// app.ts
import { resolve } from "./container.ts";
import { IB } from "./IB";
import { resolveB } from "./DIConfig.ts";

// approach 1 (define type manually)
const instanceB1 = resolve<IB>("IB");

// approach 2 (use exported resolver):
const instanceB1 = resolveB();

console.log(instanceB1 === instanceB2); // true
```

> Please note the example above instantiates all the classes as singletons. If you need a class to be instantiated every time you `resolve` them, use `alwaysFresh` instead
