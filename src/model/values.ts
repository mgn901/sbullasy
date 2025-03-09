import type { NominalPrimitive } from '../utils/type-utils.ts';

export const typeSymbol = Symbol();

const emailAddressTypeSymbol = Symbol();

export type EmailAddress = NominalPrimitive<string, typeof emailAddressTypeSymbol>;

export const isEmailAddress = (value: unknown) => {
  // 正規表現は https://v2.ja.vuejs.org/v2/cookbook/form-validation より
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return typeof value === 'string' && regex.test(value);
};
