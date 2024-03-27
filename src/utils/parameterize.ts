export type TParameterize<E extends object> = {
  readonly [k in keyof E as E[k] extends (...args: never) => unknown
    ? never
    : k extends symbol
      ? never
      : k]: E[k];
};
