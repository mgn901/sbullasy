import type { TNominalPrimitive } from '../../utils/primitive.ts';
import type { TId } from '../../utils/random-values/id.ts';

const templateTypeSymbol = Symbol('templateTypeSymbol');

export interface ITemplateProperties {
  readonly id: TNominalPrimitive<TId, typeof templateTypeSymbol>;
}
