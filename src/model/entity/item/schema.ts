import { intersect } from '@mgn901/mgn901-utils-ts/set-operations';
import { isId } from '../../lib/random-values/id.ts';
import { isName } from '../../values.ts';
import type { ItemLinkDetailed, ItemLinkSummary } from './item.ts';
import type { ItemSchema } from './item-type.ts';

export type PropertiesTypeFromItemSchema<S extends ItemSchema> = {
  readonly [K in keyof S]: S[K] extends `link:${string}`
    ? ItemLinkSummary
    : S[K] extends 'string'
      ? string
      : S[K] extends 'number'
        ? number
        : S[K] extends 'boolean'
          ? boolean
          : S[K] extends `link:${string}[]`
            ? ItemLinkSummary[]
            : S[K] extends 'string[]'
              ? string[]
              : S[K] extends 'number[]'
                ? number[]
                : S[K] extends 'boolean[]'
                  ? boolean[]
                  :
                      | ItemLinkSummary
                      | string
                      | number
                      | boolean
                      | ItemLinkSummary[]
                      | string[]
                      | number[]
                      | boolean[];
};

export type DetailedPropertiesTypeFromItemSchema<S extends ItemSchema> = {
  readonly [K in keyof S]: S[K] extends `link:${string}`
    ? ItemLinkDetailed
    : S[K] extends 'std:string'
      ? string
      : S[K] extends 'std:number'
        ? number
        : S[K] extends 'std:boolean'
          ? boolean
          : S[K] extends `link:${string}[]`
            ? ItemLinkDetailed[]
            : S[K] extends 'std:string[]'
              ? string[]
              : S[K] extends 'std:number[]'
                ? number[]
                : S[K] extends 'std:boolean[]'
                  ? boolean[]
                  :
                      | ItemLinkDetailed
                      | string
                      | number
                      | boolean
                      | ItemLinkDetailed[]
                      | string[]
                      | number[]
                      | boolean[];
};

const isItemLinkSummary = (value: unknown): value is ItemLinkSummary =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'typeName' in value &&
  typeof value.id === 'string' &&
  typeof value.typeName === 'string' &&
  isId(value.id) &&
  isName(value.typeName);

export const validateProperties = <S extends ItemSchema>(
  value: unknown,
  schema: S,
): value is PropertiesTypeFromItemSchema<S> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    intersect(Object.keys(record), Object.keys(schema)).length === Object.keys(schema).length &&
    Object.keys(schema).every((key) => {
      if (typeof key !== 'string' || key in record === false) {
        return false;
      }
      if (schema[key].startsWith('link:') && schema[key].endsWith('[]')) {
        return (
          Array.isArray(record[key]) &&
          record[key].every(isItemLinkSummary) &&
          record[key].every((element) => element.typeName === schema[key].slice(5, -2))
        );
      }
      if (schema[key] === 'std:string[]') {
        return (
          Array.isArray(record[key]) && record[key].every((element) => typeof element === 'string')
        );
      }
      if (schema[key] === 'std:number[]') {
        return (
          Array.isArray(record[key]) && record[key].every((element) => typeof element === 'number')
        );
      }
      if (schema[key] === 'std:boolean[]') {
        return (
          Array.isArray(record[key]) && record[key].every((element) => typeof element === 'boolean')
        );
      }
      if (schema[key].startsWith('link:')) {
        return isItemLinkSummary(record[key]) && record[key].typeName === schema[key].slice(5);
      }
      if (schema[key] === 'std:string') {
        return typeof record[key] === 'string';
      }
      if (schema[key] === 'std:number') {
        return typeof record[key] === 'number';
      }
      if (schema[key] === 'std:boolean') {
        return typeof record[key] === 'boolean';
      }
      return false;
    })
  );
};
