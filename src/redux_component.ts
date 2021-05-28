import { Action } from "redux";
import { combineOptionalReducers, ReducerWithOptionalReturn } from "./reducer";
import { shallowCloneArray } from "./utils";

/** Use these property types to avoid adding unnecessary action creators */
const TYPE_PROPERTY_ARRAY = "ARRAY";
const TYPE_PROPERTY_BOOLEAN = "BOOLEAN";
const TYPE_PROPERTY_OBJECT = "OBJECT";

type Neverable<T> = T | null | undefined;
type CompatibleArray<T> = T[] | readonly T[];
type CompatibleObject<K extends string, V> = { [x in Extract<K, string>]: V };

type SupportedTypes =
  | CompatibleArray<unknown>
  | boolean
  | CompatibleObject<string, unknown>;

type ArrayPushAction<
  StateKey,
  StateValue extends CompatibleArray<unknown>,
  ActionPrefix extends string
> = Readonly<{
  type: `${ActionPrefix}_array_push_${Extract<StateKey, string>}`;
  value: StateValue[number];
}>;

type ArrayRemoveAction_Arguments<ArrayElement> = Readonly<
  | {
      index: number;
      predicate?: undefined;
    }
  | {
      index?: undefined;
      predicate: (currentValue: ArrayElement, index: number) => boolean;
    }
>;

type ArrayRemoveAction<
  StateKey,
  StateValue extends CompatibleArray<unknown>,
  ActionPrefix extends string
> = Readonly<
  {
    type: `${ActionPrefix}_array_remove_${Extract<StateKey, string>}`;
  } & ArrayRemoveAction_Arguments<StateValue[number]>
>;

type ArrayReplaceAction_Arguments<ArrayElement> = Readonly<
  (
    | { mapper?: undefined; value: ArrayElement }
    | {
        mapper: (currentValue: ArrayElement) => ArrayElement;
        value?: undefined;
      }
  ) &
    ArrayRemoveAction_Arguments<ArrayElement>
>;

type ArrayReplaceAction<
  StateKey,
  StateValue extends CompatibleArray<unknown>,
  ActionPrefix extends string
> = Readonly<
  {
    type: `${ActionPrefix}_array_replace_${Extract<StateKey, string>}`;
  } & ArrayReplaceAction_Arguments<StateValue[number]>
>;

type ArrayUnshiftAction<
  StateKey,
  StateValue extends CompatibleArray<unknown>,
  ActionPrefix extends string
> = Readonly<{
  type: `${ActionPrefix}_array_unshift_${Extract<StateKey, string>}`;
  value: StateValue[number];
}>;

type BooleanToggleAction<StateKey, ActionPrefix extends string> = Readonly<{
  type: `${ActionPrefix}_boolean_toggle_${Extract<StateKey, string>}`;
}>;

type BooleanSetFalseAction<StateKey, ActionPrefix extends string> = Readonly<{
  type: `${ActionPrefix}_boolean_set_true_${Extract<StateKey, string>}`;
}>;

type BooleanSetTrueAction<StateKey, ActionPrefix extends string> = Readonly<{
  type: `${ActionPrefix}_boolean_set_false_${Extract<StateKey, string>}`;
}>;

type DeleteAction<StateKey, ActionPrefix extends string> = Readonly<{
  type: `${ActionPrefix}_delete_${Extract<StateKey, string>}`;
}>;

type ObjectDeletePropertyAction<
  StateKey,
  StateValue extends CompatibleObject<string, unknown>,
  ActionPrefix extends string
> = Readonly<{
  key: keyof StateValue;
  type: `${ActionPrefix}_object_delete_property_${Extract<StateKey, string>}`;
}>;

type ObjectMergeAction<
  StateKey,
  StateValue extends CompatibleObject<string, unknown>,
  ActionPrefix extends string
> = Readonly<
  {
    type: `${ActionPrefix}_object_merge_${Extract<StateKey, string>}`;
  } & Partial<StateValue>
>;

type ObjectSetPropertyAction<
  StateKey,
  StateValue extends CompatibleObject<string, unknown>,
  ActionPrefix extends string
> = Readonly<{
  key: keyof StateValue;
  type: `${ActionPrefix}_object_set_property_${Extract<StateKey, string>}`;
  value: StateValue[keyof StateValue];
}>;

type MapAction<StateKey, StateValue, ActionPrefix extends string> = Readonly<{
  mapper: (current: StateValue) => StateValue;
  type: `${ActionPrefix}_map_${Extract<StateKey, string>}`;
}>;

type SetAction<StateKey, StateValue, ActionPrefix extends string> = Readonly<{
  type: `${ActionPrefix}_set_${Extract<StateKey, string>}`;
  value: StateValue;
}>;

type ActionCreatorsForAny<
  ActionCreatorKey,
  StateKey,
  StateValue,
  ActionPrefix extends string
> = {
  [x in `Map${Extract<ActionCreatorKey, string>}`]: (
    mapper: MapAction<StateKey, StateValue, ActionPrefix>["mapper"]
  ) => MapAction<StateKey, StateValue, ActionPrefix>;
} &
  {
    [x in `Set${Extract<ActionCreatorKey, string>}`]: (
      value: StateValue
    ) => SetAction<StateKey, StateValue, ActionPrefix>;
  } &
  /** Only support delete action if the state value can be undefined */
  (undefined extends StateValue
    ? {
        [x in `Delete${Extract<ActionCreatorKey, string>}`]: DeleteAction<
          StateKey,
          ActionPrefix
        >;
      }
    : {});

type ActionCreatorsForArray<
  ActionCreatorKey,
  StateKey,
  StateValue extends CompatibleArray<unknown>,
  ActionPrefix extends string
> = {
  [x in `Array_push${Extract<ActionCreatorKey, string>}`]: (
    value: StateValue[number]
  ) => ArrayPushAction<StateKey, StateValue, ActionPrefix>;
} &
  {
    [x in `Array_remove${Extract<ActionCreatorKey, string>}`]: (
      args: ArrayRemoveAction_Arguments<StateValue[number]>
    ) => ArrayRemoveAction<StateKey, StateValue, ActionPrefix>;
  } &
  {
    [x in `Array_replace${Extract<ActionCreatorKey, string>}`]: (
      args: ArrayReplaceAction_Arguments<StateValue[number]>
    ) => ArrayReplaceAction<StateKey, StateValue, ActionPrefix>;
  } &
  {
    [x in `Array_unshift${Extract<ActionCreatorKey, string>}`]: (
      value: StateValue[number]
    ) => ArrayUnshiftAction<StateKey, StateValue, ActionPrefix>;
  };

type ActionCreatorsForBoolean<
  ActionCreatorKey,
  StateKey,
  ActionPrefix extends string
> = {
  [x in `Boolean_set_false${Extract<
    ActionCreatorKey,
    string
  >}`]: BooleanSetFalseAction<StateKey, ActionPrefix>;
} &
  {
    [x in `Boolean_set_true${Extract<
      ActionCreatorKey,
      string
    >}`]: BooleanSetTrueAction<StateKey, ActionPrefix>;
  } &
  {
    [x in `Boolean_toggle${Extract<
      ActionCreatorKey,
      string
    >}`]: BooleanToggleAction<StateKey, ActionPrefix>;
  };

type ActionCreatorsForObject<
  ActionCreatorKey,
  StateKey,
  StateValue extends CompatibleObject<string, unknown>,
  ActionPrefix extends string
> = {
  [x in `Object_delete_property${Extract<ActionCreatorKey, string>}`]: <
    K extends keyof StateValue
  >(
    key: K
  ) => ObjectDeletePropertyAction<StateKey, StateValue, ActionPrefix>;
} &
  {
    [x in `Object_merge${Extract<ActionCreatorKey, string>}`]: (
      obj: Partial<StateValue>
    ) => ObjectMergeAction<StateKey, StateValue, ActionPrefix>;
  } &
  {
    [x in `Object_set_property${Extract<ActionCreatorKey, string>}`]: <
      K extends keyof StateValue
    >(
      key: K,
      value: StateValue[K]
    ) => ObjectSetPropertyAction<StateKey, StateValue, ActionPrefix>;
  };

type SupportedActionCreators<
  ActionCreatorKey,
  StateKey,
  StateValue,
  ActionPrefix extends string
> = StateValue extends CompatibleArray<any>
  ? ActionCreatorsForArray<ActionCreatorKey, StateKey, StateValue, ActionPrefix>
  : StateValue extends boolean
  ? ActionCreatorsForBoolean<ActionCreatorKey, StateKey, ActionPrefix>
  : StateValue extends CompatibleObject<string, unknown>
  ? ActionCreatorsForObject<
      ActionCreatorKey,
      StateKey,
      StateValue,
      ActionPrefix
    >
  : {};

type BulkActionCreator<
  State,
  ActionPrefix extends string,
  Suggestion extends TypeSuggestion<State> | undefined
> = Required<
  {
    [Key in keyof State]: ActionCreatorsForAny<
      "",
      Key,
      State[Key],
      ActionPrefix
    > &
      (Suggestion extends undefined
        ? SupportedActionCreators<"", Key, State[Key], ActionPrefix>
        : State[Key] extends Neverable<infer StateValue>
        ? SupportedActionCreators<"", Key, StateValue, ActionPrefix>
        : {});
  }
>;

type TypeSuggestionRequiredKeys<State> = Exclude<
  {
    [Key in keyof State]: State[Key] extends SupportedTypes
      ? undefined
      : State[Key] extends Neverable<infer StateValue>
      ? StateValue extends SupportedTypes
        ? Key
        : undefined
      : undefined;
  }[keyof State],
  undefined
>;

type TypeSuggestion<State> = {
  [Key in TypeSuggestionRequiredKeys<State>]: State[Key] extends Neverable<
    infer StateValue
  >
    ? StateValue extends CompatibleArray<unknown>
      ? typeof TYPE_PROPERTY_ARRAY
      : StateValue extends boolean
      ? typeof TYPE_PROPERTY_BOOLEAN
      : StateValue extends CompatibleObject<string, unknown>
      ? typeof TYPE_PROPERTY_OBJECT
      : undefined
    : undefined;
};

type StatePropertyHelper<
  State,
  StateKey extends keyof State,
  ActionPrefix extends string
> = {
  actionCreators: Readonly<
    (State[StateKey] extends Neverable<infer StateValue>
      ? StateValue extends CompatibleArray<unknown>
        ? ActionCreatorsForArray<
            `_${Extract<StateKey, string>}`,
            StateKey,
            StateValue,
            ActionPrefix
          >
        : {}
      : {}) &
      (State[StateKey] extends Neverable<infer StateValue>
        ? StateValue extends boolean
          ? ActionCreatorsForBoolean<
              `_${Extract<StateKey, string>}`,
              StateKey,
              ActionPrefix
            >
          : {}
        : {}) &
      (State[StateKey] extends Neverable<infer StateValue>
        ? StateValue extends CompatibleObject<string, unknown>
          ? ActionCreatorsForObject<
              `_${Extract<StateKey, string>}`,
              StateKey,
              StateValue,
              ActionPrefix
            >
          : {}
        : {}) &
      ActionCreatorsForAny<
        `_${Extract<StateKey, string>}`,
        StateKey,
        State[StateKey],
        ActionPrefix
      >
  >;
  reducer: ReducerWithOptionalReturn<State, Action>;
};

type CreateReduxComponentsArguments<
  State,
  StateKey extends keyof State,
  ActionPrefix extends string
> = Readonly<
  {
    actionPrefix: ActionPrefix;
    stateKey: StateKey;
  } & (State[StateKey] extends Neverable<CompatibleArray<unknown>>
    ? { propertyType: typeof TYPE_PROPERTY_ARRAY }
    : State[StateKey] extends Neverable<boolean>
    ? { propertyType: typeof TYPE_PROPERTY_BOOLEAN }
    : State[StateKey] extends Neverable<CompatibleObject<string, unknown>>
    ? { propertyType: typeof TYPE_PROPERTY_OBJECT }
    : { propertyType?: undefined })
>;

function isOfType<T extends { type: string }>(
  obj: Readonly<{ type: string }>,
  typeToCheck: string
): obj is T {
  return obj["type"] === typeToCheck;
}

export function createReduxComponents<
  State,
  StateKey extends keyof State,
  ActionPrefix extends string
>({
  actionPrefix,
  propertyType,
  stateKey,
}: CreateReduxComponentsArguments<
  State,
  StateKey,
  ActionPrefix
>): StatePropertyHelper<State, StateKey, ActionPrefix> {
  return ({
    actionCreators: {
      ...(propertyType === TYPE_PROPERTY_ARRAY
        ? {
            [`Array_push_${stateKey}`]: (
              value: State[StateKey] extends CompatibleArray<infer ArrayElement>
                ? ArrayElement
                : undefined
            ) => ({ value, type: `${actionPrefix}_array_push_${stateKey}` }),
            [`Array_remove_${stateKey}`]: (
              args: State[StateKey] extends CompatibleArray<infer ArrayElement>
                ? ArrayRemoveAction_Arguments<ArrayElement>
                : undefined
            ) => ({
              ...args,
              type: `${actionPrefix}_array_remove_${stateKey}`,
            }),
            [`Array_replace_${stateKey}`]: (
              args: State[StateKey] extends CompatibleArray<infer ArrayElement>
                ? ArrayReplaceAction_Arguments<ArrayElement>
                : undefined
            ) => ({
              ...args,
              type: `${actionPrefix}_array_replace_${stateKey}`,
            }),
            [`Array_unshift_${stateKey}`]: (
              value: State[StateKey] extends CompatibleArray<infer ArrayElement>
                ? ArrayElement
                : undefined
            ) => ({ value, type: `${actionPrefix}_array_unshift_${stateKey}` }),
          }
        : {}),
      ...(propertyType === TYPE_PROPERTY_BOOLEAN
        ? {
            [`Boolean_set_false_${stateKey}`]: {
              type: `${actionPrefix}_boolean_set_false_${stateKey}`,
            },
            [`Boolean_set_true_${stateKey}`]: {
              type: `${actionPrefix}_boolean_set_true_${stateKey}`,
            },
            [`Boolean_toggle_${stateKey}`]: {
              type: `${actionPrefix}_boolean_toggle_${stateKey}`,
            },
          }
        : {}),
      ...(propertyType === TYPE_PROPERTY_OBJECT
        ? {
            [`Object_delete_property_${stateKey}`]: (key: string) => ({
              key,
              type: `${actionPrefix}_object_delete_property_${stateKey}`,
            }),
            [`Object_merge_${stateKey}`]: (obj: object) => ({
              ...obj,
              type: `${actionPrefix}_object_merge_${stateKey}`,
            }),
            [`Object_set_property_${stateKey}`]: (
              key: string,
              value: unknown
            ) => ({
              key,
              value,
              type: `${actionPrefix}_object_set_property_${stateKey}`,
            }),
          }
        : {}),
      [`Delete_${stateKey}`]: { type: `${actionPrefix}_delete_${stateKey}` },
      [`Map_${stateKey}`]: (
        mapper: MapAction<StateKey, State[StateKey], ActionPrefix>["mapper"]
      ) => ({ mapper, type: `${actionPrefix}_map_${stateKey}` }),
      [`Set_${stateKey}`]: (value: State[StateKey]) => ({
        value,
        type: `${actionPrefix}_set_${stateKey}`,
      }),
    },
    reducer: combineOptionalReducers(
      ...(propertyType === TYPE_PROPERTY_ARRAY
        ? [
            (state: State, action: Action) => {
              if (
                isOfType<ArrayPushAction<State, unknown[], ActionPrefix>>(
                  action,
                  `${actionPrefix}_array_push_${stateKey}`
                )
              ) {
                const arrayState = shallowCloneArray(state[stateKey] as any);
                arrayState.push(action.value);
                return { ...state, [stateKey]: arrayState };
              }

              if (
                isOfType<ArrayUnshiftAction<StateKey, unknown[], ActionPrefix>>(
                  action,
                  `${actionPrefix}_array_unshift_${stateKey}`
                )
              ) {
                const arrayState = shallowCloneArray(state[stateKey] as any);
                arrayState.unshift(action.value);
                return { ...state, [stateKey]: arrayState };
              }

              return undefined;
            },
            (state: State, action: Action) => {
              let elementMapper: ((currentValue: any) => any) | undefined;
              let isRemoveAction = false;

              /* istanbul ignore else */
              if (
                isOfType<ArrayRemoveAction<StateKey, unknown[], ActionPrefix>>(
                  action,
                  `${actionPrefix}_array_remove_${stateKey}`
                )
              ) {
                isRemoveAction = true;
              } else if (
                isOfType<ArrayReplaceAction<StateKey, unknown[], ActionPrefix>>(
                  action,
                  `${actionPrefix}_array_replace_${stateKey}`
                )
              ) {
                if ("value" in action && action.mapper == null) {
                  elementMapper = () => action.value;
                } else {
                  elementMapper = action.mapper;
                }
              } else {
                return undefined;
              }

              const arrayState = shallowCloneArray(state[stateKey] as any);
              let index = -1;

              let findIndexFn:
                | Parameters<Array<any>["findIndex"]>[0]
                | undefined;

              if (action.index != null) {
                index = action.index;
              } else if (action.predicate != null) {
                findIndexFn = action.predicate;
              }

              if (findIndexFn != null) {
                index = arrayState.findIndex(findIndexFn);
              }

              if (index >= 0 && index < arrayState.length) {
                if (isRemoveAction) {
                  arrayState.splice(index, 1);
                } else if (elementMapper != null) {
                  arrayState[index] = elementMapper(arrayState[index]);
                }
              }

              return { ...state, [stateKey]: arrayState };
            },
          ]
        : []),
      ...(propertyType === TYPE_PROPERTY_BOOLEAN
        ? [
            (state: State, action: Action) => {
              /* istanbul ignore else */
              if (
                isOfType<BooleanSetTrueAction<StateKey, ActionPrefix>>(
                  action,
                  `${actionPrefix}_boolean_set_true_${stateKey}`
                )
              ) {
                return { ...state, [stateKey]: true };
              } else if (
                isOfType<BooleanSetFalseAction<StateKey, ActionPrefix>>(
                  action,
                  `${actionPrefix}_boolean_set_false_${stateKey}`
                )
              ) {
                return { ...state, [stateKey]: false };
              } else if (
                isOfType<BooleanToggleAction<StateKey, ActionPrefix>>(
                  action,
                  `${actionPrefix}_boolean_toggle_${stateKey}`
                )
              ) {
                return { ...state, [stateKey]: !state[stateKey] };
              } else {
                return undefined;
              }
            },
          ]
        : []),
      ...(propertyType === TYPE_PROPERTY_OBJECT
        ? [
            (state: State, action: Action) => {
              /* istanbul ignore else */
              if (
                isOfType<
                  ObjectDeletePropertyAction<StateKey, {}, ActionPrefix>
                >(action, `${actionPrefix}_object_delete_property_${stateKey}`)
              ) {
                const objectState = { ...state[stateKey] } as any;
                delete objectState[action.key];
                return { ...state, [stateKey]: objectState };
              } else if (
                isOfType<ObjectMergeAction<StateKey, {}, ActionPrefix>>(
                  action,
                  `${actionPrefix}_object_merge_${stateKey}`
                )
              ) {
                const { type, ...mergeObj } = action;
                const objectState = { ...state[stateKey], ...mergeObj } as any;
                return { ...state, [stateKey]: objectState };
              } else if (
                isOfType<ObjectSetPropertyAction<StateKey, {}, ActionPrefix>>(
                  action,
                  `${actionPrefix}_object_set_property_${stateKey}`
                )
              ) {
                const objectState = { ...state[stateKey] } as any;
                objectState[action.key] = action.value;
                return { ...state, [stateKey]: objectState };
              } else {
                return undefined;
              }
            },
          ]
        : []),
      (state: State, action: Action) => {
        if (
          isOfType<SetAction<StateKey, State[StateKey], ActionPrefix>>(
            action,
            `${actionPrefix}_set_${stateKey}`
          )
        ) {
          return { ...state, [stateKey]: action.value };
        } else if (
          isOfType<MapAction<StateKey, State[StateKey], ActionPrefix>>(
            action,
            `${actionPrefix}_map_${stateKey}`
          )
        ) {
          return { ...state, [stateKey]: action.mapper(state[stateKey]) };
        } else if (
          isOfType<DeleteAction<StateKey, ActionPrefix>>(
            action,
            `${actionPrefix}_delete_${stateKey}`
          )
        ) {
          const stateClone = { ...state };
          delete stateClone[stateKey];
          return stateClone;
        }

        return undefined;
      }
    ),
  } as unknown) as StatePropertyHelper<State, StateKey, ActionPrefix>;
}

type CreateBulkReduxComponentsArguments<
  State,
  ActionPrefix extends string
> = Readonly<
  {
    actionPrefix: ActionPrefix;
    state: State;
  } & (TypeSuggestionRequiredKeys<State> extends never
    ? { typeSuggestions?: undefined }
    : { typeSuggestions: TypeSuggestion<State> })
>;

export function createBulkReduxComponents<State, ActionPrefix extends string>({
  actionPrefix,
  state,
  typeSuggestions = {} as any,
}: CreateBulkReduxComponentsArguments<State, ActionPrefix>): Readonly<{
  actionCreators: BulkActionCreator<
    State,
    ActionPrefix,
    CreateBulkReduxComponentsArguments<State, ActionPrefix>["typeSuggestions"]
  >;
  reducer: ReducerWithOptionalReturn<State, Action>;
}> {
  const anyState = ({ ...state } as unknown) as CompatibleObject<
    string,
    State[keyof State] | undefined
  >;

  const anyTypeSuggestions = { ...typeSuggestions } as CompatibleObject<
    string,
    string | undefined
  >;

  const actionCreators: CompatibleObject<string, any> = {};
  let reducers: ReducerWithOptionalReturn<State, Action>[] = [];

  /**
   * There might be missing properties from the default state, esp. if some
   * properties are optional. Since we know those keys will definitely be
   * present in the type suggestion object, we initialize them in the main
   * state object with placeholder values.
   */
  for (const stateKey in anyTypeSuggestions) {
    if (anyState[stateKey] == null) anyState[stateKey] = undefined;
  }

  for (const stateKey in anyState) {
    const stateValue = anyState[stateKey];

    if (
      stateValue instanceof Array ||
      anyTypeSuggestions[stateKey] === TYPE_PROPERTY_ARRAY
    ) {
      const {
        actionCreators: arrayActionCreators,
        reducer: arrayReducer,
      } = createReduxComponents<State, keyof State, ActionPrefix>({
        stateKey,
        actionPrefix,
        propertyType: "ARRAY",
      } as any);

      actionCreators[stateKey] = arrayActionCreators;
      reducers.push(arrayReducer);
    } else if (
      typeof stateValue === "boolean" ||
      anyTypeSuggestions[stateKey] === TYPE_PROPERTY_BOOLEAN
    ) {
      const {
        actionCreators: booleanActionCreators,
        reducer: booleanReducer,
      } = createReduxComponents<State, keyof State, ActionPrefix>({
        stateKey,
        actionPrefix,
        propertyType: "BOOLEAN",
      } as any);

      actionCreators[stateKey] = booleanActionCreators;
      reducers.push(booleanReducer);
    } else if (
      typeof stateValue === "object" ||
      anyTypeSuggestions[stateKey] === TYPE_PROPERTY_OBJECT
    ) {
      const {
        actionCreators: objectActionCreators,
        reducer: objectReducer,
      } = createReduxComponents<State, keyof State, ActionPrefix>({
        stateKey,
        actionPrefix,
        propertyType: "OBJECT",
      } as any);

      actionCreators[stateKey] = objectActionCreators;
      reducers.push(objectReducer);
    } else {
      const {
        actionCreators: anyActionCreators,
        reducer: anyReducer,
      } = createReduxComponents<State, keyof State, ActionPrefix>({
        stateKey,
        actionPrefix,
      } as any);

      actionCreators[stateKey] = anyActionCreators;
      reducers.push(anyReducer);
    }
  }

  /** Remove the state key postfix from all action creators */
  for (const stateKey in actionCreators) {
    const stateActionCreators = actionCreators[stateKey];

    for (let creatorKey in stateActionCreators) {
      const stateActionCreator = stateActionCreators[creatorKey];
      delete stateActionCreators[creatorKey];
      creatorKey = creatorKey.slice(0, creatorKey.length - stateKey.length - 1);
      stateActionCreators[creatorKey] = stateActionCreator;
    }
  }

  return {
    actionCreators: actionCreators as any,
    reducer: combineOptionalReducers(...reducers),
  };
}
