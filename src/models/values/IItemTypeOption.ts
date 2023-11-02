export interface IItemTypeOptions {
  [k: string]: {
    showOnSummary: boolean;
  };
}

export const isItemTypeOptions = (v: unknown): v is IItemTypeOptions => {
  if (typeof v !== 'object' || v === null) {
    return false;
  }
  return Object.entries(v).every(
    ([key, value]) =>
      typeof key === 'string' &&
      'showOnSummary' in value &&
      typeof value.showOnSummary === 'boolean',
  );
};
