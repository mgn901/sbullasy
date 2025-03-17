import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type { I18nMap } from '../../lib/context.ts';
import type { Id } from '../../lib/random-values/id.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { Name, TTitle, TitleForUrl } from '../../values.ts';
import type { Group } from '../group/group.ts';
import type { GroupId } from '../group/values.ts';
import type { ItemTypeName } from './item-type.ts';

//#region Item
const itemTypeSymbol = Symbol('item.type');
const referenceTypeSymbol = Symbol('reference.type');
const itemWithReferencesTypeSymbol = Symbol('itemWithReferences.type');
export type ItemId = NominalPrimitive<Id, typeof itemTypeSymbol>;

export type Item = {
  readonly [itemTypeSymbol]: typeof itemTypeSymbol;
  readonly id: ItemId;
  readonly type: ItemTypeName;
  readonly name: Name;
  readonly title: TTitle;
  readonly titleI18nMap: I18nMap;
  readonly titleForUrl: TitleForUrl;
  readonly properties: {
    readonly [K in string]:
      | readonly { readonly referenceId: ItemId }[]
      | readonly { readonly rawValue: string | number | boolean | Date }[];
  };
  readonly ownedBy: GroupId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt: Date | undefined;
};

export type Reference = { readonly [referenceTypeSymbol]: typeof referenceTypeSymbol } & Pick<
  Item,
  'id' | 'type' | 'name' | 'title' | 'titleForUrl' | 'ownedBy'
>;

export type ItemWithReferences = Item & {
  readonly [itemWithReferencesTypeSymbol]: typeof itemWithReferencesTypeSymbol;
  readonly properties: {
    readonly [K in string]: readonly Reference[] | { readonly rawValue: string }[];
  };
  readonly ownedBy: Group;
};

export interface ItemRepository {
  getOneById<TId extends ItemId>(
    this: ItemRepository,
    id: TId,
  ): Promise<FromRepository<ItemWithReferences & { readonly id: TId }> | undefined>;

  getManyWith(
    this: ItemRepository,
    params: {
      readonly filters?: Filters<Item>;
      readonly orderBy: OrderBy<Item>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<ItemWithReferences>[] | readonly []>;

  createOne(this: ItemRepository, item: Item): Promise<void>;

  updateOne(this: ItemRepository, item: FromRepository<Item>): Promise<void>;

  deleteOneById(this: ItemRepository, itemId: ItemId): Promise<void>;

  deleteMany(this: ItemRepository, params: { readonly filters: Filters<Item> }): Promise<void>;
}
//#endregion
