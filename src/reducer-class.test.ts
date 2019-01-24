// tslint:disable max-classes-per-file
import 'reflect-metadata'

import { ActionStandard } from 'flux-action-class'

import { Action } from './decorator-action'
import { ReducerClass } from './reducer-class'
import { Immutable } from './reducer-class-helpers'

describe(ReducerClass.name, () => {
  test('creates a reducer', () => {
    interface ITestState {
      sum: number
    }
    class Action1 extends ActionStandard {}
    class Action2 extends ActionStandard<number> {}
    class Test extends ReducerClass<ITestState> {
      public initialState = { sum: 10 }
      @Action(Action1, Action2)
      public test1(state: ITestState) {
        return {
          sum: state.sum + 1,
        }
      }
      @Action
      public test2(state: Immutable<ITestState>, draft: ITestState, action: Action2) {
        draft.sum += action.payload
      }
    }

    const testReducer = Test.create()
    const res11 = testReducer(undefined, new Action1())
    expect(res11).toEqual({
      sum: 11,
    })
    const res12 = testReducer(res11, new Action1())
    expect(res12).toEqual({
      sum: 12,
    })
    const res21 = testReducer(undefined, new Action2(3))
    expect(res21).toEqual({
      sum: 14,
    })
    const res22 = testReducer(res21, new Action2(5))
    expect(res22).toEqual({
      sum: 20,
    })
  })
})
