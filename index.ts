// tslint:disable max-classes-per-file
import { produce } from 'immer'
import { createReducer } from 'redux-create-reducer'
import 'reflect-metadata'

export const METADATA_KEY_ACTION = Symbol()

export class MetadataActionMissingError extends Error {
  constructor(methodName: string) {
    super(`Action metadata is missing for ${methodName}. Use @Action decorator to define it.`)
  }
}

interface IReducerClassConstraint<T> {
  [index: string]: ReducerPure<T> | ReducerImmer<T> | T
}
type ReducerPure<T> = (state: T, action: any) => T
type ReducerImmer<T> = (original: T, draft: T, action: any) => void
const typeGuardReducerPure = <T>(method: ReducerPure<T> | ReducerImmer<T>): method is ReducerPure<T> =>
  method.length === 2
abstract class ReducerClass<T> implements IReducerClassConstraint<T> {
  [index: string]: ReducerPure<T> | ReducerImmer<T> | T

  public static create<T>(this: new () => IReducerClassConstraint<T>): (state: T | undefined, action: any) => T {
    const instance = new this()
    const keys = Object.keys(instance).filter((key) => key !== 'intialState')
    const reducerMap = keys.reduce<{ [index: string]: (state: T, action: any) => T }>((accum, methodName) => {
      const method = instance[methodName] as ReducerPure<T> | ReducerImmer<T>
      const methodMetadata: Array<{ type: string }> = Reflect.getMetadata(METADATA_KEY_ACTION, method)
      if (!methodMetadata) {
        throw new MetadataActionMissingError(methodName)
      }
      const reducerMapNested = methodMetadata.reduce<{ [index: string]: (state: T, action: any) => T }>(
        (accumNested, actionFromMetadata) => {
          let methodToAdd = method as (state: T, action: any) => T
          if (!typeGuardReducerPure(method)) {
            methodToAdd = (state: T, action: any) => produce(state, (draft) => method(state, draft as T, action))
          }
          return {
            ...accumNested,
            [actionFromMetadata.type]: methodToAdd,
          }
        },
        {},
      )
      return {
        ...accum,
        ...reducerMapNested,
      }
    }, {})
    return createReducer(instance.intialState as T, reducerMap) as (state: T | undefined, action: any) => T
  }

  public abstract intialState: T
}
