import { Action } from "redux";
import { ReducerWithOptionalReturn } from "./reducer";
import { shallowCloneArray } from "./utils";

type Neverable<T> = T | null | undefined;
type CompatibleArray<T> = T[] | readonly T[];
type CompatibleObject<K extends string, V> = { [x in Extract<K, string>]: V };

type ArrayPushAction<
  StateKey,
  StateValue extends CompatibleArray<unknown>,
  ActionPrefix extends string = string
> = Readonly<{
  type: `${ActionPrefix}_array_push_${Extract<StateKey, string>}`;
  value: StateValue[number];
}>;

type ArrayReplaceAction_Arguments<ArrayElement> = Readonly<
  { value: ArrayElement } & (
    | {
        index: number;
        predicate?: undefined;
        propertyToCheckEquality?: undefined;
      }
    | {
        index?: undefined;
        predicate: (currentValue: ArrayElement, index: number) => boolean;
        propertyToCheckEquality?: undefined;
      }
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

type StatePropertyHelper<
  State,
  StateKey extends keyof State,
  ActionPrefix extends string
> = {
  actionCreators: Readonly<
    (State[StateKey] extends Neverable<infer A>
      ? A extends CompatibleArray<unknown>
        ? {
            [x in `Array_push_${Extract<StateKey, string>}`]: (
              value: A[number]
            ) => ArrayPushAction<StateKey, A, ActionPrefix>;
          } &
            {
              [x in `Array_replace_${Extract<StateKey, string>}`]: (
                args: ArrayReplaceAction_Arguments<A[number]>
              ) => ArrayReplaceAction<StateKey, A, ActionPrefix>;
            } &
            {
              [x in `Array_unshift_${Extract<StateKey, string>}`]: (
                value: A[number]
              ) => ArrayUnshiftAction<StateKey, A, ActionPrefix>;
            }
        : {}
      : {}) &
      (State[StateKey] extends Neverable<infer B>
        ? B extends boolean
          ? {
              [x in `Boolean_set_false_${Extract<
                StateKey,
                string
              >}`]: BooleanSetFalseAction<StateKey, ActionPrefix>;
            } &
              {
                [x in `Boolean_set_true_${Extract<
                  StateKey,
                  string
                >}`]: BooleanSetTrueAction<StateKey, ActionPrefix>;
              } &
              {
                [x in `Boolean_toggle_${Extract<
                  StateKey,
                  string
                >}`]: BooleanToggleAction<StateKey, ActionPrefix>;
              }
          : {}
        : {}) &
      (State[StateKey] extends Neverable<infer O>
        ? O extends CompatibleObject<string, unknown>
          ? {
              [x in `Object_delete_property_${Extract<StateKey, string>}`]: <
                K extends keyof O
              >(
                key: K
              ) => ObjectDeletePropertyAction<StateKey, O, ActionPrefix>;
            } &
              {
                [x in `Object_merge_property_${Extract<StateKey, string>}`]: (
                  obj: Partial<O>
                ) => ObjectMergePropertyAction<StateKey, O, ActionPrefix>;
              } &
              {
                [x in `Object_set_property_${Extract<StateKey, string>}`]: <
                  K extends keyof O
                >(
                  key: K,
                  value: O[K]
                ) => ObjectSetPropertyAction<StateKey, O, ActionPrefix>;
              }
          : {}
        : {}) &
      {
        [x in `Delete_${Extract<StateKey, string>}`]: DeleteAction<
          StateKey,
          ActionPrefix
        >;
      } &
      {
        [x in `Set_${Extract<StateKey, string>}`]: (
          value: State[StateKey]
        ) => SetAction<StateKey, State[StateKey], ActionPrefix>;
      }
  >;
  reducer: ReducerWithOptionalReturn<State, Action>;
};

type createStatePropertyHelperArgs<
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

export function createStatePropertyHelper<
  State,
  StateKey extends keyof State,
  ActionPrefix extends string
>({
  actionPrefix,
  propertyType,
  stateKey,
}: createStatePropertyHelperArgs<
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
    reducer: (state: State, action: Action) => {
      if (
        isOfType<ArrayPushAction<State, unknown[], ActionPrefix>>(
          action,
          `${actionPrefix}_array_push_${stateKey}`
        )
      ) {
        const arrayStateValue = shallowCloneArray(state[stateKey] as any);
        arrayStateValue.push(action.value);
        return { ...state, [stateKey]: arrayStateValue };
      }

      if (
        isOfType<ArrayReplaceAction<StateKey, unknown[], ActionPrefix>>(
          action,
          `${actionPrefix}_array_replace_${stateKey}`
        )
      ) {
        const valueToReplace = action.value as any;
        const arrayStateValue = shallowCloneArray(state[stateKey] as any);
        let index = -1;
        let findIndexFn: Parameters<Array<any>["findIndex"]>[0] | undefined;

        if (action.index != null) {
          index = action.index;
        } else if (action.predicate != null) {
          findIndexFn = action.predicate;
        } else if (action.propertyToCheckEquality != null) {
          const propertyKey = action.propertyToCheckEquality as any;

          findIndexFn = (currentValue) =>
            currentValue[propertyKey] === valueToReplace[propertyKey];
        }

        if (findIndexFn != null) {
          index = arrayStateValue.findIndex(findIndexFn);
        }

        if (index !== -1) arrayStateValue[index] = action.value;
        return { ...state, [stateKey]: arrayStateValue };
      }

      if (
        isOfType<ArrayUnshiftAction<StateKey, unknown[], ActionPrefix>>(
          action,
          `${actionPrefix}_array_unshift_${stateKey}`
        )
      ) {
        const arrayStateValue = shallowCloneArray(state[stateKey] as any);
        arrayStateValue.unshift(action.value);
        return { ...state, [stateKey]: arrayStateValue };
      }

      if (
        isOfType<BooleanSetTrueAction<StateKey, ActionPrefix>>(
          action,
          `${actionPrefix}_boolean_set_true_${stateKey}`
        )
      ) {
        return { ...state, [stateKey]: true };
      }

      if (
        isOfType<BooleanSetFalseAction<StateKey, ActionPrefix>>(
          action,
          `${actionPrefix}_boolean_set_false_${stateKey}`
        )
      ) {
        return { ...state, [stateKey]: false };
      }

      if (
        isOfType<BooleanToggleAction<StateKey, ActionPrefix>>(
          action,
          `${actionPrefix}_boolean_toggle_${stateKey}`
        )
      ) {
        return { ...state, [stateKey]: !state[stateKey] };
      }

      if (
        isOfType<ObjectDeletePropertyAction<StateKey, {}, ActionPrefix>>(
          action,
          `${actionPrefix}_object_delete_property_${stateKey}`
        )
      ) {
        const objectStateValue = { ...state[stateKey] } as any;
        delete objectStateValue[action.key];
        return { ...state, [stateKey]: objectStateValue };
      }

      if (
        isOfType<ObjectMergePropertyAction<StateKey, {}, ActionPrefix>>(
          action,
          `${actionPrefix}_object_merge_property_${stateKey}`
        )
      ) {
        const { type, ...mergeObject } = action;
        const objectStateValue = { ...state[stateKey], ...mergeObject } as any;
        return { ...state, [stateKey]: objectStateValue };
      }

      if (
        isOfType<ObjectSetPropertyAction<StateKey, {}, ActionPrefix>>(
          action,
          `${actionPrefix}_object_set_property_${stateKey}`
        )
      ) {
        const objectStateValue = { ...state[stateKey] } as any;
        objectStateValue[action.key] = action.value;
        return { ...state, [stateKey]: objectStateValue };
      }

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
        return { ...state, [stateKey]: undefined };
      }

      return undefined;
    },
  } as unknown) as StatePropertyHelper<State, StateKey, ActionPrefix>;
}
