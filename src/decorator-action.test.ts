// tslint:disable max-classes-per-file
import 'reflect-metadata'

import { ActionStandard } from 'flux-action-class'

import { METADATA_KEY_ACTION } from './constants'
import { Action } from './decorator-action'
import { MetadataActionPropsMissingError } from './errors'

describe('Action', () => {
  test('sets metadata', () => {
    const prop = 'test'
    class Action1 extends ActionStandard {}
    const actionType2 = 'actionType2'
    class Action3 extends ActionStandard {}
    class Test {
      @Action(Action1, actionType2, Action3)
      public [prop]() {} // tslint:disable-line no-empty
    }
    const metadataExpected = [Action1.type, actionType2, Action3.type]
    const metadataFromClass = Reflect.getMetadata(METADATA_KEY_ACTION, Test.prototype, prop)
    expect(metadataFromClass).toEqual(metadataExpected)
    const metadataFromInstance = Reflect.getMetadata(METADATA_KEY_ACTION, new Test(), prop)
    expect(metadataFromInstance).toEqual(metadataExpected)
  })
  test('throws if no actions passed', () => {
    const prop = 'test'
    const createFalseClass = () => {
      // @ts-ignore
      class Test {
        @Action()
        public [prop]() {} // tslint:disable-line no-empty
      }
    }
    expect(createFalseClass).toThrow(MetadataActionPropsMissingError)
  })
})
