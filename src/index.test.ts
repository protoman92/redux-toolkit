import { combineReducers, createSettablePropertyHelper } from ".";

describe("Redux helpers", () => {
  it("Settable property helper should work correctly", async () => {
    // Setup
    interface State {
      property: string;
    }

    let state: State | undefined = { property: "What" };

    const helper = createSettablePropertyHelper<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      stateKey: "property",
    });

    // When && Then
    state = helper.reducer(state, helper.actionCreators.Set_property("NV"));
    expect(state?.property).toEqual("NV");
    state = helper.reducer(state!, helper.actionCreators.Delete_property);
    expect(state?.property).toBeUndefined();
    expect(helper.reducer(state!, {} as any)).toBeUndefined();
  });

  it("Settable property helper for array state should work correctly", async () => {
    // Setup
    interface State {
      nonArray?: boolean;
      property?: readonly { a: string; b?: string }[];
    }

    let state: State | undefined = {};

    const helper = createSettablePropertyHelper<State, "property", "PREFIX">({
      actionPrefix: "PREFIX",
      propertyType: "ARRAY",
      stateKey: "property",
    });

    // When && Then 1
    state = helper.reducer(
      state!,
      helper.actionCreators.Array_push_property({
        a: "some-value-2",
        b: "checkable",
      })
    );

    state = helper.reducer(
      state!,
      helper.actionCreators.Array_unshift_property({ a: "some-value-1" })
    );

    expect(state?.property).toEqual([
      { a: "some-value-1" },
      { a: "some-value-2", b: "checkable" },
    ]);

    // When && Then 2
    state = helper.reducer(
      state!,
      helper.actionCreators.Array_replace_property({
        propertyToCheckEquality: "b",
        value: { a: "some-value-3", b: "checkable" },
      })
    );

    state = helper.reducer(
      state!,
      helper.actionCreators.Array_replace_property({
        predicate: (...[, index]) => index === 0,
        value: { a: "some-value-4" },
      })
    );

    state = helper.reducer(
      state!,
      helper.actionCreators.Array_replace_property({
        index: 2,
        value: { a: "some-value-5" },
      })
    );

    /** This should not update, since there is no matching property */
    state = helper.reducer(
      state!,
      helper.actionCreators.Array_replace_property({
        propertyToCheckEquality: "b",
        value: { a: "some-value-3", b: "unmatchable-1" },
      })
    );

    /** This should not update, since there is no matching mechanism provided */
    state = helper.reducer(
      state!,
      helper.actionCreators.Array_replace_property({
        value: { a: "some-value-3", b: "unmatchable-2" },
      } as any)
    );

    expect(state?.property).toEqual([
      { a: "some-value-4" },
      { a: "some-value-3", b: "checkable" },
      { a: "some-value-5" },
    ]);
  });

  it("Settable property helper for boolean state should work correctly", async () => {
    // Setup
    interface State {
      property?: boolean | null;
    }

    let state: State | undefined = {};

    const helper = createSettablePropertyHelper<State, "property", "PREFIX">({
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

  it("Settable property helper for object state should work correctly", async () => {
    // Setup
    interface State {
      property?: { a: string; b?: string };
    }

    let state: State | undefined = {};

    const helper = createSettablePropertyHelper<State, "property", "PREFIX">({
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
