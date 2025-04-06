import { Ajv, type JSONSchemaType } from 'ajv';
import type { FromSchema } from 'json-schema-to-ts';

export type JSONSchema<T> = JSONSchemaType<T>;

export const validateByJsonSchema = <T>(
  value: unknown,
  schema: JSONSchema<T>,
): value is FromSchema<typeof schema> => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  return validate(value);
};
