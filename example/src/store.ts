import { State } from "interface";
import { createBulkReduxComponents } from "../../src";

export const defaultState: State = {};

export const { actionCreators, reducer } = createBulkReduxComponents<
  typeof defaultState,
  "PREFIX"
>({
  actionPrefix: "PREFIX",
  state: defaultState,
  typeSuggestions: { a: "ARRAY", b: "BOOLEAN", c: "OBJECT" },
});
