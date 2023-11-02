import { JSONSchema7 } from 'json-schema';
import { isJsonSchema } from '../../utils/isJsonSchema.ts';

export type TItemSchema = JSONSchema7 & {
  type: 'object';
  properties: NonNullable<JSONSchema7['properties']>;
};

export const isItemSchema = (value: unknown): value is TItemSchema => {
  if (!isJsonSchema(value) || value.type !== 'object' || !value.properties) {
    return false;
  }
  return true;
};
