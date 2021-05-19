import {
  ActionType,
  combineReducers,
  createBulkReduxComponents,
  createReduxComponents,
  createUndoReduxComponents,
} from ".";
import { StateWithHistory } from "./redux_undo";

describe("Redux components", () => {
  it("Basic redux components should work correctly", async () => {
    // Setup
    interface State {
      property?: string | null;
    }

    let state: State | undefined = { property: "What" };

    const rc = createReduxComponents<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      stateKey: "property",
    });

    // When && Then 1
    state = rc.reducer(state, rc.actionCreators.Set_property("NV"));
    expect(state?.property).toEqual("NV");

    // When && Then 2
    state = rc.reducer(
      state!,
      rc.actionCreators.Map_property((current) => `${current}${current}`)
    );

    expect(state?.property).toEqual("NVNV");

    // When && Then 3
    state = rc.reducer(state!, rc.actionCreators.Delete_property);
    expect(state?.property).toBeUndefined();

    // When && Then 4
    expect(rc.reducer(state!, {} as any)).toBeUndefined();
  });

  it("Redux components for array state should work correctly", async () => {
    // Setup
    interface State {
      nonArray?: boolean;
      property?: readonly { a: string; b?: string }[];
      property2: number[];
    }

    let state: State | undefined = { property2: [1, 2, 3] };

    const rc1 = createReduxComponents<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "ARRAY",
      stateKey: "property",
    });

    const rc2 = createReduxComponents<State, "property2", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "ARRAY",
      stateKey: "property2",
    });

    // When && Then 1
    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_push_property({
        a: "some-value-2",
        b: "checkable",
      })
    );

    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_unshift_property({ a: "some-value-1" })
    );

    expect(state?.property).toEqual([
      { a: "some-value-1" },
      { a: "some-value-2", b: "checkable" },
    ]);

    // When && Then 2
    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_replace_property({
        propertyToCheckEquality: "b",
        value: { a: "some-value-3", b: "checkable" },
      })
    );

    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_replace_property({
        predicate: (...[, index]) => index === 0,
        value: { a: "some-value-4" },
      })
    );

    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_replace_property({
        index: 2,
        value: { a: "some-value-5" },
      })
    );

    /** This should not update, since there is no matching property */
    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_replace_property({
        propertyToCheckEquality: "b",
        value: { a: "some-value-3", b: "unmatchable-1" },
      })
    );

    /** This should not update, since there is no matching mechanism provided */
    state = rc1.reducer(
      state!,
      rc1.actionCreators.Array_replace_property({
        value: { a: "some-value-3", b: "unmatchable-2" },
      } as any)
    );

    expect(state?.property).toEqual([
      { a: "some-value-4" },
      { a: "some-value-3", b: "checkable" },
      { a: "some-value-5" },
    ]);

    // When && Then 3
    state = rc2.reducer(
      state!,
      rc2.actionCreators.Array_remove_property2({ index: 1 })
    );

    expect(state?.property2).toEqual([1, 3]);

    /** This should not do anything, since the index is out of bound */
    state = rc2.reducer(
      state!,
      rc2.actionCreators.Array_remove_property2({ index: 10 })
    );
  });

  it("Redux components for boolean state should work correctly", async () => {
    // Setup
    interface State {
      property?: boolean | null;
    }

    let state: State | undefined = {};

    const rc = createReduxComponents<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "BOOLEAN",
      stateKey: "property",
    });

    // When && Then 1
    state = rc.reducer(state!, rc.actionCreators.Boolean_toggle_property);
    expect(state?.property).toEqual(true);

    // When && Then 2
    state = rc.reducer(state!, rc.actionCreators.Boolean_toggle_property);
    expect(state?.property).toEqual(false);

    // When && Then 3
    state = rc.reducer(state!, rc.actionCreators.Boolean_set_true_property);
    expect(state?.property).toEqual(true);

    // When && Then 4
    state = rc.reducer(state!, rc.actionCreators.Boolean_set_false_property);
    expect(state?.property).toEqual(false);
  });

  it("Redux components for object state should work correctly", async () => {
    // Setup
    interface State {
      property?: { a: string; b?: number };
    }

    let state: State | undefined = {};

    const rc = createReduxComponents<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "OBJECT",
      stateKey: "property",
    });

    // When && Then 1
    state = rc.reducer(
      state!,
      rc.actionCreators.Object_set_property_property("a", "some-value-a")
    );

    expect(state?.property).toEqual({ a: "some-value-a" });

    // When && Then 2
    state = rc.reducer(
      state!,
      rc.actionCreators.Object_delete_property_property("a")
    );

    expect(state?.property).toEqual({});

    // When && Then 3
    state = rc.reducer(
      state!,
      rc.actionCreators.Object_merge_property({ b: 100 })
    );

    expect(state?.property).toEqual({ b: 100 });
  });

  it("Bulk redux components for should work correctly", async () => {
    // Setup
    interface State {
      a: number[];
      b: boolean;
      c: { a?: number; b?: string };
      d: string;
      e?: string | undefined;
      f: string | null;
      g?: boolean | null;
      h?: string[] | null;
      i?: { a?: number };
      j?: boolean;
    }

    let state: State | undefined = {
      a: [],
      b: false,
      c: {},
      d: "",
      e: undefined,
      f: null,
      j: true,
    };

    const { actionCreators, reducer } = createBulkReduxComponents<
      State,
      "PREFIX"
    >({
      state,
      actionPrefix: "PREFIX",
      typeSuggestions: { g: "BOOLEAN", h: "ARRAY", i: "OBJECT", j: "BOOLEAN" },
    });

    // When
    state = reducer(state, actionCreators.a.Array_push(0))!;
    state = reducer(state, actionCreators.b.Boolean_set_true)!;
    state = reducer(state, actionCreators.c.Object_set_property("a", 1))!;
    state = reducer(state, actionCreators.d.Set("d"))!;
    state = reducer(state, actionCreators.e.Set("e"))!;
    state = reducer(state, actionCreators.f.Set("f"))!;
    state = reducer(state, actionCreators.g.Boolean_set_true)!;
    state = reducer(state, actionCreators.h.Array_push("h"))!;
    state = reducer(state, actionCreators.i.Object_set_property("a", 1))!;
    state = reducer(state, actionCreators.i.Object_merge({ a: 2 }))!;
    state = reducer(state, actionCreators.j.Boolean_set_false)!;

    // Then
    expect(state).toEqual({
      a: [0],
      b: true,
      c: { a: 1 },
      d: "d",
      e: "e",
      f: "f",
      g: true,
      h: ["h"],
      i: { a: 2 },
      j: false,
    });

    expect(actionCreators).toMatchSnapshot();
  });

  it("Bulk redux components with all eligible state values should not require type suggestions", () => {
    interface State {
      a: number[];
      b: boolean;
      c: { a?: number; b?: string };
    }

    createBulkReduxComponents<State, "PREFIX">({
      state: { a: [], b: false, c: {} },
      actionPrefix: "PREFIX",
    });
  });

  it("Action creator types should be correct", () => {
    // Setup
    interface State {
      a?: number[];
      b?: boolean;
      c?: { a: number };
    }

    const defaultState: State = { a: [], b: false, c: { a: 0 } };

    const { actionCreators } = createBulkReduxComponents<
      typeof defaultState,
      "PREFIX"
    >({
      actionPrefix: "PREFIX",
      state: defaultState,
      typeSuggestions: { a: "ARRAY", b: "BOOLEAN", c: "OBJECT" },
    });

    function reduce(state: State, action: ActionType<typeof actionCreators>) {
      switch (action.type) {
        case "PREFIX_array_push_a":
        case "PREFIX_array_remove_a":
        case "PREFIX_array_replace_a":
        case "PREFIX_array_unshift_a":
        case "PREFIX_boolean_set_false_b":
        case "PREFIX_boolean_set_true_b":
        case "PREFIX_boolean_toggle_b":
        case "PREFIX_object_delete_property_c":
        case "PREFIX_object_merge_c":
        case "PREFIX_object_set_property_c":
        case "PREFIX_delete_a":
        case "PREFIX_delete_b":
        case "PREFIX_delete_c":
        case "PREFIX_map_a":
        case "PREFIX_map_b":
        case "PREFIX_map_c":
        case "PREFIX_set_a":
        case "PREFIX_set_b":
        case "PREFIX_set_c":
          state!.a;
          return state;
      }
    }

    // When
    const mapFN = <T>(args: T) => args;
    let s = reduce(defaultState, actionCreators.a.Array_push(0));
    s = reduce(s, actionCreators.a.Array_remove({ index: 0 }));
    s = reduce(s, actionCreators.a.Array_replace({ index: 0, value: 0 }));
    s = reduce(s, actionCreators.a.Array_unshift(0));
    s = reduce(s, actionCreators.a.Delete);
    s = reduce(s, actionCreators.a.Map(mapFN));
    s = reduce(s, actionCreators.a.Set([]));
    s = reduce(s, actionCreators.b.Boolean_set_false);
    s = reduce(s, actionCreators.b.Boolean_set_true);
    s = reduce(s, actionCreators.b.Boolean_toggle);
    s = reduce(s, actionCreators.b.Delete);
    s = reduce(s, actionCreators.b.Map(mapFN));
    s = reduce(s, actionCreators.b.Set(undefined));
    s = reduce(s, actionCreators.c.Object_delete_property("a"));
    s = reduce(s, actionCreators.c.Object_merge({}));
    s = reduce(s, actionCreators.c.Object_set_property("a", 1));
    s = reduce(s, actionCreators.c.Delete);
    s = reduce(s, actionCreators.c.Map(mapFN));
    s = reduce(s, actionCreators.c.Set(undefined));

    // Then
    expect(s).toBeDefined();
  });

  it("Combining reducers should work", () => {
    // Setup
    interface State {
      property: string;
    }

    const combined = combineReducers<State, { type: "T1" | "T2" }>(
      { property: "0" },
      () => undefined,
      (...[, action]) => (action.type === "T1" ? { property: "1" } : undefined)
    );

    // When && Then
    expect(combined(undefined, { type: "T1" })).toEqual({ property: "1" });
    expect(combined(undefined, { type: "T2" })).toEqual({ property: "0" });
  });
});

describe("Redux undo components", () => {
  it("Undo actions should work correctly", () => {
    // Setup

    interface State extends StateWithHistory {
      a?: number;
      b?: number;
      c?: number;
    }

    const defaultState: State = { a: 0, b: 0, c: 0 };

    const { actionCreators, reducer } = createBulkReduxComponents<
      State,
      "PREFIX"
    >({ actionPrefix: "PREFIX", state: defaultState });

    const {
      actionCreators: undoActionCreators,
      reducer: reducerWithHistory,
    } = createUndoReduxComponents<State, "PREFIX", "a" | "b">({
      actionPrefix: "PREFIX" as const,
      keysToTrack: ["a", "b"],
      limit: 10,
      originalReducer: reducer,
    });

    // When && Then
    let state: State = {};
    state = reducerWithHistory(state, actionCreators.c.Set(0))!;
    state = reducerWithHistory(state, actionCreators.c.Set(1))!;
    state = reducerWithHistory(state, actionCreators.a.Set(1))!;
    state = reducerWithHistory(state, actionCreators.b.Set(2))!;
    state = reducerWithHistory(state, actionCreators.c.Set(3))!;
    state = reducerWithHistory(state, actionCreators.c.Set(4))!;
    expect(state).toMatchSnapshot();

    // When && Then
    state = reducerWithHistory(state, undoActionCreators.undo)!;
    state = reducerWithHistory(state, undoActionCreators.undo)!;
    expect(state).toMatchSnapshot();
  });

  it("Past state should respect limit", () => {
    // Setup
    interface State extends StateWithHistory {
      a?: number;
      b?: number;
      c?: number;
    }

    const defaultState: State = { a: 0, b: 0, c: 0 };

    const { actionCreators, reducer } = createBulkReduxComponents<
      State,
      "PREFIX"
    >({ actionPrefix: "PREFIX", state: defaultState });

    const { reducer: reducerWithHistory } = createUndoReduxComponents<
      State,
      "PREFIX",
      "a" | "b"
    >({
      actionPrefix: "PREFIX" as const,
      keysToTrack: ["a", "b"],
      limit: 1,
      originalReducer: reducer,
    });

    // When
    let state: State = {};
    state = reducerWithHistory(state, actionCreators.a.Set(1))!;
    state = reducerWithHistory(state, actionCreators.b.Set(2))!;
    state = reducerWithHistory(state, actionCreators.c.Set(3))!;

    // Then
    expect(state).toMatchSnapshot();
  });

  it("Undo action should not do anything if there's no past", () => {
    // Setup
    interface State extends StateWithHistory {
      a?: number;
    }

    const {
      actionCreators,
      reducer: reducerWithHistory,
    } = createUndoReduxComponents<State, "PREFIX", "a">({
      actionPrefix: "PREFIX" as const,
      keysToTrack: ["a"],
      originalReducer: (...[, action]) => {
        switch (action.type) {
          case "UNDEFINED":
            return undefined;

          default:
            return {};
        }
      },
    });

    // When && Then
    let state: State = {};
    state = reducerWithHistory({}, actionCreators.undo)!;
    expect(state).toBeUndefined();
    state = reducerWithHistory({}, { type: "UNDEFINED" })!;
    expect(state).toBeUndefined();
  });
});

describe("Convenience types", () => {
  it("Action type should work correctly", () => {
    // Setup
    const actionCreators = {
      a: { type: "A" as const },
      b: (args: string) => ({ args, type: "B" as const }),
      c: {
        d: { type: "D" as const },
        e: (args: number) => ({ args, type: "E" as const }),
      },
    };

    type Actions = ActionType<typeof actionCreators>;

    function reduce(state: number, _action: Actions) {
      return state;
    }

    // When
    let state = reduce(0, actionCreators.a);
    state = reduce(state, actionCreators.b(""));
    state = reduce(state, actionCreators.c.d);
    state = reduce(state, actionCreators.c.e(0));
  });
});
