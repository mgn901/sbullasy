export type TPrimitive = string | number | bigint | boolean | undefined | symbol | null;

export type TNominalPrimitive<P extends TPrimitive, N extends symbol> = P & Record<N, unknown>;
