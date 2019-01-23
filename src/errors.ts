// tslint:disable max-classes-per-file
export class MetadataActionMissingError extends Error {
  constructor(methodName: string) {
    super(`Action metadata is missing for ${methodName}. Use @Action decorator to define it.`)
  }
}

export class ActionTypeUnclearError extends Error {
  constructor(methodName: string) {
    super(
      `Action type is unclear for ${methodName}. It must be one class only. Do you pass and interface or a union type?`,
    )
  }
}

export class MetadataActionPropsMissingError extends Error {
  constructor(methodName: string) {
    super(
      `Actions are missing for action metadata of ${methodName}. Pass action classes or types to @Action decorator.`,
    )
  }
}
