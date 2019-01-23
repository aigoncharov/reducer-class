import { METADATA_KEY_ACTION, METADATA_KEY_METHOD_PARAMS } from './constants'
import { ActionTypeUnclearError, MetadataActionPropsMissingError } from './errors'

export interface IAction {
  type: string
}
export type IActionConstructor = new (...args: any[]) => IAction
const typeGuardActionHasOwnType = (action: IAction | IActionConstructor): action is IAction =>
  typeof (action as IAction).type === 'string'
const typeGuardActionIsString = (action: IAction | IActionConstructor | string): action is string =>
  typeof action === 'string'
export const Action = (...actions: Array<IAction | IActionConstructor | string>): MethodDecorator => (
  target,
  propertyKey,
) => {
  if (!actions.length) {
    throw new MetadataActionPropsMissingError(propertyKey as string)
  }
  const actionTypes: string[] = actions.map((action) => {
    if (typeGuardActionIsString(action)) {
      return action
    }
    if (typeGuardActionHasOwnType(action)) {
      return action.type
    }
    return new action().type
  })
  Reflect.defineMetadata(METADATA_KEY_ACTION, actionTypes, target, propertyKey)
}

const checkParamTypeIsAction = (paramType: any): boolean => {
  try {
    return typeof paramType.type === 'string' || typeof new paramType().type === 'string'
  } catch {
    return false
  }
}
export const ActionReflect: MethodDecorator = (target, propertyKey) => {
  const methodParamTypes = Reflect.getMetadata(METADATA_KEY_METHOD_PARAMS, target, propertyKey)
  if (
    !methodParamTypes ||
    !Array.isArray(methodParamTypes) ||
    (methodParamTypes.length !== 2 && methodParamTypes.length !== 3)
  ) {
    throw new ActionTypeUnclearError(propertyKey as string)
  }
  let actionCandidate = methodParamTypes[1]
  if (methodParamTypes.length === 3) {
    actionCandidate = methodParamTypes[2]
  }
  if (!checkParamTypeIsAction(actionCandidate)) {
    throw new ActionTypeUnclearError(propertyKey as string)
  }
  const action: IAction | IActionConstructor = actionCandidate
  let actionType: string
  if (typeGuardActionHasOwnType(action)) {
    actionType = action.type
  } else {
    actionType = new action().type
  }
  Reflect.defineMetadata(METADATA_KEY_ACTION, [actionType], target, propertyKey)
}
