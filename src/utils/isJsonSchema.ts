import { JSONSchema7 } from 'json-schema';
import Ajv from 'ajv';

export const isJsonSchema = (value: unknown): value is JSONSchema7 => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const ajv = new Ajv();
  const result = ajv.validateSchema(value);
  if (result) {
    return true;
  }
  return false;
};
