import { shallowCloneArray } from "./utils";

describe("Utils", () => {
  it("Should shallow clone array correctly", () => {
    expect(shallowCloneArray(undefined)).toEqual([]);
    expect(shallowCloneArray(null)).toEqual([]);
    expect(shallowCloneArray([1])).toEqual([1]);
  });
});
