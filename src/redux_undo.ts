import isShallowEqual from "@wordpress/is-shallow-equal";
import { Action } from "redux";
import { ReducerWithOptionalReturn } from "./reducer";

export interface UndoActionCreators<ActionPrefix extends string> {
  readonly undo: Readonly<{ type: `${ActionPrefix}_undo` }>;
}

function createUndoActionType<ActionPrefix extends string>(
  actionPrefix: ActionPrefix
): `${ActionPrefix}_undo` {
  return `${actionPrefix}_undo` as const;
}

export function createUndoReduxActionCreators<ActionPrefix extends string>({
  actionPrefix,
}: Readonly<{ actionPrefix: ActionPrefix }>): UndoActionCreators<ActionPrefix> {
  return { undo: { type: createUndoActionType(actionPrefix) } };
}

export function createUndoReduxComponents<
  State,
  ActionPrefix extends string,
  StateKey extends keyof State = keyof State
>({
  actionPrefix,
  keysToTrack,
  limit = Infinity,
  originalReducer,
}: Readonly<{
  actionPrefix: ActionPrefix;
  keysToTrack: readonly StateKey[];
  limit?: number;
  originalReducer: ReducerWithOptionalReturn<State, Action>;
}>): Readonly<{
  /** Internal API, please avoid using */
  _getPast: () => readonly Pick<State, StateKey>[];
  actionCreators: UndoActionCreators<ActionPrefix>;
  reducer: ReducerWithOptionalReturn<State, Action>;
}> {
  const undoActionType = createUndoActionType(actionPrefix);
  const past: Pick<State, StateKey>[] = [];

  return {
    _getPast: () => [...past],
    actionCreators: createUndoReduxActionCreators({ actionPrefix }),
    reducer: (state, action) => {
      switch (action.type) {
        case undoActionType:
          /**
           * If this past has been exhausted, yield so that other pasts can
           * have a go.
           */
          if (past.length === 0) return undefined;
          const [lastPast] = past.splice(past.length - 1, 1);
          return { ...state, ...lastPast };

        default: {
          const newState = originalReducer(state, action);
          if (newState == null) return undefined;
          const newPast: Partial<Pick<State, StateKey>> = {};

          for (const keyToTrack of keysToTrack) {
            newPast[keyToTrack] = state[keyToTrack];
          }

          if (!isShallowEqual(newPast, past[past.length - 1])) {
            past.push(newPast as typeof past[number]);
          }

          if (past.length > limit) past.splice(0, 1);
          return newState;
        }
      }
    },
  };
}
