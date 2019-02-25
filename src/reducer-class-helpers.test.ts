// tslint:disable max-classes-per-file
import 'reflect-metadata'

import { ActionStandard } from 'flux-action-class'

import { Action } from './decorator-action'
import { MetadataActionMissingError } from './errors'
import { ReducerClass } from './reducer-class'
import { IReducerClassMethodWithActionType, ReducerClassHelpers } from './reducer-class-helpers'

describe(ReducerClassHelpers.name, () => {
  const reducerClassHelpers = new ReducerClassHelpers()

  afterEach(() => jest.restoreAllMocks())

  describe(ReducerClassHelpers.prototype.getReducerClassMethodsWthActionTypes.name, () => {
    test('returns action types from metadata', () => {
      class Action1 extends ActionStandard {}
      class Action2 extends ActionStandard {}
      class Test extends ReducerClass<undefined> {
        public initialState = undefined

        @Action(Action1)
        public reducerPure(): undefined {
          return undefined
        }

        @Action(Action2)
        public reducerImmer(state: undefined, draft: undefined, action: any) {
          return undefined
        }
      }
      const test = new Test()
      const keys = reducerClassHelpers.getClassInstanceMethodNames(test)
      const spyGetMetadata = jest.spyOn(Reflect, 'getMetadata')
      const mockAddImmerIfNeededResPure = Symbol()
      const mockAddImmerIfNeededResImmer = Symbol()
      jest.spyOn(ReducerClassHelpers.prototype, 'addImmerIfNeeded').mockImplementation(
        (reducer: any): any => {
          if (reducerClassHelpers.typeGuardReducerPure(reducer)) {
            return mockAddImmerIfNeededResPure
          }
          return mockAddImmerIfNeededResImmer
        },
      )
      const methodsWithActionTypes = reducerClassHelpers.getReducerClassMethodsWthActionTypes(test as any, keys)
      expect(spyGetMetadata).toBeCalledTimes(2)
      expect(methodsWithActionTypes.length).toBe(2)
      const [methodWithActionTypes1, methodWithActionTypes2] = methodsWithActionTypes
      expect(methodWithActionTypes1.actionType).toBe(Action1.type)
      expect(methodWithActionTypes1.method).toBe(mockAddImmerIfNeededResPure)
      expect(methodWithActionTypes2.actionType).toBe(Action2.type)
      expect(methodWithActionTypes2.method).toBe(mockAddImmerIfNeededResImmer)
    })
    test('throws if no actions passed', () => {
      class Test extends ReducerClass<undefined> {
        public initialState = undefined
        public test(): undefined {
          return
        }
      }
      const test = new Test()
      const keys = reducerClassHelpers.getClassInstanceMethodNames(test)
      expect(() => reducerClassHelpers.getReducerClassMethodsWthActionTypes(test as any, keys)).toThrow(
        MetadataActionMissingError,
      )
    })
  })

  describe(ReducerClassHelpers.prototype.getReducerMap.name, () => {
    test('returns a reducer map', () => {
      const item1: IReducerClassMethodWithActionType<any> = {
        actionType: 'test1',
        method: (state: any, action: any) => undefined,
      }
      const item2: IReducerClassMethodWithActionType<any> = {
        actionType: 'test2',
        method: (state: any, action: any) => 42,
      }
      const reducerMap = reducerClassHelpers.getReducerMap([item1, item2])
      expect(reducerMap).toEqual({
        [item1.actionType]: item1.method,
        [item2.actionType]: item2.method,
      })
    })
    test('returns a reducer map and merges reducers for the same action types', () => {
      const actionType1 = 'test1'
      const actionType2 = 'test2'
      const item1: IReducerClassMethodWithActionType<any> = {
        actionType: actionType1,
        method: (state: number, action: any) => state + 1,
      }
      const item2: IReducerClassMethodWithActionType<any> = {
        actionType: actionType1,
        method: (state: number, action: any) => state + 2,
      }
      const item3: IReducerClassMethodWithActionType<any> = {
        actionType: actionType2,
        method: (state: number, action: any) => state + 3,
      }
      const item4: IReducerClassMethodWithActionType<any> = {
        actionType: actionType2,
        method: (state: number, action: any) => state + 4,
      }
      const reducerMap = reducerClassHelpers.getReducerMap([item1, item2, item3, item4])
      expect(Object.keys(reducerMap)).toEqual([actionType1, actionType2])
      const res1 = reducerMap[actionType1](0, { type: '' })
      expect(res1).toBe(3)
      const res2 = reducerMap[actionType2](0, { type: '' })
      expect(res2).toBe(7)
    })
  })

  describe(ReducerClassHelpers.prototype.addImmerIfNeeded.name, () => {
    test('returns original function if it passes the typeguard', () => {
      const testFn = () => undefined
      const resFn = reducerClassHelpers.addImmerIfNeeded(testFn)
      expect(resFn).toBe(testFn)
    })
    test("returns wrapped function if it doesn't pass the typeguard", () => {
      interface ITest {
        sum: number
      }
      const resSum = 42
      const testFn = (state: ITest, draft: ITest, action: any) => {
        draft.sum = resSum
        return undefined
      }
      const resFn = reducerClassHelpers.addImmerIfNeeded(testFn)
      expect(resFn).not.toBe(testFn)
      const { sum } = resFn({ sum: 0 }, { type: '' })
      expect(sum).toBe(resSum)
    })
  })
})
