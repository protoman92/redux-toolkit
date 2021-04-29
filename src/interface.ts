import { Action } from "redux";

type ActionCreator = {
  [x: string]: Action | ((...args: any[]) => Action) | ActionCreator;
};

export type ActionType<T extends ActionCreator> = {
  [x in keyof T]: T[x] extends (...args: any[]) => any
    ? ReturnType<T[x]>
    : T[x] extends ActionCreator
    ? ActionType<T[x]>
    : T[x];
}[keyof T];
