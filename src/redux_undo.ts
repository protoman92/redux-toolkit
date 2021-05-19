import isShallowEqual from "@wordpress/is-shallow-equal";
import { Action } from "redux";
import { ReducerWithOptionalReturn } from "./reducer";

export interface UndoActionCreators<ActionPrefix extends string> {
  readonly undo: Readonly<{ type: `${ActionPrefix}_undo` }>;
}

interface History<StateToTrack = object> {
  readonly past: readonly StateToTrack[];
}

export type StateWithHistory<
  HistoryKey extends string = "history",
  StateToTrack = object
> = Readonly<
  {
    [Key in HistoryKey]?: History<StateToTrack>;
  }
>;

type HistoryKeyForState<S> = S extends StateWithHistory<infer Key, any>
  ? Key
  : never;

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
  historyKey = "history" as HistoryKeyForState<State>,
  keysToTrack,
  limit = Infinity,
  originalReducer,
}: Readonly<{
  actionPrefix: ActionPrefix;
  historyKey?: HistoryKeyForState<State>;
  keysToTrack: readonly KeysToTrack[];
  limit?: number;
  originalReducer: ReducerWithOptionalReturn<State, Action>;
}>): Readonly<{
  actionCreators: UndoActionCreators<ActionPrefix>;
  reducer: ReducerWithOptionalReturn<State, Action>;
}> {
  const undoActionType = createUndoActionType(actionPrefix);
  const defaultHistory = { past: [] } as History;

  return {
    actionCreators: createUndoReduxActionCreators({ actionPrefix }),
    reducer: (state, action) => {
      const history = state[historyKey] ?? defaultHistory;

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
            [historyKey]: { ...history, past: pastClone },
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
          return { ...newState, [historyKey]: { ...history, past: pastClone } };
        }
      }
    },
  };
}
