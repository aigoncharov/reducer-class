import { METADATA_KEY_ACTION } from './constants'
import { ReducerClass } from './reducer-class'
import { IReducerClassConstraint, ReducerClassMethod } from './reducer-class-helpers'

export abstract class ReducerClassMixin<T> implements IReducerClassConstraint<T> {
  [methodName: string]: ReducerClassMethod<T>
}
type AbstractConstructor<T> = Function & { prototype: IReducerClassConstraint<T> } // tslint:disable-line ban-types
export const Extend = <T>(...mixins: Array<AbstractConstructor<T>>) => (target: new () => ReducerClass<T>) => {
  for (const mixin of mixins) {
    const mixinKeys = Object.getOwnPropertyNames(mixin.prototype)
    for (const mixinKey of mixinKeys) {
      if (!(mixinKey in target.prototype) && mixinKey !== 'constructor') {
        target.prototype[mixinKey] = mixin.prototype[mixinKey as keyof typeof mixin]
        const mixinKeyMetadata = Reflect.getMetadata(METADATA_KEY_ACTION, mixin.prototype, mixinKey)
        Reflect.defineMetadata(METADATA_KEY_ACTION, mixinKeyMetadata, target.prototype, mixinKey)
      }
    }
  }
}
