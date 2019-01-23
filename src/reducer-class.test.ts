// tslint:disable max-classes-per-file
import 'reflect-metadata'

import { ActionStandard } from 'flux-action-class'

import { Action } from './decorator-action'
import { ReducerClass } from './reducer-class'

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
      @Action(Action2)
      public test2(state: ITestState, draft: ITestState, action: Action2) {
        draft.sum += action.payload
      }
    }

    const testReducer = Test.create()
    const res1 = testReducer(undefined, new Action1())
    expect(res1).toEqual({
      sum: 11,
    })
    const res2 = testReducer(undefined, new Action2(3))
    expect(res2).toEqual({
      sum: 14,
    })
  })
})
