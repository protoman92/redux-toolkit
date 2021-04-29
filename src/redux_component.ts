import { Action } from "redux";
import { combineOptionalReducers, ReducerWithOptionalReturn } from "./reducer";
import { shallowCloneArray } from "./utils";

type Neverable<T> = T | null | undefined;
type CompatibleArray<T> = T[] | readonly T[];
type CompatibleObject<K extends string, V> = { [x in Extract<K, string>]: V };

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
  { value: ArrayElement } & (
    | (ArrayRemoveAction_Arguments<ArrayElement> & {
        propertyToCheckEquality?: undefined;
      })
    | {
        index?: undefined;
        predicate?: undefined;
        propertyToCheckEquality: keyof ArrayElement;
      }
  )
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

type ObjectMergePropertyAction<
  StateKey,
  StateValue extends CompatibleObject<string, unknown>,
  ActionPrefix extends string
> = Readonly<
  {
    type: `${ActionPrefix}_object_merge_property_${Extract<StateKey, string>}`;
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

type SetAction<StateKey, StateValue, ActionPrefix extends string> = Readonly<{
  type: `${ActionPrefix}_set_${Extract<StateKey, string>}`;
  value: StateValue;
}>;

namespace ActionCreators {
  export type ForAny<StateKey, StateValue, ActionPrefix extends string> = {
    [x in `Delete${Extract<StateKey, string>}`]: DeleteAction<
      StateKey,
      ActionPrefix
    >;
  } &
    {
      [x in `Set${Extract<StateKey, string>}`]: (
        value: StateValue
      ) => SetAction<StateKey, StateValue, ActionPrefix>;
    };

  export type ForArray<
    StateKey,
    StateValue extends CompatibleArray<unknown>,
    ActionPrefix extends string
  > = {
    [x in `Array_push${Extract<StateKey, string>}`]: (
      value: StateValue[number]
    ) => ArrayPushAction<StateKey, StateValue, ActionPrefix>;
  } &
    {
      [x in `Array_remove${Extract<StateKey, string>}`]: (
        args: ArrayRemoveAction_Arguments<StateValue[number]>
      ) => ArrayRemoveAction<StateKey, StateValue, ActionPrefix>;
    } &
    {
      [x in `Array_replace${Extract<StateKey, string>}`]: (
        args: ArrayReplaceAction_Arguments<StateValue[number]>
      ) => ArrayReplaceAction<StateKey, StateValue, ActionPrefix>;
    } &
    {
      [x in `Array_unshift${Extract<StateKey, string>}`]: (
        value: StateValue[number]
      ) => ArrayUnshiftAction<StateKey, StateValue, ActionPrefix>;
    };

  export type ForBoolean<StateKey, ActionPrefix extends string> = {
    [x in `Boolean_set_false${Extract<
      StateKey,
      string
    >}`]: BooleanSetFalseAction<StateKey, ActionPrefix>;
  } &
    {
      [x in `Boolean_set_true${Extract<
        StateKey,
        string
      >}`]: BooleanSetTrueAction<StateKey, ActionPrefix>;
    } &
    {
      [x in `Boolean_toggle${Extract<StateKey, string>}`]: BooleanToggleAction<
        StateKey,
        ActionPrefix
      >;
    };

  export type ForObject<
    StateKey,
    StateValue extends CompatibleObject<string, unknown>,
    ActionPrefix extends string
  > = {
    [x in `Object_delete_property${Extract<StateKey, string>}`]: <
      K extends keyof StateValue
    >(
      key: K
    ) => ObjectDeletePropertyAction<StateKey, StateValue, ActionPrefix>;
  } &
    {
      [x in `Object_merge_property${Extract<StateKey, string>}`]: (
        obj: Partial<StateValue>
      ) => ObjectMergePropertyAction<StateKey, StateValue, ActionPrefix>;
    } &
    {
      [x in `Object_set_property${Extract<StateKey, string>}`]: <
        K extends keyof StateValue
      >(
        key: K,
        value: StateValue[K]
      ) => ObjectSetPropertyAction<StateKey, StateValue, ActionPrefix>;
    };

  export type ForWholeState<State, ActionPrefix extends string> = Required<
    {
      [Key in keyof State]: ActionCreators.ForAny<
        "",
        State[Key],
        ActionPrefix
      > &
        (State[Key] extends null | undefined
          ? {}
          : State[Key] extends CompatibleArray<any>
          ? ActionCreators.ForArray<"", State[Key], ActionPrefix>
          : State[Key] extends boolean
          ? ActionCreators.ForBoolean<"", ActionPrefix>
          : State[Key] extends CompatibleObject<string, unknown>
          ? ActionCreators.ForObject<"", State[Key], ActionPrefix>
          : {});
    }
  >;
}

type StatePropertyHelper<
  State,
  StateKey extends keyof State,
  ActionPrefix extends string
> = {
  actionCreators: Readonly<
    (State[StateKey] extends Neverable<infer A>
      ? A extends CompatibleArray<unknown>
        ? ActionCreators.ForArray<
            `_${Extract<StateKey, string>}`,
            A,
            ActionPrefix
          >
        : {}
      : {}) &
      (State[StateKey] extends Neverable<infer B>
        ? B extends boolean
          ? ActionCreators.ForBoolean<
              `_${Extract<StateKey, string>}`,
              ActionPrefix
            >
          : {}
        : {}) &
      (State[StateKey] extends Neverable<infer O>
        ? O extends CompatibleObject<string, unknown>
          ? ActionCreators.ForObject<
              `_${Extract<StateKey, string>}`,
              O,
              ActionPrefix
            >
          : {}
        : {}) &
      ActionCreators.ForAny<
        `_${Extract<StateKey, string>}`,
        State[StateKey],
        ActionPrefix
      >
  >;
  reducer: ReducerWithOptionalReturn<State, Action>;
};

type createReduxComponentsArgs<
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

/** Use these property types to avoid adding unnecessary action creators */
const TYPE_PROPERTY_ARRAY = "ARRAY";
const TYPE_PROPERTY_BOOLEAN = "BOOLEAN";
const TYPE_PROPERTY_OBJECT = "OBJECT";

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
}: createReduxComponentsArgs<
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
            [`Object_merge_property_${stateKey}`]: (obj: object) => ({
              ...obj,
              type: `${actionPrefix}_object_merge_property_${stateKey}`,
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
              let actionValue: any;
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
                actionValue = action.value;
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
              } else if (action.propertyToCheckEquality != null) {
                const propertyKey = action.propertyToCheckEquality as string;

                findIndexFn = (currentValue) =>
                  currentValue[propertyKey] === actionValue[propertyKey];
              }

              if (findIndexFn != null) {
                index = arrayState.findIndex(findIndexFn);
              }

              if (index >= 0) {
                if (isRemoveAction) {
                  arrayState.splice(index, 1);
                } else {
                  arrayState[index] = actionValue;
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
                isOfType<ObjectMergePropertyAction<StateKey, {}, ActionPrefix>>(
                  action,
                  `${actionPrefix}_object_merge_property_${stateKey}`
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
        }

        if (
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

export function createBulkReduxComponents<State, ActionPrefix extends string>({
  actionPrefix,
  state,
}: Readonly<{ actionPrefix: ActionPrefix; state: State }>): Readonly<{
  actionCreators: ActionCreators.ForWholeState<State, ActionPrefix>;
  reducer: ReducerWithOptionalReturn<State, Action>;
}> {
  const actionCreators: CompatibleObject<string, any> = {};
  let reducers: ReducerWithOptionalReturn<State, Action>[] = [];

  for (const stateKey in state) {
    const stateValue = state[stateKey];

    if (stateValue instanceof Array) {
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
    } else if (typeof stateValue === "boolean") {
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
    } else if (typeof stateValue === "object") {
      const {
        actionCreators: objectActionCreators,
        reducer: objectReducer,
      } = createReduxComponents<State, keyof State, ActionPrefix>({
        actionPrefix,
        propertyType: "OBJECT",
        stateKey: stateKey as keyof State,
      } as any);

      actionCreators[stateKey] = objectActionCreators;
      reducers.push(objectReducer);
    } else {
      const {
        actionCreators: anyActionCreators,
        reducer: anyReducer,
      } = createReduxComponents<State, keyof State, ActionPrefix>({
        actionPrefix,
        stateKey: stateKey as keyof State,
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
