import { Task } from '../models/task.js';
import {
  comparePriority,
  validateSortBy,
  validateTaskId,
  validateTaskInput
} from '../utils/validators.js';

/** @type {Task[]} */
const tasks = [];

/**
 * Creates and stores a new task.
 * @param {object} input - Raw task fields.
 * @returns {object} The created task as a plain object.
 */
export function createTask(input) {
  const payload = {
    title: input?.title,
    description: input?.description ?? '',
    status: input?.status ?? 'todo',
    priority: input?.priority ?? 'medium'
  };

  const errors = validateTaskInput(payload);
  if (errors.length > 0) {
    throw new Error(`Invalid input: ${errors.join('; ')}`);
  }

  const task = new Task(payload);
  tasks.push(task);
  return task.toJSON();
}

/**
 * Returns all tasks as plain-object copies.
 * @returns {object[]} All stored tasks.
 */
export function getAllTasks() {
  return tasks.map((task) => task.toJSON());
}

/**
 * Returns one task by id.
 * @param {string} id - Task id.
 * @returns {object} The matching task as a plain object.
 */
export function getTaskById(id) {
  const idError = validateTaskId(id);
  if (idError) {
    throw new Error(`Invalid input: ${idError}`);
  }

  const match = tasks.find((task) => task.id === id);
  if (!match) {
    throw new Error(`Task not found for id: ${id}`);
  }

  return match.toJSON();
}

/**
 * Updates a stored task.
 * @param {string} id - Task id.
 * @param {object} changes - Partial task fields.
 * @returns {object} Updated task as a plain object.
 */
export function updateTask(id, changes) {
  const idError = validateTaskId(id);
  if (idError) {
    throw new Error(`Invalid input: ${idError}`);
  }

  if (changes === null || typeof changes !== 'object' || Array.isArray(changes)) {
    throw new Error('Invalid input: changes must be a plain object');
  }

  const allowedChanges = {};
  if (Object.prototype.hasOwnProperty.call(changes, 'title')) {
    allowedChanges.title = changes.title;
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'description')) {
    allowedChanges.description = changes.description;
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'status')) {
    allowedChanges.status = changes.status;
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'priority')) {
    allowedChanges.priority = changes.priority;
  }

  const partialErrors = validateTaskInput(allowedChanges, { partial: true });
  if (partialErrors.length > 0) {
    throw new Error(`Invalid input: ${partialErrors.join('; ')}`);
  }

  const match = tasks.find((task) => task.id === id);
  if (!match) {
    throw new Error(`Task not found for id: ${id}`);
  }

  return match.update(allowedChanges).toJSON();
}

/**
 * Deletes a task by id.
 * @param {string} id - Task id.
 * @returns {object} The deleted task as a plain object.
 */
export function deleteTask(id) {
  const idError = validateTaskId(id);
  if (idError) {
    throw new Error(`Invalid input: ${idError}`);
  }

  const index = tasks.findIndex((task) => task.id === id);
  if (index < 0) {
    throw new Error(`Task not found for id: ${id}`);
  }

  const [deleted] = tasks.splice(index, 1);
  return deleted.toJSON();
}

/**
 * Filters tasks by optional status and priority.
 * @param {object} criteria - Filter criteria.
 * @param {'todo'|'in-progress'|'done'} [criteria.status] - Optional status filter.
 * @param {'low'|'medium'|'high'} [criteria.priority] - Optional priority filter.
 * @returns {object[]} Matching tasks as plain objects.
 */
export function filterTasks(criteria = {}) {
  if (criteria === null || typeof criteria !== 'object' || Array.isArray(criteria)) {
    throw new Error('Invalid input: criteria must be a plain object');
  }

  const errors = validateTaskInput(criteria, { partial: true });
  const enumErrors = errors.filter(
    (error) => error.includes('status must be one of') || error.includes('priority must be one of')
  );
  if (enumErrors.length > 0) {
    throw new Error(`Invalid input: ${enumErrors.join('; ')}`);
  }

  return tasks
    .filter((task) => (criteria.status ? task.status === criteria.status : true))
    .filter((task) => (criteria.priority ? task.priority === criteria.priority : true))
    .map((task) => task.toJSON());
}

/**
 * Sorts tasks by createdAt ascending or priority descending.
 * @param {'createdAt'|'priority'} sortBy - Sort key.
 * @returns {object[]} Sorted tasks as plain objects.
 */
export function sortTasks(sortBy) {
  const sortError = validateSortBy(sortBy);
  if (sortError) {
    throw new Error(`Invalid input: ${sortError}`);
  }

  const copied = tasks.map((task) => task.toJSON());

  if (sortBy === 'createdAt') {
    return copied.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  return copied.sort((left, right) => comparePriority(left.priority, right.priority));
}
