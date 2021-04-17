import { map } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { ActionType } from "./interface";
import { createOfActionType } from "./rxjs";

describe("Redux RxJS helpers", () => {
  const actionCreators = {
    a: { type: "ACTION_1" as const },
    b: (property: string) => ({ property, type: "ACTION_2" as const }),
    c: { type: "ACTION_3" as const },
  };

  const ofActionType = createOfActionType<ActionType<typeof actionCreators>>();
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));
  });

  it("ofActionType should filter actions correctly for a single type", () => {
    scheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold<ActionType<typeof actionCreators>>("a b a", {
          a: actionCreators.a,
          b: actionCreators.b("property"),
        }).pipe(ofActionType("ACTION_1"))
      ).toBe("a 1ms a", { a: actionCreators.a });
    });
  });

  it("ofActionType should filter actions correctly for an array of types", () => {
    scheduler.run(({ cold, expectObservable }) => {
      expectObservable(
        cold<ActionType<typeof actionCreators>>("a b c a", {
          a: actionCreators.a,
          b: actionCreators.b("property"),
          c: actionCreators.c,
        }).pipe(
          ofActionType(["ACTION_1", "ACTION_2"]),
          map((action) => {
            switch (action.type) {
              case "ACTION_1":
                return actionCreators.a;

              case "ACTION_2":
                return actionCreators.b(action.property);
            }
          })
        )
      ).toBe("a b 1ms a", {
        a: actionCreators.a,
        b: actionCreators.b("property"),
      });
    });
  });
});
