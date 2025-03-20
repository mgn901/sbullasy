import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type { I18nMap } from '../../lib/context.ts';
import type { Name } from '../../values.ts';

const itemTypeTypeSymbol = Symbol('itemType.type');
export type ItemTypeName = NominalPrimitive<Name, typeof itemTypeTypeSymbol>;

export type ItemType = {
  readonly [itemTypeTypeSymbol]: typeof itemTypeTypeSymbol;
  readonly name: ItemTypeName;
  readonly displayNameI18nMap: I18nMap;
};
