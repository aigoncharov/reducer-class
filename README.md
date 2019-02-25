# reducer-class [![Build Status](https://travis-ci.org/keenondrums/reducer-class.svg?branch=master)](https://travis-ci.org/keenondrums/reducer-class) [![Coverage Status](https://coveralls.io/repos/github/keenondrums/reducer-class/badge.svg)](https://coveralls.io/github/keenondrums/reducer-class) [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Boilerplate%20free%20class-based%20reducer%20creator&url=https://github.com/keenondrums/reducer-class&hashtags=javascript,typescript,redux,flux,ngrx,reducer,class)

Boilerplate free class-based reducer creator. Built with TypeScript. Works with Redux and NGRX. Has integration with [immer](https://github.com/mweststrate/immer).

Heavily inspired by awesome [ngrx-actions](https://github.com/amcdnl/ngrx-actions). It's pretty much a re-write of its reducer-related functionality with stricter typings, usage of reflected typed and leaving aside Angular-only functionality. This library is framework-agnostic and should work with any Redux implementation (Redux, NGRX).

Consider using it with [flux-action-class](https://github.com/keenondrums/flux-action-class).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
  - [Angular](#angular)
  - [React](#react)
- [Quick start](#quick-start)
  - [Recommended (with flux-action-class)](#recommended-with-flux-action-class)
  - [Classic NGRX actions](#classic-ngrx-actions)
  - [With redux-actions](#with-redux-actions)
  - [Old school: action type constants](#old-school-action-type-constants)
- [Integration with `immer`](#integration-with-immer)
- [Reusing reducers](#reusing-reducers)
  - [Step 1](#step-1)
  - [Step 2](#step-2)
  - [How can I make shared reducer's logic dynamic?](#how-can-i-make-shared-reducers-logic-dynamic)
- [In depth](#in-depth)
  - [When can we omit list of actions for `@Action`?](#when-can-we-omit-list-of-actions-for-action)
  - [Running several reducers for the same action](#running-several-reducers-for-the-same-action)
  - [How does @Extend work?](#how-does-extend-work)
- [How does it compare to ngrx-actions?](#how-does-it-compare-to-ngrx-actions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### Angular

1. Run
   ```
   npm i reducer-class immer
   ```
1. If you use TypeScript set in you tsconfig.json

   ```json
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true,
   ```

1. If you use JavaScript configure your babel to support decorators and class properties

### React

1. Run
   ```
   npm i reducer-class immer reflect-metadata
   ```
1. At the top of your project root file (most probably `index.tsx`) add
   ```ts
   import 'reflect-metadata'
   ```
1. If you use TypeScript set in you tsconfig.json

   ```json
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true,
   ```

1. If you use JavaScript configure your babel to support decorators and class properties

## Quick start

### Recommended (with [flux-action-class](https://github.com/keenondrums/flux-action-class))

```ts
import { ActionStandard } from 'flux-action-class'
import { Action, ReducerClass } from 'reducer-class'

class ActionCatEat extends ActionStandard<number> {}
class ActionCatPlay extends ActionStandard<number> {}
class ActionCatBeAwesome extends ActionStandard<number> {}

interface IReducerCatState {
  energy: number
}
class ReducerCat extends ReducerClass<IReducerCatState> {
  initialState = {
    energy: 100,
  }

  @Action
  addEnergy(state: IReducerCatState, action: ActionCatEat) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state: IReducerCatState, action: ActionCatPlay | ActionCatBeAwesome) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

<details>
<summary>JavaScript version</summary>

```js
import { ActionStandard } from 'flux-action-class'
import { Action, ReducerClass } from 'reducer-class'

class ActionCatEat extends ActionStandard {}
class ActionCatPlay extends ActionStandard {}
class ActionCatBeAwesome extends ActionStandard {}

class ReducerCat extends ReducerClass {
  initialState = {
    energy: 100,
  }

  @Action(ActionCatEat)
  addEnergy(state, action) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state, action) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

> We can not use `Action` without arguments in JavaScript because there's no compiler which provides us with metadata for type reflection.

</details>

### Classic NGRX actions

```ts
import { Action, ReducerClass } from 'reducer-class'

class ActionCatEat {
  type = 'ActionCatEat'
  constructor(public payload: number) {}
}
class ActionCatPlay {
  type = 'ActionCatPlay'
  constructor(public payload: number) {}
}
class ActionCatBeAwesome {
  type = 'ActionCatBeAwesome'
  constructor(public payload: number) {}
}

interface IReducerCatState {
  energy: number
}
class ReducerCat extends ReducerClass<IReducerCatState> {
  initialState = {
    energy: 100,
  }

  @Action
  addEnergy(state: IReducerCatState, action: ActionCatEat) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state: IReducerCatState, action: ActionCatPlay | ActionCatBeAwesome) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

<details>
<summary>JavaScript version</summary>

```js
import { Action, ReducerClass } from 'reducer-class'

class ActionCatEat {
  type = 'ActionCatEat'
  constructor(payload) {
    this.payload = payload
  }
}
class ActionCatPlay {
  type = 'ActionCatPlay'
  constructor(payload) {
    this.payload = payload
  }
}
class ActionCatBeAwesome {
  type = 'ActionCatBeAwesome'
  constructor(payload) {
    this.payload = payload
  }
}

class ReducerCat extends ReducerClass {
  initialState = {
    energy: 100,
  }

  @Action(ActionCatEat)
  addEnergy(state, action) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state, action) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

> We can not use `Action` without arguments in JavaScript because there's no compiler which provides us with metadata for type reflection.

</details>

### With [redux-actions](https://github.com/redux-utilities/redux-actions)

```ts
import { Action, ReducerClass } from 'reducer-class'
import { createAction } from 'redux-actions'

const actionCatEat = createAction('actionTypeCatEat')
const actionCatPlay = createAction('actionTypeCatPlay')
const actionCatBeAwesome = createAction('actionTypeCatBeAwesome')

interface IReducerCatState {
  energy: number
}
class ReducerCat extends ReducerClass<IReducerCatState> {
  initialState = {
    energy: 100,
  }

  @Action(actionCatEat)
  addEnergy(state: IReducerCatState, action: { payload: number }) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(actionCatPlay, actionCatBeAwesome)
  wasteEnegry(state: IReducerCatState, action: { payload: number }) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

> You might have noticed that we always pass actions to `Action` in this version. It's because we no longer use classes for our actions and TypeScript can not provide type metadata.

<details>
<summary>JavaScript version</summary>

```js
import { Action, ReducerClass } from 'reducer-class'
import { createAction } from 'redux-actions'

const actionCatEat = createAction('actionTypeCatEat')
const actionCatPlay = createAction('actionTypeCatPlay')
const actionCatBeAwesome = createAction('actionTypeCatBeAwesome')

class ReducerCat extends ReducerClass {
  initialState = {
    energy: 100,
  }

  @Action(actionCatEat)
  addEnergy(state, action: { payload }) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(actionCatPlay, actionCatBeAwesome)
  wasteEnegry(state, action: { payload }) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

</details>

### Old school: action type constants

```ts
import { Action, ReducerClass } from 'reducer-class'

const actionTypeCatEat = 'actionTypeCatEat'
const actionTypeCatPlay = 'actionTypeCatPlay'
const actionTypeCatBeAwesome = 'actionTypeCatBeAwesome'

interface IReducerCatState {
  energy: number
}
class ReducerCat extends ReducerClass<IReducerCatState> {
  initialState = {
    energy: 100,
  }

  @Action(actionTypeCatEat)
  addEnergy(state: IReducerCatState, action: { payload: number }) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(actionTypeCatPlay, actionTypeCatBeAwesome)
  wasteEnegry(state: IReducerCatState, action: { payload: number }) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

> You might have noticed that we always pass actions to `Action` in this version. It's because we no longer use classes for our actions and TypeScript can not provide type metadata.

<details>
<summary>JavaScript version</summary>

```js
import { Action, ReducerClass } from 'reducer-class'

const actionTypeCatEat = 'actionTypeCatEat'
const actionTypeCatPlay = 'actionTypeCatPlay'
const actionTypeCatBeAwesome = 'actionTypeCatBeAwesome'

class ReducerCat {
  initialState = {
    energy: 100,
  }

  @Action(actionTypeCatEat)
  addEnergy(state, action) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(actionTypeCatPlay, actionTypeCatBeAwesome)
  wasteEnegry(state, action) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

</details>

## Integration with `immer`

If your reducer expects 3 arguments `reducer-class` automatically wraps it with `produce` from [immer](https://github.com/mweststrate/immer).

1. Original read-only state
1. Draft of the new state that you should mutate
1. Action

Why 3? [Read pitfall #3 from immer's official documentation.](https://github.com/mweststrate/immer#pitfalls)

```ts
import { ActionStandard } from 'flux-action-class'
import { Action, ReducerClass, Immutable } from 'reducer-class'

class ActionCatEat extends ActionStandard<number> {}
class ActionCatPlay extends ActionStandard<number> {}
class ActionCatBeAwesome extends ActionStandard<number> {}

interface IReducerCatState {
  energy: number
}
class ReducerCat extends ReducerClass<IReducerCatState> {
  initialState = {
    energy: 100,
  }

  @Action
  addEnergy(state: Immutable<IReducerCatState>, draft: IReducerCatState, action: ActionCatEat) {
    draft.energy += action.payload
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state: Immutable<IReducerCatState>, draft: IReducerCatState, action: ActionCatPlay | ActionCatBeAwesome) {
    draft.energy -= action.payload
    // Unfortunatelly, we can not omit `return` statement here due to how TypeScript handles `void`
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void
    return undefined
  }
}

const reducer = ReducerCat.create()
```

> As you can see we still return `undefined` from the reducer even though we use [immer](https://github.com/mweststrate/immer) and mutate our draft. Unfortunately, we can not omit `return` statement here due to [how TypeScript handles `void`](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void). We can not even write `return` (withour `undefined`), because TypeScript then presumes the method returns `void`.

> You might have noticed a new import - `Immutable`. It's just a cool name for [DeepReadonly type](https://github.com/gcanti/typelevel-ts#deepreadonly). You don't have to use it. The example above would work just fine if used just `IReducerCatState`. Yet it's recommended to wrap it with `Immutable` to ensure that you never mutate it.

> Actually it makes total sense to use `Immutable` for state of regular reducers as well to make sure you never modify state directly.

## Reusing reducers

So what if we want to share some logic between reducers?

### Step 1

Create a class with shared logic.

```ts
import { Action, ReducerClassMixin } from 'reducer-class'

interface IHungryState {
  hungry: boolean
}
export class ReducerHungry<T extends IHungryState> extends ReducerClassMixin<T> {
  @Action(ActionHungry)
  hugry(state: T) {
    return {
      ...state,
      hungry: true,
    }
  }

  @Action(ActionFull)
  full(state: T) {
    return {
      ...state,
      hungry: false,
    }
  }
}
```

> You might have noticed that made this class generic. We have to do that because we do not know what actual state we going to extend, we can only put a constraint on it to make sure it satisfies the structure we need. In other words, if we used `IHungryState` directly and returned `{ hungry: true }` (not `{ ...state, hungry: true }`) from `hungry` compiler wouldn't complain.

> You don't have to use `ReducerClassMixin` class. It's nothing but a convenience wrapper to make sure your class carries an index signature for type-safety. Alternatively you can use `IReducerClassConstraint` interface and `ReducerClassMethod` type.

<details>
<summary>How to use `IReducerClassConstraint` interface and `ReducerClassMethod` type instead of `ReducerClassMixin` class</summary>

```ts
import { Action, IReducerClassConstraint, ReducerClassMethod } from 'reducer-class'

interface IHungryState {
  hungry: boolean
}
export class ReducerHungry<T extends IHungryState> implements IReducerClassConstraint<T> {
  [methodName: string]: ReducerClassMethod<T>

  @Action(ActionHungry)
  hugry(state: T) {
    return {
      ...state,
      hungry: true,
    }
  }

  @Action(ActionFull)
  full(state: T) {
    return {
      ...state,
      hungry: false,
    }
  }
}
```

</details>

<details>
<summary>JavaScript version</summary>

```js
import { Action } from 'reducer-class'

export class ReducerHungry {
  @Action(ActionHungry)
  hugry(state) {
    return {
      ...state,
      hungry: true,
    }
  }

  @Action(ActionFull)
  full(state) {
    return {
      ...state,
      hungry: false,
    }
  }
}
```

</details>

### Step 2

Use @Extend decorator.

```ts
import { Action, Extend, ReducerClass } from 'reducer-class'

import { ReducerHungry } from 'shared'

interface ICatState {
  hugry: boolean
  enegry: number
}
@Extend<ICatState>(ReducerHungry)
class CatReducer extends ReducerClass<ICatState> {
  initialState = {
    energy: 100,
  }

  @Action
  addEnergy(state: ICatState, action: ActionCatEat) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state: ICatState, action: ActionCatPlay | ActionCatBeAwesome) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

> @Extend can accept as many arguments as you want.

Now our cat reducer uses `wasteEnegry` to handle actions `ActionCatPlay`, `ActionCatBeAwesome`, `addEnergy` to handle `ActionCatEat` and inherits `hugry` and `full` methods to handle `ActionHungry` and `ActionFull` from `ReducerHungry`.

<details>
<summary>JavaScript version</summary>

```js
import { Action, Extend, ReducerClass } from 'reducer-class'

import { ReducerHungry } from 'shared'

@Extend(ReducerHungry)
class CatReducer extends ReducerClass {
  initialState = {
    energy: 100,
  }

  @Action(ActionCatEat)
  addEnergy(state, action) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state, action) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

</details>

### How can I make shared reducer's logic dynamic?

You can use class factories.

```ts
import { Action, Extend, ReducerClass, ReducerClassMixin } from 'reducer-class'

interface IHungryState {
  hungry: boolean
}
export const makeReducerHungry = <T extends IHungryState>(actionHungry, actionFull) => {
  class Extender1 extends ReducerClassMixin<T> {
    @Action(actionHungry)
    hugry(state: T) {
      return {
        ...state,
        hungry: true,
      }
    }

    @Action(actionFull)
    full(state: T) {
      return {
        ...state,
        hungry: false,
      }
    }
  }
  return Extender1
}

interface ICatState {
  hugry: boolean
  enegry: number
}
@Extend<ICatState>(makeReducerHungry(ActionCatPlay, ActionCatEat))
class CatReducer extends ReducerClass<ICatState> {
  initialState = {
    energy: 100,
  }

  @Action
  addEnergy(state: ICatState, action: ActionCatEat) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action
  wasteEnegry(state: ICatState, action: ActionCatPlay) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

<details>
<summary>JavaScript version</summary>

```js
import { Action, Extend, ReducerClass } from 'reducer-class'

interface IHungryState {
  hungry: boolean;
}
export const makeReducerHungry = (actionHungry, actionFull) =>
  class {
    @Action(actionHungry)
    hugry(state) {
      return {
        ...state,
        hungry: true,
      }
    }

    @Action(actionFull)
    full(state) {
      return {
        ...state,
        hungry: false,
      }
    }
  }

@Extend(makeReducerHungry(ActionCatPlay, ActionCatEat))
class CatReducer extends ReducerClass {
  initialState = {
    energy: 100,
  }

  @Action(ActionCatEat)
  addEnergy(state, action) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action(ActionCatPlay)
  wasteEnegry(state, action) {
    return {
      energy: state.energy - action.payload,
    }
  }
}

const reducer = ReducerCat.create()
```

</details>

## In depth

### When can we omit list of actions for `@Action`?

You can omit list of actions for `@Action` if you want to run a reducer function for a single action. **Works with TypeScript only!** Action must be a class-based action. It can be a flux-action-class' action, a classic NGRX class-based action or any other class which has either a static property `type` or a property `type` on the instance of the class.

### Running several reducers for the same action

If you have declare several reducer functions corresponding to the same action `reducer-class` runs all of them serially. It uses its own implementation of [reduce-reducers](https://github.com/redux-utilities/reduce-reducers). The order is defined by [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).

```ts
import { ActionStandard } from 'flux-action-class'
import { Action, ReducerClass } from 'reducer-class'

class ActionCatEat extends ActionStandard<number> {}
class ActionCatSleep extends ActionStandard<number> {}

interface IReducerCatState {
  energy: number
}
class ReducerCat extends ReducerClass<IReducerCatState> {
  initialState = {
    energy: 100,
  }

  @Action(ActionCatEat, ActionCatSleep)
  addEnergy(state: IReducerCatState, action: ActionCatEat | ActionCatSleep) {
    return {
      energy: state.energy + action.payload,
    }
  }

  @Action
  addMoreEnergy(state: IReducerCatState, action: ActionCatSleep) {
    return {
      energy: state.energy + action.payload * 2,
    }
  }
}

const reducer = ReducerCat.create()

const res1 = reducer(undefined, new ActionCatSleep(10))
console.log(res1.energy) // logs 130: 100 - initial value, 10 is added by addEnergy, 10 * 2 is added by addMoreEnergy
const res2 = reducer(res1, new ActionCatEat(5))
console.log(res2) // logs 135: 130 - previous value, 5 is added by addEnergy
```

### How does @Extend work?

It iterates over its arguments and copies their methods and corresponding metadata to a prototype of our target reducer class.

## How does it compare to [ngrx-actions](https://github.com/amcdnl/ngrx-actions)?

1. Stricter typings. Now you'll never forget to add initial state, return a new state from your reducer and accidentally invoke `immer` as a result and etc.
1. `@Action` can be used to automatically reflect a corresponding action from the type.
1. `ngrx-actions` doesn't allow matching several reducers to the same action, while `reducer-class` allows you to do that and merges them for you.
1. `reducer-class` is built with both worlds, Angular and Redux, in mind. It means equal support for all of them!
1. `reducer-class` works with function-based action creators and supports [redux-actions](https://github.com/redux-utilities/redux-actions) out-of-the-box.
