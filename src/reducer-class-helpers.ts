import { produce } from 'immer'
import { DeepReadonlyArray, DeepReadonlyObject } from 'typelevel-ts'

import { METADATA_KEY_ACTION } from './constants'
import { MetadataActionMissingError } from './errors'

export type Immutable<T> = T extends object ? DeepReadonlyObject<T> : T extends any[] ? DeepReadonlyArray<T> : T
export interface IReducerMap<T> {
  [actionType: string]: (state: T, action: any) => T
}
export interface IReducerClassConstraintComplete<T> {
  [index: string]: ReducerClassMethod<T> | T
}
export type ReducerPure<T> = (state: T, action: any) => T
export type ReducerImmer<T> = (original: T, draft: T, action: any) => undefined
export type ReducerClassMethod<T> = ReducerPure<T> | ReducerImmer<T>
export interface IReducerClassConstraint<T> {
  [methodName: string]: ReducerClassMethod<T>
}
export interface IReducerClassMethodWithActionType<T> {
  method: ReducerPure<T>
  actionType: string
}

export class ReducerClassHelpers {
  public static typeGuardReducerPure<T>(method: ReducerClassMethod<T>): method is ReducerPure<T> {
    return method.length !== 3
  }
  public static addImmerIfNeeded<T>(method: ReducerClassMethod<T>): ReducerPure<T> {
    if (this.typeGuardReducerPure<T>(method)) {
      return method
    }
    return (state: T, action: any): T => produce<T>(state, (draft) => method(state, draft as T, action))
  }
  public static getReducerClassMethodsWthActionTypes<T>(
    instance: IReducerClassConstraint<T>,
    keys: Array<keyof typeof instance>,
  ) {
    return keys.reduce<Array<IReducerClassMethodWithActionType<any>>>((accum, methodName) => {
      const actionTypes: string[] | undefined = Reflect.getMetadata(METADATA_KEY_ACTION, instance, methodName as string)
      if (!actionTypes) {
        throw new MetadataActionMissingError(methodName as string)
      }
      const methodBound = instance[methodName].bind(instance)
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
