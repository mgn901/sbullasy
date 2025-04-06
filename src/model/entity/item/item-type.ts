import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type { I18nMap } from '../../lib/context.ts';
import type { Name } from '../../values.ts';

export const itemTypeTypeSymbol = Symbol('itemType.type');

export type ItemTypeName = NominalPrimitive<Name, typeof itemTypeTypeSymbol>;

export type ItemType = {
  readonly [itemTypeTypeSymbol]: typeof itemTypeTypeSymbol;
  readonly name: ItemTypeName;
  readonly displayNameI18nMap: I18nMap;
  readonly baseType: 'item' | 'scheduledEvent';
  readonly schema: ItemSchema;
};

export type ItemSchema = Record<
  string,
  | `ref:${string}`
  | 'std:string'
  | 'std:number'
  | 'std:boolean'
  | `ref:${string}[]`
  | 'std:string[]'
  | 'std:number[]'
  | 'std:boolean[]'
>;
