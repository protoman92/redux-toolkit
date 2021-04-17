import { Action } from "redux";

export type ActionType<
  T extends { [x: string]: Action | ((...args: any[]) => Action) }
> = {
  [x in keyof T]: T[x] extends (...args: any[]) => any
    ? ReturnType<T[x]>
    : T[x];
}[keyof T];
