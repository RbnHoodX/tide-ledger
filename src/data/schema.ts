/**
 * Schema definitions for tide pool survey data structures.
 * Provides validation rules and type checking utilities
 * for ensuring data integrity across the monitoring system.
 */

export type FieldType = "string" | "number" | "boolean" | "date" | "array" | "object";

export interface FieldDefinition {
  readonly name: string;
  readonly type: FieldType;
  readonly required: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly pattern?: string;
}

export interface SchemaDefinition {
  readonly name: string;
  readonly version: number;
  readonly fields: FieldDefinition[];
  readonly primaryKey: string;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value: unknown;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
}

export function defineField(
  name: string,
  type: FieldType,
  required: boolean = true,
  options: Partial<Pick<FieldDefinition, "minLength" | "maxLength" | "minValue" | "maxValue" | "pattern">> = {}
): FieldDefinition {
  return { name, type, required, ...options };
}

export function defineSchema(
  name: string,
  version: number,
  primaryKey: string,
  fields: FieldDefinition[]
): SchemaDefinition {
  return { name, version, fields, primaryKey };
}

export function validateField(field: FieldDefinition, value: unknown): ValidationError | null {
  if (value === undefined || value === null) {
    if (field.required) {
      return { field: field.name, message: "Required field is missing", value };
    }
    return null;
  }

  const actualType = typeof value;
  if (field.type === "date") {
    if (!(value instanceof Date) && typeof value !== "string") {
      return { field: field.name, message: `Expected date, got ${actualType}`, value };
    }
  } else if (field.type === "array") {
    if (!Array.isArray(value)) {
      return { field: field.name, message: `Expected array, got ${actualType}`, value };
    }
  } else if (actualType !== field.type) {
    return { field: field.name, message: `Expected ${field.type}, got ${actualType}`, value };
  }

  if (field.type === "string" && typeof value === "string") {
    if (field.minLength !== undefined && value.length < field.minLength) {
      return { field: field.name, message: `String too short (min ${field.minLength})`, value };
    }
    if (field.maxLength !== undefined && value.length > field.maxLength) {
      return { field: field.name, message: `String too long (max ${field.maxLength})`, value };
    }
    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      return { field: field.name, message: `Does not match pattern ${field.pattern}`, value };
    }
  }

  if (field.type === "number" && typeof value === "number") {
    if (field.minValue !== undefined && value < field.minValue) {
      return { field: field.name, message: `Value below minimum (${field.minValue})`, value };
    }
    if (field.maxValue !== undefined && value > field.maxValue) {
      return { field: field.name, message: `Value above maximum (${field.maxValue})`, value };
    }
  }

  return null;
}

export function validateRecord(
  schema: SchemaDefinition,
  record: Record<string, unknown>
): ValidationResult {
  const errors: ValidationError[] = [];
  for (const field of schema.fields) {
    const error = validateField(field, record[field.name]);
    if (error) errors.push(error);
  }
  return { valid: errors.length === 0, errors };
}

export function schemaFingerprint(schema: SchemaDefinition): string {
  const fieldSigs = schema.fields
    .map((f) => `${f.name}:${f.type}:${f.required}`)
    .sort()
    .join("|");
  return `${schema.name}@v${schema.version}[${fieldSigs}]`;
}
