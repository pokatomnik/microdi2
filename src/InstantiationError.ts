export class InstantiationError extends Error {
  public constructor(className: string) {
    super(`Class "${className}" not provided`);
  }
}
