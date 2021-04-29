import {
  ActionType,
  combineReducers,
  createStatePropertyHelper,
  createStatePropertyHelpers,
} from ".";

describe("Redux helpers", () => {
  it("Helper should work correctly", async () => {
    // Setup
    interface State {
      property: string;
    }

    let state: State | undefined = { property: "What" };

    const helper = createStatePropertyHelper<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      stateKey: "property",
    });

    // When && Then 1
    state = helper.reducer(state, helper.actionCreators.Set_property("NV"));
    expect(state?.property).toEqual("NV");

    // When && Then 2
    state = helper.reducer(state!, helper.actionCreators.Delete_property);
    expect(state?.property).toBeUndefined();

    // When && Then 3
    expect(helper.reducer(state!, {} as any)).toBeUndefined();
  });

  it("Helper for array state should work correctly", async () => {
    // Setup
    interface State {
      nonArray?: boolean;
      property?: readonly { a: string; b?: string }[];
      property2: number[];
    }

    let state: State | undefined = { property2: [1, 2, 3] };

    const helper1 = createStatePropertyHelper<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "ARRAY",
      stateKey: "property",
    });

    const helper2 = createStatePropertyHelper<State, "property2", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "ARRAY",
      stateKey: "property2",
    });

    // When && Then 1
    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_push_property({
        a: "some-value-2",
        b: "checkable",
      })
    );

    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_unshift_property({ a: "some-value-1" })
    );

    expect(state?.property).toEqual([
      { a: "some-value-1" },
      { a: "some-value-2", b: "checkable" },
    ]);

    // When && Then 2
    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_replace_property({
        propertyToCheckEquality: "b",
        value: { a: "some-value-3", b: "checkable" },
      })
    );

    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_replace_property({
        predicate: (...[, index]) => index === 0,
        value: { a: "some-value-4" },
      })
    );

    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_replace_property({
        index: 2,
        value: { a: "some-value-5" },
      })
    );

    /** This should not update, since there is no matching property */
    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_replace_property({
        propertyToCheckEquality: "b",
        value: { a: "some-value-3", b: "unmatchable-1" },
      })
    );

    /** This should not update, since there is no matching mechanism provided */
    state = helper1.reducer(
      state!,
      helper1.actionCreators.Array_replace_property({
        value: { a: "some-value-3", b: "unmatchable-2" },
      } as any)
    );

    expect(state?.property).toEqual([
      { a: "some-value-4" },
      { a: "some-value-3", b: "checkable" },
      { a: "some-value-5" },
    ]);

    // When && Then 3
    state = helper2.reducer(
      state!,
      helper2.actionCreators.Array_remove_property2({ index: 1 })
    );

    expect(state?.property2).toEqual([1, 3]);

    /** This should not do anything, since the index is out of bound */
    state = helper2.reducer(
      state!,
      helper2.actionCreators.Array_remove_property2({ index: 10 })
    );
  });

  it("Helper for boolean state should work correctly", async () => {
    // Setup
    interface State {
      property?: boolean | null;
    }

    let state: State | undefined = {};

    const helper = createStatePropertyHelper<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "BOOLEAN",
      stateKey: "property",
    });

    // When && Then 1
    state = helper.reducer(
      state!,
      helper.actionCreators.Boolean_toggle_property
    );

    expect(state?.property).toEqual(true);

    // When && Then 2
    state = helper.reducer(
      state!,
      helper.actionCreators.Boolean_toggle_property
    );

    expect(state?.property).toEqual(false);

    // When && Then 3
    state = helper.reducer(
      state!,
      helper.actionCreators.Boolean_set_true_property
    );

    expect(state?.property).toEqual(true);

    // When && Then 4
    state = helper.reducer(
      state!,
      helper.actionCreators.Boolean_set_false_property
    );

    expect(state?.property).toEqual(false);
  });

  it("Helper for object state should work correctly", async () => {
    // Setup
    interface State {
      property?: { a: string; b?: number };
    }

    let state: State | undefined = {};

    const helper = createStatePropertyHelper<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "OBJECT",
      stateKey: "property",
    });

    // When && Then 1
    state = helper.reducer(
      state!,
      helper.actionCreators.Object_set_property_property("a", "some-value-a")
    );

    expect(state?.property).toEqual({ a: "some-value-a" });

    // When && Then 2
    state = helper.reducer(
      state!,
      helper.actionCreators.Object_delete_property_property("a")
    );

    expect(state?.property).toEqual({});

    // When && Then 3
    state = helper.reducer(
      state!,
      helper.actionCreators.Object_merge_property_property({ b: 100 })
    );

    expect(state?.property).toEqual({ b: 100 });
  });

  it("Helpers for state object should work correctly", async () => {
    // Setup
    interface State {
      a: number[];
      b: boolean;
      c: { a?: number; b?: string };
      d: string;
      e?: string | undefined;
      f: string | null;
    }

    let state: State | undefined = {
      a: [],
      b: false,
      c: {},
      d: "",
      e: undefined,
      f: null,
    };

    const { actionCreators, reducer } = createStatePropertyHelpers({
      state,
      actionPrefix: "PREFIX",
    });

    // When
    state = reducer(state, actionCreators.a.Array_push(0))!;
    state = reducer(state, actionCreators.b.Boolean_set_true)!;
    state = reducer(state, actionCreators.c.Object_set_property("a", 1))!;
    state = reducer(state, actionCreators.d.Set("d"))!;
    state = reducer(state, actionCreators.e.Set("e"))!;
    state = reducer(state, actionCreators.f.Set("f"))!;

    // Then
    expect(state).toEqual({
      a: [0],
      b: true,
      c: { a: 1 },
      d: "d",
      e: "e",
      f: "f",
    });

    expect(actionCreators).toMatchSnapshot();
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
