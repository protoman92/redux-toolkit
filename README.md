# redux-toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/protoman92/redux-toolkit.svg?branch=master)](https://travis-ci.org/protoman92/redux-toolkit)
[![Coverage Status](https://coveralls.io/repos/github/protoman92/redux-toolkit/badge.svg?branch=master)](https://coveralls.io/github/protoman92/redux-toolkit?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Not to be confused with the official [redux-toolkit](https://github.com/reduxjs/redux-toolkit).

This library is relatively unopinionated about your specific Redux setup. It
offers the following functionalities:

## Redux components creators

Redux components creators automatically generate action creators and reducers
for specific properties in a state object, and are able to handle different
property types:

```javascript
interface State {
  property1: { a: number; b: string };
  property2: string[];
  property3: boolean;
}

/** We need to prefix in order to prevent type conflicts in the reducer.
const PREFIX = "PREFIX" as const;

/** 
 * Since property1 is an object, there will be object-related action creators:
 * - property1ActionCreators.Object_delete_property_property1
 * - property1ActionCreators.Object_merge_property_property1
 * - property1ActionCreators.Object_set_property_property1
 * Similarly, different property types will have different action creators.
 * The convention of the generated names is:
 * `${PREFIX}_(Array|Boolean|Object)_(action)_${StateKey}
 */
const {
  actionCreators: property1ActionCreators,
  reducer: property1Reducer,
} = createReduxComponents<
  State,
  "property1",
  typeof PREFIX
>({
  actionPrefix: PREFIX,
  propertyType: "OBJECT",
  stateKey: "property1",
});

/** Set up the other action creators */
const allActionCreators = {
  ...property1ActionCreators,
  ...property2ActionCreators,
  ...property3ActionCreators,
}

const reducer = combineReducer(
  defaultState,
  property1Reducer,
  property2Reducer,
  property3Reducer
)
```

If you have a default state object, such as:

```javascript
interface State {
  a: number;
  b: number;
  c: boolean | undefined
}

const defaultState: State = { a: 1, b: 2, c: undefined };
```

You can also use `createBulkReduxComponents` to automatically provide action
creators and reducer for all eligible properties:

```javascript
/** 
 * Explicit types are required when we use this function because it needs to 
 * infer the type suggestions.
 */
const { actionCreators, reducer } = createBulkReduxComponents<State, 'PREFIX'>({
  actionPrefix: 'PREFIX',
  state: { a: [], b: true },
  /** 
   * For eligible properties that can be null/undefined, you will need to 
   * provide a typeSuggestions object in order to hint at the property's type.
   * This is required because we are not able to ascertain their actual types
   * during runtime if they are initialized with null/undefined.
   * 
   * If you don't have any property that can be null/undefined, typeSuggestions
   * can be safely omitted. 
   */
  typeSuggestions: { c: 'BOOLEAN' }
});

/** 
 * You can access the action creators like so (note that the key postfixes have
 * been removed since the action creators are already namespaced):
 */
actionCreators.a.Array_push(0);
actionCreators.b.Boolean_set_true;
/** 
 * Even if we initialized c with undefined, we are still able to use these
 * action creators. 
 */
actionCreators.c.Boolean_set_false;
```

## Redux undo component creator

The undo component creator helps you wrap an existing reducer to provide it with
undo functionalities.

```javascript
const {
  actionCreators,
  reducer: reducerWithHistory
} = createUndoReduxComponents<State, 'PREFIX', 'a' | 'b'>({
  actionPrefix: 'PREFIX',
  /** The key to keep track of the history in state. Defaults to 'history' */
  historyKey: 'history',
  /** Track only certain keys in the state object */
  keysToTrack: ['a', 'b'],
  /** Keep a maximum of 5 past states */
  limit: 5,
  originalReducer: (state, action) => state 
});

/** Restore the last state in the past history */
dispatch(actionCreators.undo);
dispatch(actionCreators.undo);
dispatch(actionCreators.undo);
```

## RxJS helpers

For an introduction to **RxJS**, please visit their [page](https://github.com/ReactiveX/rxjs).

For an introduction to **redux-observable**, please visit their [page](https://github.com/redux-observable/redux-observable).

### createOfActionType

This helper creates a rxjs operator that correctly filters the specified action
types, and the actions that get emitted will have all their properties in tact
for type safety. Take a look at the [sample test code](./src/rxjs.test.ts) for
an example of how it would look in practice.

```javascript
actionStream.pipe(
  ofActionType('ACTION_1'),
  tap((action) => {
    /** Outputs 'ACTION_1' */
    console.log(action.type);
    /** This should be type-safe */
    console.log(action.property);
  }
)
```

## Convenient interfaces

### ActionType

This type extracts all actions defined in an object - for e.g.:

```javascript
const actionCreators = {
  a: { type: 'A' as const },
  /**
   * It's able to infer function return types, so don't worry about using an
   * action creator function.
   */
  b: ( property: string) => ({ property, type: 'B' as const }),
  /**
   * It can also handle nested action creators. This works well with bulk
   * redux components, because the resulting action creators object consists
   * of other action creators namespaced by state keys.
   */
  c: {
    d: { type: 'D' as const },
    e: () => ({ type: 'E' as const })
  }
}

type AllActionType = ActionType<typeof actionCreators>;
/** Equivalent to */
type AllActionType2 =
  | { type: 'A' as const } 
  | { property: string; type: 'B' as const }
  | { type: 'D' as const }
  | { type: 'E' as const }
```
