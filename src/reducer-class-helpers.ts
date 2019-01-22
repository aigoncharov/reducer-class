import { produce } from 'immer'

import { METADATA_KEY_ACTION } from './constants'
import { MetadataActionMissingError } from './errors'

export interface IReducerMap<T> {
  [actionType: string]: (state: T, action: any) => T
}
export interface IReducerClassConstraint<T> {
  [index: string]: ReducerPure<T> | ReducerImmer<T> | T
}
export type ReducerPure<T> = (state: T, action: any) => T
export type ReducerImmer<T> = (original: T, draft: T, action: any) => void
export interface IReducerClassInstanceFiltered<T> {
  [methodName: string]: ReducerPure<T> | ReducerImmer<T>
}
export interface IReducerClassMethodWithActionType<T> {
  method: ReducerPure<T>
  actionType: string
}

export class ReducerClassHelpers {
  public static typeGuardReducerPure<T>(method: ReducerPure<T> | ReducerImmer<T>): method is ReducerPure<T> {
    return method.length !== 3
  }
  public static addImmerIfNeeded<T>(method: ReducerPure<T> | ReducerImmer<T>): ReducerPure<T> {
    if (this.typeGuardReducerPure(method)) {
      return method
    }
    return (state: T, action: any): T => produce(state, (draft) => method(state, draft as T, action))
  }
  public static getReducerClassMethodsWthActionTypes<T>(
    instance: IReducerClassInstanceFiltered<T>,
    keys: Array<keyof typeof instance>,
  ) {
    return keys.reduce<Array<IReducerClassMethodWithActionType<any>>>((accum, methodName) => {
      const actionTypes: string[] | undefined = Reflect.getMetadata(METADATA_KEY_ACTION, instance, methodName as string)
      if (!actionTypes) {
        throw new MetadataActionMissingError(methodName as string)
      }
      const methodBound = instance[methodName].bind<IReducerClassConstraint<T>, any[], T | void>(instance)
      const method = this.addImmerIfNeeded<T>(methodBound)
      actionTypes.forEach((actionType) =>
        accum.push({
          actionType,
          method,
        }),
      )
      return accum
    }, [])
  }
  public static mergeReducers<T>(...reducers: Array<ReducerPure<T>>): ReducerPure<T> {
    return (state, action) => reducers.reduce<T>((resState, reducer) => reducer(resState, action), state)
  }
  public static getReducerMap<T>(data: Array<IReducerClassMethodWithActionType<T>>) {
    return data.reduce<IReducerMap<T>>((accum, { method, actionType }) => {
      let methodToAdd = method
      if (accum[actionType]) {
        methodToAdd = this.mergeReducers(accum[actionType], method)
      }
      accum[actionType] = methodToAdd
      return accum
    }, {})
  }
  public static getClassInstanceMethodNames(obj: object) {
    const proto = Object.getPrototypeOf(obj)
    return Object.getOwnPropertyNames(proto).filter((name) => name !== 'constructor')
  }
}
