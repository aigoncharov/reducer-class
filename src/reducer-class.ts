import { createReducer } from 'redux-create-reducer'

import {
  IReducerClassConstraint,
  IReducerClassInstanceFiltered,
  ReducerClassHelpers,
  ReducerImmer,
  ReducerPure,
} from './reducer-class-helpers'

type Reducer<T> = (state: T | undefined, action: any) => T
export abstract class ReducerClass<T> implements IReducerClassConstraint<T> {
  [index: string]: ReducerPure<T> | ReducerImmer<T> | T

  public static create<T>(this: new () => IReducerClassConstraint<T>): Reducer<T> {
    const instance = new this()
    const keys = ReducerClassHelpers.getClassInstanceMethodNames(instance)
    const reducersWithActionTypes = ReducerClassHelpers.getReducerClassMethodsWthActionTypes(
      instance as IReducerClassInstanceFiltered<T>,
      keys,
    )
    const reducerMap = ReducerClassHelpers.getReducerMap(reducersWithActionTypes)
    return createReducer<T>((instance as ReducerClass<T>).initialState, reducerMap)
  }

  public abstract initialState: T
}
