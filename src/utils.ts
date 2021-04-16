export function shallowCloneArray<T>(array: T[] | null | undefined) {
  if (array == null) return [];
  return [...array];
}
