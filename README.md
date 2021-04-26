# redux-toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/protoman92/redux-toolkit.svg?branch=master)](https://travis-ci.org/protoman92/redux-toolkit)
[![Coverage Status](https://coveralls.io/repos/github/protoman92/redux-toolkit/badge.svg?branch=master)](https://coveralls.io/github/protoman92/redux-toolkit?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Not to be confused with the official [redux-toolkit](https://github.com/reduxjs/redux-toolkit).

This library is relatively unopinionated about your specific Redux setup. It
offers the following functionalities:

## State property helpers

State property helpers automatically generate action creators and reducers for
specific properties in a state object, and are able to handle different property
types:

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
 * - PROPERTY_1_ACTION_CREATORS.Object_delete_property_property1
 * - PROPERTY_1_ACTION_CREATORS.Object_merge_property_property1
 * - PROPERTY_1_ACTION_CREATORS.Object_set_property_property1
 * Similarly, different property types will have different action creators.
 * The convention of the generated names is:
 * `${PREFIX}_(Array|Boolean|Object)_(action)_${StateKey}
 */
const {
  actionCreators: PROPERTY_1_ACTION_CREATORS,
  reducer: PROPERTY_1_REDUCER,
} = createStatePropertyHelper<
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
  ...PROPERTY_1_ACTION_CREATORS,
  ...PROPERTY_2_ACTION_CREATORS,
  ...PROPERTY_3_ACTION_CREATORS,
}

const reducer = combineReducer(
  defaultState,
  PROPERTY_1_REDUCER,
  PROPERTY_2_REDUCER,
  PROPERTY_3_REDUCER
)
```

If you have a default state object, such as:

```javascript
const defaultState = { a: 1, b: 2 };
```

You can also use `createStatePropertyHelpers` to automatically provide action
creators and reducer for all eligible properties:

```
const { actionCreators, reducer } = createStatePropertyHelpers({
  actionPrefix: PREFIX,
  state: { a: [], b: true }
});

/** You can access the action creators like so */
actionCreators.a.Array_push_a(0);
actionCreators.b.Boolean_set_true_b;
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
  b: ( property: string) => ({ property, type: 'B' as const }),
}

type AllActionType = ActionType<typeof actionCreators>;
/** Equivalent to */
type AllActionType2 =
  | { type: 'A' as const } 
  | { property: string; type: 'B' as const }
```

It's able to infer function return types, so don't worry about using an action
creator function.
