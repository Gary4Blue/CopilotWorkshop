const STATUS_VALUES = ['todo', 'in-progress', 'done'];
const PRIORITY_VALUES = ['low', 'medium', 'high'];
const SORT_VALUES = ['createdAt', 'priority'];

/**
 * Validates task payload fields and returns human-readable errors.
 * @param {object} input - Task-like payload to validate.
 * @param {object} [options] - Validation options.
 * @param {boolean} [options.partial=false] - When true, only validates provided fields.
 * @returns {string[]} A list of validation errors. Empty when valid.
 * @example
 * validateTaskInput({ title: 'Ship docs' });
 * // []
 * @example
 * validateTaskInput({ title: '   ' });
 * // ['title is required and must not be blank']
 */
export function validateTaskInput(input, options = {}) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('input must be a plain object');
  }

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be a plain object');
  }

  const { partial = false } = options;

  if (typeof partial !== 'boolean') {
    throw new TypeError('options.partial must be a boolean');
  }

  const errors = [];
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(input, key);

  if (!partial || hasOwn('title')) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      errors.push('title is required and must not be blank');
    }
  }

  if (hasOwn('description') && typeof input.description !== 'string') {
    errors.push('description must be a string');
  }

  if (!partial || hasOwn('status')) {
    if (typeof input.status !== 'string' || !STATUS_VALUES.includes(input.status)) {
      errors.push('status must be one of: todo, in-progress, done');
    }
  }

  if (!partial || hasOwn('priority')) {
    if (typeof input.priority !== 'string' || !PRIORITY_VALUES.includes(input.priority)) {
      errors.push('priority must be one of: low, medium, high');
    }
  }

  return errors;
}

/**
 * Validates a task id argument.
 * @param {string} id - A task identifier.
 * @returns {string|null} Null when valid, otherwise a validation error.
 * @example
 * validateTaskId('6f8f5b8e-04f9-4df0-90ac-66c9498f5bd5');
 * // null
 * @example
 * validateTaskId('');
 * // 'id must be a non-empty string'
 */
export function validateTaskId(id) {
  if (typeof id !== 'string') {
    throw new TypeError('id must be a string');
  }

  if (id.trim().length === 0) {
    return 'id must be a non-empty string';
  }

  return null;
}

/**
 * Validates the field used for sorting task lists.
 * @param {string} sortBy - Sort key.
 * @returns {string|null} Null when valid, otherwise a validation error.
 * @example
 * validateSortBy('createdAt');
 * // null
 * @example
 * validateSortBy('name');
 * // 'sort must be one of: createdAt, priority'
 */
export function validateSortBy(sortBy) {
  if (typeof sortBy !== 'string') {
    throw new TypeError('sortBy must be a string');
  }

  if (!SORT_VALUES.includes(sortBy)) {
    return 'sort must be one of: createdAt, priority';
  }

  return null;
}

/**
 * Compares two priority values for descending sort order.
 * @param {'low'|'medium'|'high'} left - Left priority.
 * @param {'low'|'medium'|'high'} right - Right priority.
 * @returns {number} Negative, zero, or positive for sort order.
 * @example
 * comparePriority('high', 'medium');
 * // -1
 * @example
 * comparePriority('low', 'high');
 * // 1
 */
export function comparePriority(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') {
    throw new TypeError('left and right priorities must be strings');
  }

  if (!PRIORITY_VALUES.includes(left) || !PRIORITY_VALUES.includes(right)) {
    throw new TypeError('left and right must be one of: low, medium, high');
  }

  const rank = { high: 0, medium: 1, low: 2 };
  return rank[left] - rank[right];
}

export { PRIORITY_VALUES, STATUS_VALUES, SORT_VALUES };
