import { Container } from "../src/Container";
import { describe, it } from "mocha";
import * as _chai from "chai";
import { expect } from "chai";
import { InstantiationError } from "../src/InstantiationError";

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
    }).to.throw(InstantiationError, 'Class "A" not provided');
  });

  it("default container", () => {
    const defaultContainer = Container.default;
    const newContainer = new Container();

    expect(newContainer).not.to.equal(defaultContainer);
  });

  it("bound", () => {
    const { provide, resolve } = new Container();

    provide("A", A, []);
    provide("B", B, ["A"]);

    const a = resolve("A");
    const b = resolve("B");

    expect(a).not.equal(b);
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
