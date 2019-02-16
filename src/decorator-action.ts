import { METADATA_KEY_ACTION, METADATA_KEY_METHOD_PARAMS } from './constants'
import { ActionTypeUnclearError, MetadataActionPropsMissingError } from './errors'

export interface IAction {
  type: string
}
export type IActionCreator = (...args: any[]) => IAction
export type IActionConstructor = new (...args: any[]) => IAction
const isArrowFunction = (action: IActionConstructor | IActionCreator): action is IActionCreator => !action.prototype
const typeGuardActionHasOwnType = (action: IAction | IActionConstructor | IActionCreator): action is IAction =>
  typeof (action as IAction).type === 'string' // tslint:disable-line strict-type-predicates
const typeGuardActionIsString = (action: IAction | IActionConstructor | IActionCreator | string): action is string =>
  typeof action === 'string'

const getActionType = (action: IAction | IActionConstructor | IActionCreator | string): string => {
  if (typeGuardActionIsString(action)) {
    return action
  }
  if (typeGuardActionHasOwnType(action)) {
    return action.type
  }
  try {
    if (isArrowFunction(action)) {
      const actionCreatorArrowFnRes = action()
      return actionCreatorArrowFnRes.type
    }
    const classInstance = new action()
    return classInstance.type
  } catch {
    // Fall back in case action construction failed due to missing arguments
    // Should work perfectly for redux-actions
    // https://github.com/redux-utilities/redux-actions/blob/master/src/createAction.js#L44
    return action.toString()
  }
}

const checkParamTypeIsAction = (paramType: any): boolean => {
  try {
    return typeof paramType.type === 'string' || typeof new paramType().type === 'string'
  } catch {
    return false
  }
}
const ActionReflect: MethodDecorator = (target, propertyKey) => {
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
  const actionType = getActionType(action)
  Reflect.defineMetadata(METADATA_KEY_ACTION, [actionType], target, propertyKey)
}

const typeGuardActionArgsAreDecoratorProps = (
  args: ActionArgsDecorator | ActionArgsDecoratorFactory,
): args is ActionArgsDecorator =>
  args.length === 3 &&
  typeof args[1] === 'string' &&
  typeof args[2] === 'object' &&
  (args[2] as PropertyDescriptor).configurable !== undefined &&
  (args[2] as PropertyDescriptor).enumerable !== undefined
type ActionArgsDecorator = [object, string | symbol, PropertyDescriptor]
type ActionArgsDecoratorFactory = Array<IAction | IActionConstructor | IActionCreator | string>

export function Action(...args: ActionArgsDecoratorFactory): MethodDecorator
export function Action(
  target: object,
  property: string | symbol,
  descriptor: PropertyDescriptor,
): PropertyDescriptor | void
export function Action(
  ...args: ActionArgsDecorator | ActionArgsDecoratorFactory
): MethodDecorator | PropertyDescriptor | void {
  if (typeGuardActionArgsAreDecoratorProps(args)) {
    return ActionReflect(...args)
  }
  const decorator: MethodDecorator = (target, propertyKey, descriptor) => {
    if (!args.length) {
      throw new MetadataActionPropsMissingError(propertyKey as string)
    }
    const actionTypes: string[] = args.map(getActionType)
    Reflect.defineMetadata(METADATA_KEY_ACTION, actionTypes, target, propertyKey)
  }
  return decorator
}
