export class CyclicDepsError extends Error {
  public constructor(
    className: string,
    requirementGraph: ReadonlyArray<string>
  ) {
    super(
      `Class "${className}" has cyclic deps. Requirement Graph: ${requirementGraph.join(
        " -> "
      )}`
    );
  }
}
