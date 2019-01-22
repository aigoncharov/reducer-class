// tslint:disable max-classes-per-file
export class MetadataActionMissingError extends Error {
  constructor(methodName: string) {
    super(`Action metadata is missing for ${methodName}. Use @Action decorator to define it.`)
  }
}

export class MetadataActionPropsMissingError extends Error {
  constructor(methodName: string) {
    super(
      `Actions are missing for action metadata of ${methodName}. Pass action classes or types to @Action decorator.`,
    )
  }
}
