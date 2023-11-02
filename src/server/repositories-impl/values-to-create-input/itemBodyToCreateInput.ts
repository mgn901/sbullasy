import { IItemBody } from '../../../models/values/IItemBody.ts';
import { generateId } from '../../../models/values/TId.ts';
import { TCreateInput } from '../prisma-utils/types.ts';

const itemBodyValueToCreateInput = (
  key: string,
  value: Exclude<IItemBody[string], unknown[]>,
): Exclude<NonNullable<TCreateInput['item']['body']>['create'], undefined | unknown[]> => ({
  id: generateId(),
  key,
  valueInString: typeof value === 'string' ? value : undefined,
  valueInNumber: typeof value === 'number' ? value : undefined,
  valueInBoolean: typeof value === 'boolean' ? value : undefined,
  valueInItemId: typeof value === 'object' ? value.id : undefined,
});

export const itemBodyToCreateInput = (
  itemBody: IItemBody,
): ReturnType<typeof itemBodyValueToCreateInput>[] =>
  Object.entries(itemBody).reduce<ReturnType<typeof itemBodyValueToCreateInput>[]>(
    (prev, [key, value]) => {
      if (Array.isArray(value)) {
        const added = value.map((v) => itemBodyValueToCreateInput(key, v));
        prev.push(...added);
        return prev;
      }
      prev.push(itemBodyValueToCreateInput(key, value));
      return prev;
    },
    [],
  );
