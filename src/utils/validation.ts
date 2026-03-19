/**
 * Validation helpers for tide pool monitoring data.
 * Ensures data integrity for field-entered measurements,
 * species names, and geographic coordinates.
 */

export function isPositive(value: number): boolean {
  return typeof value === "number" && value > 0;
}

export function isNonNegative(value: number): boolean {
  return typeof value === "number" && value >= 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === "number" && value >= min && value <= max;
}

export function isValidName(name: string): boolean {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}

export function isValidSpeciesName(name: string): boolean {
  if (!isValidName(name)) return false;
  // Binomial nomenclature: at least genus and species, Latin characters
  const binomial = /^[A-Z][a-z]+ [a-z]+(\s[a-z]+)?$/;
  return binomial.test(name.trim());
}

export function isValidCoordinate(lat: number, lon: number): boolean {
  return isInRange(lat, -90, 90) && isInRange(lon, -180, 180);
}

export function isValidPh(ph: number): boolean {
  return isInRange(ph, 0, 14);
}

export function isValidTemperature(celsius: number): boolean {
  return isInRange(celsius, -10, 60);
}

export function isValidSalinity(ppt: number): boolean {
  return isInRange(ppt, 0, 50);
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidId(id: string): boolean {
  if (typeof id !== "string") return false;
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 64;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value: unknown;
}

export function validateFields(
  fields: Record<string, unknown>,
  rules: Record<string, (val: unknown) => boolean>
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const [field, validator] of Object.entries(rules)) {
    const value = fields[field];
    if (!validator(value)) {
      errors.push({
        field,
        message: `Invalid value for '${field}'`,
        value,
      });
    }
  }
  return errors;
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

export function firstError(errors: ValidationError[]): ValidationError | null {
  return errors.length > 0 ? errors[0] : null;
}
