# redux-toolkit

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
