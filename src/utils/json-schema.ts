import Ajv from 'ajv';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

export type TJSONSchema = JSONSchema;

export const validateByJsonSchema = (
  value: unknown,
  schema: TJSONSchema,
): value is FromSchema<typeof schema> => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  return validate(value);
};
