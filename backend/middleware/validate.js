export function requireString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return `${fieldName} is required and must be a non-empty string`;
  }
  return null;
}

export function optionalString(value, fieldName) {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }
  return null;
}

export function requireDateString(value, fieldName) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${fieldName} is required and must be in YYYY-MM-DD format`;
  }
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) {
    return `${fieldName} is not a valid date`;
  }
  return null;
}

export function optionalDateString(value, fieldName) {
  if (value === undefined || value === null) return null;
  return requireDateString(value, fieldName);
}

export function optionalInt(value, fieldName) {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value)) {
    return `${fieldName} must be an integer`;
  }
  return null;
}

export function optionalBoolean(value, fieldName) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'boolean') {
    return `${fieldName} must be true or false`;
  }
  return null;
}
