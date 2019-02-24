// tslint:disable max-classes-per-file
import 'reflect-metadata'

import { ActionStandard, IActionStandardStatic } from 'flux-action-class'

import { Action } from './decorator-action'
import { Extend, ReducerClassMixin } from './decorator-extend'
import { ReducerClass } from './reducer-class'

describe('@Extend', () => {
  test('adds methods from extenders', () => {
    class Action1 extends ActionStandard {}
    class Action2 extends ActionStandard {}
    class Action3 extends ActionStandard {}
    interface ITestState {
      sum: number
    }
    class Extender1 extends ReducerClassMixin<ITestState> {
      @Action(Action1)
      public test1({ sum }: ITestState): ITestState {
        return {
          sum: sum + 100,
        }
      }
    }
    class Extender2 extends ReducerClassMixin<ITestState> {
      @Action(Action2)
      public test2({ sum }: ITestState): ITestState {
        return {
          sum: sum + 50,
        }
      }
    }
    @Extend(Extender1, Extender2)
    class Test extends ReducerClass<ITestState> {
      public initialState = {
        sum: 10,
      }

      @Action(Action3)
      public test3({ sum }: ITestState): ITestState {
        return {
          sum: sum + 25,
        }
      }
    }
    const reducer = Test.create()
    const res1 = reducer(undefined, new Action3())
    expect(res1).toEqual({
      sum: 35,
    })
    const res2 = reducer(undefined, new Action2())
    expect(res2).toEqual({
      sum: 60,
    })
    const res3 = reducer(undefined, new Action1())
    expect(res3).toEqual({
      sum: 110,
    })
  })
  test('overrides methods from extenders', () => {
    const methodName = 'test1'
    class Action1 extends ActionStandard {}
    interface ITestState {
      sum: number
    }
    class Extender1 extends ReducerClassMixin<ITestState> {
      @Action(Action1)
      public [methodName]({ sum }: ITestState): ITestState {
        return {
          sum: sum + 100,
        }
      }
    }

    @Extend(Extender1)
    class Test extends ReducerClass<ITestState> {
      public initialState = {
        sum: 10,
      }

      @Action(Action1)
      public [methodName]({ sum }: ITestState): ITestState {
        return {
          sum: sum + 25,
        }
      }
    }
    const reducer = Test.create()
    const res1 = reducer(undefined, new Action1())
    expect(res1).toEqual({
      sum: 35,
    })
  })
  test('works for extenders with compatible, but not same state types', () => {
    class Action1 extends ActionStandard {}
    interface IExtender1State {
      loading: boolean
    }
    class Extender1<T extends IExtender1State> extends ReducerClassMixin<T> {
      @Action(Action1)
      public test1(state: T) {
        return {
          ...state,
          loading: true,
        }
      }
    }

    interface ITestState {
      loading: boolean
      sum: number
    }
    @Extend<ITestState>(Extender1)
    class Test extends ReducerClass<ITestState> {
      public initialState = {
        loading: false,
        sum: 10,
      }

      @Action(Action1)
      public test3({ sum, ...state }: ITestState) {
        return {
          ...state,
          sum: sum + 25,
        }
      }
    }
    const reducer = Test.create()
    const res1 = reducer(undefined, new Action1())
    expect(res1).toEqual({
      loading: true,
      sum: 35,
    })
  })
  test('works for extender factories', () => {
    class Action1 extends ActionStandard {}
    interface IExtender1State {
      loading: boolean
    }
    const makeExtender1 = <T extends IExtender1State>(action: IActionStandardStatic) => {
      class Extender1 extends ReducerClassMixin<T> {
        @Action(action)
        public testExtender1(state: T) {
          return {
            ...state,
            loading: true,
          }
        }
      }
      return Extender1
    }

    interface ITestState {
      loading: boolean
      sum: number
    }
    @Extend<ITestState>(makeExtender1(Action1))
    class Test extends ReducerClass<ITestState> {
      public initialState = {
        loading: false,
        sum: 10,
      }

      @Action(Action1)
      public test3({ sum, ...state }: ITestState) {
        return {
          ...state,
          sum: sum + 25,
        }
      }
    }
    const reducer = Test.create()
    const res1 = reducer(undefined, new Action1())
    expect(res1).toEqual({
      loading: true,
      sum: 35,
    })
  })
})
