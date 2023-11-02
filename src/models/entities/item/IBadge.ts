import { IItem } from './IItem.ts';

export type IBadge = {
  readonly __brand: 'IBadge';
} & Pick<IItem, 'id' | 'title' | 'titleForUrl' | 'type'>;
