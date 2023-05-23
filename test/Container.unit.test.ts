import { Container } from "../src/Container";
import { describe, it } from "mocha";
import * as _chai from "chai";
import { expect } from "chai";
import { MissingClassError } from "../src/MissingClassError";
import { CyclicDepsError } from "../src/CyclicDepsError";

_chai.should();
_chai.expect;

describe("DI Container", () => {
  it("container initialization", () => {
    new Container();
  });

  it("provide", () => {
    const container = new Container();

    container.provide("A", A, []);
    container.provide("B", B, ["A"]);
  });

  it("resolve", () => {
    const container = new Container();

    container.provide("A", A, []);
    container.provide("B", B, ["A"]);

    const a = container.resolve("A");
    const b = container.resolve("B");

    expect(a).not.equal(b);
  });

  it("dependencies injected correctly", () => {
    const container = new Container();

    container.provide("A", A, []);
    container.provide("B", B, ["A"]);

    const a = container.resolve<A>("A");
    const b = container.resolve<B>("B");

    expect(a.a()).to.equal("a!");
    expect(b.b()).to.equal("a!b!");
  });

  it("persistance", () => {
    const container = new Container();

    container.provide("A", A, []);
    container.provide("B", B, ["A"]);

    const a1 = container.resolve("A");
    const b1 = container.resolve("B");

    const a2 = container.resolve("A");
    const b2 = container.resolve("B");

    expect(a1).to.equal(a2);
    expect(b1).to.equal(b2);
  });

  it("throw on missing deps", () => {
    const container = new Container();
    container.provide("B", B, ["A"]);

    expect(() => {
      container.resolve("B");
    }).to.throw(MissingClassError, 'Class "A" not provided');
  });

  it("cyclic deps, depth1", () => {
    const container = new Container();
    container.provide("C", Cyclic, ["C"]);
    expect(() => {
      container.resolve("C");
    }).to.throw(
      CyclicDepsError,
      'Class "C" has cyclic deps. Requirement Graph: C -> C'
    );
  });

  it("cyclic deps, depth 3", () => {
    const container = new Container();
    container.provide("C0", Cyclic0, ["C1"]);
    container.provide("C1", Cyclic1, ["C2"]);
    container.provide("C2", Cyclic2, ["C3"]);
    container.provide("C3", Cyclic3, ["C1"]);
    expect(() => {
      container.resolve("C3");
    }).to.throw(
      CyclicDepsError,
      'Class "C1" has cyclic deps. Requirement Graph: C1 -> C2 -> C3 -> C1'
    );
  });
});

class A {
  public a() {
    return "a!";
  }
}

class B {
  public constructor(private readonly a: A) {}

  public b() {
    return this.a.a() + "b!";
  }
}

class Cyclic {
  public constructor(private readonly _c: Cyclic) {}

  public cyclic() {
    return 'Class "Cyclic" initialized';
  }
}

class Cyclic0 {
  public constructor(private readonly _c: Cyclic1) {}

  public cyclic0() {
    return 'Class "Cyclic0" initialized';
  }
}

class Cyclic1 {
  public constructor(private readonly _c: Cyclic2) {}

  public cyclic1() {
    return 'Class "Cyclic1" initialized';
  }
}

class Cyclic2 {
  public constructor(private readonly _c: Cyclic3) {}

  public cyclic2() {
    return 'Class "Cyclic2" initialized';
  }
}

class Cyclic3 {
  public constructor(private readonly _c: Cyclic1) {}

  public cyclic3() {
    return 'Class "Cyclic3" initialized';
  }
}
