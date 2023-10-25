import { IItemSummary } from '../entities/item/IItemSummary.ts';

export interface IItemBody {
  [k: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | IItemSummary
    | IItemSummary[];
}
