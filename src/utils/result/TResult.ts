export type TResult<S, E extends Error = Error> = Success<S> | Failure<E>;

export class Success<S> {
  public readonly value: S;

  public constructor(value: S) {
    this.value = value;
  }
}

export class Failure<E extends Error = Error> {
  public readonly value: E;

  public constructor(value: E) {
    this.value = value;
  }
}
