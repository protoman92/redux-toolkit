import { Reducer } from "redux";

export type ReducerWithOptionalReturn<State, Action> = (
  s: State,
  a: Action
) => State | undefined;

export function combineOptionalReducers<
  State,
  Action extends import("redux").Action
>(
  ...reducers: ReducerWithOptionalReturn<State, Action>[]
): ReducerWithOptionalReturn<State, Action> {
  return (state, action) => {
    let newState: State | undefined;

    for (const reducer of reducers) {
      newState = reducer(state, action);
      if (newState != null) return newState;
    }

    return undefined;
  };
}

export function combineReducers<State, Action extends import("redux").Action>(
  initialState: State,
  ...reducers: ReducerWithOptionalReturn<State, Action>[]
): Reducer<State, Action> {
  const combinedReducer = combineOptionalReducers(...reducers);

  return (state = initialState, action) => {
    return combinedReducer(state, action) ?? state;
  };
}
