import { TPrimitive } from './TPrimitive.ts';

export type TNominalPrimitive<P extends TPrimitive, N extends string> = P & { __brand: N };
