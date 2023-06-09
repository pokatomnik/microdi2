export class MissingClassError extends Error {
  public constructor(className: string) {
    super(`Class "${className}" not provided`);
  }
}
