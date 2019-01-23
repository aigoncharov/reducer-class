# reducer-class

Boilerplate free class-based reducer creator. Built with TypeScript. Works with Redux and NGRX. Has integration with [immer](https://github.com/mweststrate/immer).

Heavily inspired by awesome [ngrx-actions](https://github.com/amcdnl/ngrx-actions). It's pretty much a re-write of its reducer-related functionality with stricter typings, usage of reflected typed and leaving aside Angular-only functionality. This library is framework-agnostic and should work with any Redux implementation (Redux, NGRX).

Consider using it with [flux-action-class](https://github.com/keenondrums/flux-action-class).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
  - [Angular](#angular)
  - [React](#react)
- [Quick start](#quick-start)
  - [Recommended](#recommended)
  - [Classic NGRX actions](#classic-ngrx-actions)
  - [Old school: action type constants](#old-school-action-type-constants)
  - [JavaScript with flux-action-class](#javascript-with-flux-action-class)
  - [Old school: JavaScript](#old-school-javascript)
- [Integration with `immer`](#integration-with-immer)
- [In depth](#in-depth)
  - [When to use `@ActionReflect`](#when-to-use-actionreflect)
  - [Running several reducers for the same action](#running-several-reducers-for-the-same-action)
- [How does it compare to ngrx-actions?](#how-does-it-compare-to-ngrx-actions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### Angular

1. Run
   ```
   npm i reducer-class
   ```
1. If you use TypeScript set in you tsconfig.json

   ```json
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true,
   ```

### React

1. Run
   ```
   npm i reducer-class reflect-metadata
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

## Quick start

### Recommended

```ts
import { ActionStandard } from 'flux-action-class'
import { Action, ActionReflect, ReducerClass } from 'reducer-class'

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

  @ActionReflect
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

### Classic NGRX actions

```ts
import { Action, ActionReflect, ReducerClass } from 'reducer-class'

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

  @ActionReflect
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

> You might have noticed that `ActionReflect` is missing in this version. It's because we no longer use classes for our actions and TypeScript can not provide type metadata.

### JavaScript with flux-action-class

```js
import { ActionStandard } from 'flux-action-class'
import { Action, ReducerClass } from 'reducer-class'

class ActionCatEat {}
class ActionCatPlay {}
class ActionCatBeAwesome {}

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

> We can not use `ActionReflect` in JavaScript because there's no complie which provides us with metadata for type reflection.

> Be aware, you have to configure [babel](https://babeljs.io/) to provide you with decorator syntax.

### Old school: JavaScript

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

## Integration with `immer`

If your reducer expects 3 arguments `reducer-class` automatically wraps it with `produce` from [immer](https://github.com/mweststrate/immer).

1. Original readonly state
1. Draft of the new state that you should mutate
1. Action

Why 3? [Read pitfall #3 from immer's official documentation.](https://github.com/mweststrate/immer#pitfalls)

```ts
import { ActionStandard } from 'flux-action-class'
import { Action, ActionReflect, ReducerClass, Immutable } from 'reducer-class'

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

  @ActionReflect
  addEnergy(state: Immutable<IReducerCatState>, draft: IReducerCatState, action: ActionCatEat) {
    draft.energy += action.payload
  }

  @Action(ActionCatPlay, ActionCatBeAwesome)
  wasteEnegry(state: Immutable<IReducerCatState>, draft: IReducerCatState, action: ActionCatPlay | ActionCatBeAwesome) {
    draft.energy -= action.payload
  }
}

const reducer = ReducerCat.create()
```

> You might have noticed a new import - `Immutable`. It's just a cool name for [DeepReadonly type](https://github.com/gcanti/typelevel-ts#deepreadonly). You don't have to use it. The example above would work just fine if used just `IReducerCatState`. Yet it's recommended to wrap it with `Immutable` to ensure that you never mutate it.

## In depth

### When to use `@ActionReflect`

You can use `@ActionReflect` if you want to run a reducer function for a single action. **Works with TypeScript only!** Action must be a class-based action. It can be a flux-action-class' action, a classic NGRX class-based action or any other class which has eaither a static property `type` or a property `type` on the instance of the class.

### Running several reducers for the same action

If you have declare several reducer functions corresponding to the same action `reducer-class` runs all of them serially (it uses its own implementation of (reduce-reducers)[https://github.com/redux-utilities/reduce-reducers]). The order is defined by [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).

```ts
import { ActionStandard } from 'flux-action-class'
import { Action, ActionReflect, ReducerClass } from 'reducer-class'

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

  @ActionReflect
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

## How does it compare to [ngrx-actions](https://github.com/amcdnl/ngrx-actions)?

1. Stricter typings. Now you'll never forget to add initial state, return a new state from your reducer and accidentally invoke `immer` as a result and etc.
1. `@ActionReflect` can be used to automaticaly reflect a corresponding action from the type.
1. `ngrx-actions` doesn't allow matching several reducers to the same action, while `reducer-class` allows you to do that and merges them for you.
1. `reducer-class` is built with both worlds, Angular and Redux, in mind. It means equal support for both of them!
