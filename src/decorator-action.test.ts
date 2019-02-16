// tslint:disable max-classes-per-file
import 'reflect-metadata'

import { ActionStandard } from 'flux-action-class'
import { createAction } from 'redux-actions'

import { METADATA_KEY_ACTION } from './constants'
import { Action, IActionConstructor } from './decorator-action'
import { ActionTypeUnclearError, MetadataActionPropsMissingError } from './errors'

describe('Action', () => {
  describe('with reflection', () => {
    test('sets metadata', () => {
      const prop1 = 'test1'
      const prop2 = 'test2'
      const prop3 = 'test3'
      const prop4 = 'test4'
      class Action1 extends ActionStandard {}
      const action2Type = 'action2Type'
      class Action2 {
        public readonly type = action2Type
        constructor(public payload: any) {}
      }
      class Test {
        @Action
        public [prop1](state: any, action: Action1) {} // tslint:disable-line no-empty

        @Action
        public [prop2](state: any, action: Action2) {} // tslint:disable-line no-empty

        @Action
        public [prop3](state: any, draft: any, action: Action1) {} // tslint:disable-line no-empty

        @Action
        public [prop4](state: any, draft: any, action: Action2) {} // tslint:disable-line no-empty
      }
      const metadataExpected1 = [Action1.type]
      const metadataExpected2 = [action2Type]
      const metadataFromClass1 = Reflect.getMetadata(METADATA_KEY_ACTION, Test.prototype, prop1)
      expect(metadataFromClass1).toEqual(metadataExpected1)
      const metadataFromClass2 = Reflect.getMetadata(METADATA_KEY_ACTION, Test.prototype, prop2)
      expect(metadataFromClass2).toEqual(metadataExpected2)
      const metadataFromClass3 = Reflect.getMetadata(METADATA_KEY_ACTION, Test.prototype, prop3)
      expect(metadataFromClass3).toEqual(metadataExpected1)
      const metadataFromClass4 = Reflect.getMetadata(METADATA_KEY_ACTION, Test.prototype, prop4)
      expect(metadataFromClass4).toEqual(metadataExpected2)
      const metadataFromInstance1 = Reflect.getMetadata(METADATA_KEY_ACTION, new Test(), prop1)
      expect(metadataFromInstance1).toEqual(metadataExpected1)
      const metadataFromInstance2 = Reflect.getMetadata(METADATA_KEY_ACTION, new Test(), prop2)
      expect(metadataFromInstance2).toEqual(metadataExpected2)
      const metadataFromInstance3 = Reflect.getMetadata(METADATA_KEY_ACTION, new Test(), prop3)
      expect(metadataFromInstance3).toEqual(metadataExpected1)
      const metadataFromInstance4 = Reflect.getMetadata(METADATA_KEY_ACTION, new Test(), prop4)
      expect(metadataFromInstance4).toEqual(metadataExpected2)
    })
    test('throws if no action argument provided', () => {
      const createFalseClass = () => {
        // @ts-ignore
        class Test {
          @Action
          public test() {} // tslint:disable-line no-empty
        }
      }
      expect(createFalseClass).toThrow(ActionTypeUnclearError)
    })
    test('throws if too many action arguments provided', () => {
      const createFalseClass = () => {
        // @ts-ignore
        class Test {
          @Action
          public test(arg1: any, arg2: any, arg3: any, arg4: any) {} // tslint:disable-line no-empty
        }
      }
      expect(createFalseClass).toThrow(ActionTypeUnclearError)
    })
    test('throws if action argument type is unclear', () => {
      const createFalseClass = () => {
        // @ts-ignore
        class Test {
          @Action
          public test(arg1: any, arg2: undefined) {} // tslint:disable-line no-empty
        }
      }
      expect(createFalseClass).toThrow(ActionTypeUnclearError)
    })
  })

  describe('without reflection', () => {
    test('sets metadata', () => {
      const prop = 'test'
      // Check works with flux-action-standard
      class Action1 extends ActionStandard {}
      // Check works with plain strings
      const actionType2 = 'actionType2'
      class Action3 extends ActionStandard {}
      // Check works with ES6 classes
      const action4Type = 'action4Type'
      class Action4 {
        public readonly type = action4Type
        constructor(public payload: any) {}
      }
      // Check works with ES5 clases
      const actionTypeES5Class = 'actionTypeES5Class'
      function ActionES5Class(this: any) {
        this.type = actionTypeES5Class
      }
      // Check works with redux-actions
      const actionTypeReduxActions1 = 'actionTypeReduxActions1'
      const actionCreatorReduxActions1 = createAction(actionTypeReduxActions1)
      const actionTypeReduxActionsFailsDueToMissingArguments = 'actionTypeReduxActionsFailsDueToMissingArguments'
      const actionCreatorReduxActionsFailsDueToMissingArguments = createAction(
        actionTypeReduxActionsFailsDueToMissingArguments,
        () => {
          throw new Error()
        },
      )
      // Checl works with arrow function action creators
      const actionTypeArrowFn1 = 'actionTypeArrowFn1'
      const actionCreatorArrowFn1 = () => ({
        type: actionTypeArrowFn1,
      })
      // Checl works with regular function action creators
      const actionTypeRegularFn1 = 'actionTypeArrowFn1'
      function actionCreatorRegularFn1() {
        return {
          type: actionTypeRegularFn1,
        }
      }
      class Test {
        @Action(
          Action1,
          actionType2,
          Action3,
          Action4,
          actionCreatorReduxActions1,
          actionCreatorReduxActionsFailsDueToMissingArguments,
          actionCreatorArrowFn1,
          (ActionES5Class as any) as IActionConstructor,
          actionCreatorRegularFn1,
        )
        public [prop]() {} // tslint:disable-line no-empty
      }
      const metadataExpected = [
        Action1.type,
        actionType2,
        Action3.type,
        action4Type,
        actionTypeReduxActions1,
        actionTypeReduxActionsFailsDueToMissingArguments,
        actionTypeArrowFn1,
        actionTypeES5Class,
        actionTypeRegularFn1,
      ]
      const metadataFromClass = Reflect.getMetadata(METADATA_KEY_ACTION, Test.prototype, prop)
      expect(metadataFromClass).toEqual(metadataExpected)
      const metadataFromInstance = Reflect.getMetadata(METADATA_KEY_ACTION, new Test(), prop)
      expect(metadataFromInstance).toEqual(metadataExpected)
    })
    test('throws if no actions passed', () => {
      const createFalseClass = () => {
        // @ts-ignore
        class Test {
          @Action()
          public test() {} // tslint:disable-line no-empty
        }
      }
      expect(createFalseClass).toThrow(MetadataActionPropsMissingError)
    })
  })
})
