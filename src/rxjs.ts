import { Action } from "redux";
import { OperatorFunction } from "rxjs";
import { filter, map } from "rxjs/operators";

/**
 * Syntax like these will be type-safe:
 * - ofActionType('ACTION_1')
 * - ofActionType(['ACTION_1', 'ACTION_2'])
 * The resulting action that gets emitted will have all the relevant properties
 * (e.g. such as those assigned via an action creator):
 * - ofActionType('ACTION_1'), map(({ property }) => property)
 * This is assuming the actions we define have a specific action type (e.g.
 * 'ACTION_1' as const) instead of just a string.
 */
export function createOfActionType<GeneralAction extends Action>() {
  return <
    SpecificActionType extends GeneralAction["type"],
    SpecificAction extends { type: SpecificActionType } & GeneralAction
  >(
    type:
      | SpecificActionType
      | SpecificActionType[]
      | readonly SpecificActionType[],
    filterFn: (action: SpecificAction) => boolean = () => true
  ): OperatorFunction<GeneralAction, SpecificAction> => {
    const typeSet = new Set(type instanceof Array ? type : [type]);

    return (obs) => {
      return obs.pipe(
        map((action) => {
          if (
            action != null &&
            typeSet.has(action.type) &&
            filterFn(action as SpecificAction)
          ) {
            return action as SpecificAction;
          }

          return undefined;
        }),
        filter((action) => action != null),
        map((action) => action!)
      );
    };
  };
}
