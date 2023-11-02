import { JSONSchema7 } from 'json-schema';
import Ajv from 'ajv';

export const validateByJsonSchema = (value: any, schema: JSONSchema7): boolean => {
  const ajv = new Ajv();
  return ajv.validate(schema, value);
};
