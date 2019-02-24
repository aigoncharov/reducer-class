import { createReducer, Handlers } from 'redux-create-reducer'

import {
  IReducerClassConstraint,
  IReducerClassConstraintComplete,
  ReducerClassHelpers,
  ReducerImmer,
  ReducerPure,
} from './reducer-class-helpers'

type Reducer<T> = (state: T | undefined, action: any) => T
export abstract class ReducerClass<T> implements IReducerClassConstraintComplete<T> {
  [index: string]: ReducerPure<T> | ReducerImmer<T> | T

  public static create<T>(this: new () => IReducerClassConstraintComplete<T>): Reducer<T> {
    const instance = new this()
    const keys = ReducerClassHelpers.getClassInstanceMethodNames(instance)
    const reducersWithActionTypes = ReducerClassHelpers.getReducerClassMethodsWthActionTypes(
      instance as IReducerClassConstraint<T>,
      keys,
    )
    const reducerMap = ReducerClassHelpers.getReducerMap<T>(reducersWithActionTypes)
    // TODO: Remove as Handlers<T> once https://github.com/kolodny/redux-create-reducer/pull/17 is merged
    return createReducer<T>((instance as ReducerClass<T>).initialState, reducerMap as Handlers<T>)
  }

  public abstract initialState: T
}
