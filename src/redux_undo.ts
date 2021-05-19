import isShallowEqual from "@wordpress/is-shallow-equal";
import { Action } from "redux";
import { ReducerWithOptionalReturn } from "./reducer";

export interface UndoActionCreators<ActionPrefix extends string> {
  readonly undo: Readonly<{ type: `${ActionPrefix}_undo` }>;
}

export interface ReduxHistory<StateToTrack = object> {
  readonly past: readonly StateToTrack[];
}

export type StateWithHistory<StateToTrack = object> = Readonly<{
  history?: ReduxHistory<StateToTrack>;
}>;

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
  State extends StateWithHistory,
  ActionPrefix extends string,
  KeysToTrack extends keyof State = keyof State
>({
  actionPrefix,
  keysToTrack,
  limit = Infinity,
  originalReducer,
}: Readonly<{
  actionPrefix: ActionPrefix;
  keysToTrack: readonly KeysToTrack[];
  limit?: number;
  originalReducer: ReducerWithOptionalReturn<State, Action>;
}>): Readonly<{
  actionCreators: UndoActionCreators<ActionPrefix>;
  reducer: ReducerWithOptionalReturn<State, Action>;
}> {
  const undoActionType = createUndoActionType(actionPrefix);
  const defaultHistory = { past: [] } as ReduxHistory;

  return {
    actionCreators: createUndoReduxActionCreators({ actionPrefix }),
    reducer: (state, action) => {
      const history = state.history ?? defaultHistory;

      switch (action.type) {
        case undoActionType:
          /**
           * If this past has been exhausted, yield so that other pasts can
           * have a go.
           */
          if (history.past.length === 0) return undefined;
          const pastClone = [...history.past];
          const [lastPast] = pastClone.splice(history.past.length - 1, 1);

          return {
            ...state,
            ...lastPast,
            history: { ...history, past: pastClone },
          };

        default: {
          const newState = originalReducer(state, action);
          if (newState == null) return undefined;
          const newPast: Partial<Pick<State, KeysToTrack>> = {};

          for (const keyToTrack of keysToTrack) {
            newPast[keyToTrack] = state[keyToTrack];
          }

          if (isShallowEqual(newPast, history.past[history.past.length - 1])) {
            return newState;
          }

          const pastClone = [...history.past];
          pastClone.push(newPast);
          if (pastClone.length > limit) pastClone.splice(0, 1);
          return { ...newState, history: { ...history, past: pastClone } };
        }
      }
    },
  };
}
