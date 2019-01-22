import { METADATA_KEY_ACTION } from './constants'
import { MetadataActionPropsMissingError } from './errors'

export interface IAction {
  type: string
}
const typeGuardActionIsObject = (action: IAction | string): action is IAction => typeof action !== 'string'
export const Action = (...actions: Array<IAction | string>): MethodDecorator => (target, propertyKey) => {
  if (!actions.length) {
    throw new MetadataActionPropsMissingError(propertyKey as string)
  }
  const actionTypes: string[] = actions.map((action) => {
    if (typeGuardActionIsObject(action)) {
      return action.type
    }
    return action
  })
  Reflect.defineMetadata(METADATA_KEY_ACTION, actionTypes, target, propertyKey)
}
