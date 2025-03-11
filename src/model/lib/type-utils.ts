import type { OmitByValue } from '../../utils/type-utils.ts';

/** `T`から、メソッドや値に関数をとるプロパティを取り除いた型を得る。 */
export type FieldsOf<T> = OmitByValue<T, ((...args: never[]) => unknown) | symbol>;

/** `U`から`T`にはないフィールドを取り除いた型を得る。 */
export type PickEssential<T, K> = Pick<T, Extract<keyof T, K>>;

// export type OmitExtra<T, P> = Omit<P, Exclude<keyof P, keyof T>>;

/** `T`のインスタンスで、各フィールドの値の型が、`U`の各フィールドの値の型と同じである型を得る。 */
export type TypedInstance<T, U> = T & PickEssential<U, keyof FieldsOf<T>>;

/** 2つの引数オブジェクトを組み合わせる。 */
export const mergeParams = <OriginalParams, TPreAppliedParams = Partial<OriginalParams>>(params: {
  readonly params: Omit<OriginalParams, keyof TPreAppliedParams>;
  readonly preAppliedParams: TPreAppliedParams;
}): OriginalParams => {
  return { ...params.preAppliedParams, ...params.params } as OriginalParams;
};

export type WithHint<THint, TToHinted> = TToHinted & Partial<THint>;

/** 左辺を必須、右辺を必須ではないとする型を組み合わせた型を得る。 */
export type RequireLeft<Left, Right> = Omit<Left, keyof Right> & Partial<Right>;

export type PreApplied<
  F extends (this: unknown, params: never) => unknown,
  TPreAppliedParams = Partial<Parameters<F>[0]>,
> = F extends (this: unknown, params: infer P) => infer R
  ? (params: RequireLeft<P, TPreAppliedParams>) => R
  : never;

export const preApply =
  <P, R, TPreAppliedParams = Partial<P>>(
    func: (this: unknown, params: P) => R,
    preAppliedParams: WithHint<P, TPreAppliedParams>,
  ): PreApplied<(this: unknown, params: P) => R, TPreAppliedParams> =>
  (params) =>
    func(mergeParams<P, TPreAppliedParams>({ params, preAppliedParams }));
