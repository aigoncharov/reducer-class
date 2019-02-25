import { createReducer, Handlers } from 'redux-create-reducer'

import {
  IReducerClassConstraint,
  IReducerClassConstraintComplete,
  ReducerClassHelpers,
  ReducerImmer,
  ReducerPure,
} from './reducer-class-helpers'

interface IReducerClassStatic<T> {
  create: () => Reducer<T>
  reducerClassHelpers: ReducerClassHelpers
}
type Reducer<T> = (state: T | undefined, action: any) => T
export abstract class ReducerClass<T> implements IReducerClassConstraintComplete<T> {
  [index: string]: ReducerPure<T> | ReducerImmer<T> | T

  public static reducerClassHelpers = new ReducerClassHelpers()

  public static create<T>(this: (new () => IReducerClassConstraintComplete<T>) & IReducerClassStatic<T>): Reducer<T> {
    const instance = new this()
    const keys = this.reducerClassHelpers.getClassInstanceMethodNames(instance)
    const reducersWithActionTypes = this.reducerClassHelpers.getReducerClassMethodsWthActionTypes(
      instance as IReducerClassConstraint<T>,
      keys,
    )
    const reducerMap = this.reducerClassHelpers.getReducerMap<T>(reducersWithActionTypes)
    // TODO: Remove as Handlers<T> once https://github.com/kolodny/redux-create-reducer/pull/17 is merged
    return createReducer<T>((instance as ReducerClass<T>).initialState, reducerMap as Handlers<T>)
  }

  public abstract initialState: T
}
