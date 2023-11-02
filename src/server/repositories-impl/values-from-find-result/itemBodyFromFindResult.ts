import { IItemBody } from '../../../models/values/IItemBody.ts';
import { TItemSchema } from '../../../models/values/TItemSchema.ts';
import { isJsonSchema } from '../../../utils/isJsonSchema.ts';
import { ItemSummaryFromFindResult } from '../entities-from-find-result/ItemSummaryFromFindResult.ts';
import {
  TGetFindUniqueArgsFromInclude,
  itemBodyInclude,
  itemIncludeForItemSummary,
} from '../prisma-utils/include.ts';
import { TFindResult } from '../prisma-utils/types.ts';

export const itemBodyFromFindResult = (
  results: (
    | TFindResult<
        'itemBody',
        TGetFindUniqueArgsFromInclude<typeof itemBodyInclude, 'itemBody'>,
        TGetFindUniqueArgsFromInclude<typeof itemBodyInclude, 'itemBody'>
      >
    | TFindResult<
        'item',
        TGetFindUniqueArgsFromInclude<typeof itemIncludeForItemSummary, 'item'>,
        TGetFindUniqueArgsFromInclude<typeof itemIncludeForItemSummary, 'item'>
      >['body'][number]
  )[],
  schema: TItemSchema,
): IItemBody =>
  results.reduce<IItemBody>((prev, current) => {
    const { key } = current;
    const valuePrimitive =
      current.valueInString ?? current.valueInNumber ?? current.valueInBoolean ?? undefined;
    const valueObject =
      'valueInItem' in current && current.valueInItem
        ? new ItemSummaryFromFindResult(current.valueInItem)
        : undefined;

    if (!(key in schema.properties)) {
      return prev;
    }

    const schemaProperty = schema.properties[key];

    if (!isJsonSchema(schemaProperty) || schemaProperty.type !== 'array') {
      type V = Extract<IItemBody[string], unknown[]>;

      const valueExists = prev[key] as V;

      if (valueExists) {
        if (valuePrimitive !== undefined) {
          return { ...prev, [key]: [...valueExists, valuePrimitive] as V };
        }

        if (valueObject !== undefined) {
          return { ...prev, [key]: [...valueExists, valueObject] as V };
        }
      }

      if (valuePrimitive !== undefined) {
        return { ...prev, [key]: valuePrimitive };
      }

      if (valueObject !== undefined) {
        return { ...prev, [key]: valueObject };
      }
    }

    if (valuePrimitive !== undefined) {
      return { ...prev, [key]: valuePrimitive };
    }

    if (valueObject !== undefined) {
      return { ...prev, [key]: valueObject };
    }

    return prev;
  }, {});
