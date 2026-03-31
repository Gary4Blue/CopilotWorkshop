import { randomUUID } from 'node:crypto';
import { validateTaskInput, validateTaskId } from '../utils/validators.js';

/**
 * Represents a single task with validation and safe serialization.
 */
export class Task {
  /**
   * Creates a task instance.
   * @param {object} input - Initial task fields.
   * @param {string} input.title - Required task title.
   * @param {string} [input.description=''] - Optional task description.
   * @param {'todo'|'in-progress'|'done'} [input.status='todo'] - Task status.
   * @param {'low'|'medium'|'high'} [input.priority='medium'] - Task priority.
   * @param {string} [input.id] - Existing id (mainly for hydration).
   * @param {string} [input.createdAt] - Existing creation timestamp.
   * @param {string} [input.updatedAt] - Existing updated timestamp.
   */
  constructor(input) {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new TypeError('Task constructor input must be a plain object');
    }

    const normalized = {
      title: input.title,
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium'
    };

    const errors = validateTaskInput(normalized);
    if (errors.length > 0) {
      throw new TypeError(`Invalid task input: ${errors.join('; ')}`);
    }

    if (input.id !== undefined) {
      const idError = validateTaskId(input.id);
      if (idError) {
        throw new TypeError(idError);
      }
      this.id = input.id;
    } else {
      this.id = randomUUID();
    }

    this.title = normalized.title.trim();
    this.description = normalized.description;
    this.status = normalized.status;
    this.priority = normalized.priority;

    const now = new Date().toISOString();
    this.createdAt = input.createdAt ?? now;
    this.updatedAt = input.updatedAt ?? now;

    if (typeof this.createdAt !== 'string' || typeof this.updatedAt !== 'string') {
      throw new TypeError('createdAt and updatedAt must be ISO timestamp strings');
    }
  }

  /**
   * Applies partial updates to this task and refreshes updatedAt.
   * @param {object} changes - Fields to update.
   * @returns {Task} The same task instance after mutation.
   */
  update(changes) {
    if (changes === null || typeof changes !== 'object' || Array.isArray(changes)) {
      throw new TypeError('changes must be a plain object');
    }

    const current = this.toJSON();
    const merged = {
      title: changes.title ?? current.title,
      description: changes.description ?? current.description,
      status: changes.status ?? current.status,
      priority: changes.priority ?? current.priority
    };

    const errors = validateTaskInput(merged);
    if (errors.length > 0) {
      throw new TypeError(`Invalid task update: ${errors.join('; ')}`);
    }

    this.title = merged.title.trim();
    this.description = merged.description;
    this.status = merged.status;
    this.priority = merged.priority;
    this.updatedAt = new Date().toISOString();

    return this;
  }

  /**
   * Converts this task to a plain object.
   * @returns {object} A serializable task object.
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
