import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRIORITY_VALUES,
  SORT_VALUES,
  STATUS_VALUES,
  comparePriority,
  validateSortBy,
  validateTaskId,
  validateTaskInput
} from '../src/utils/validators.js';

test('validateTaskInput returns no errors for valid full payload', () => {
  const errors = validateTaskInput({
    title: 'Ship release',
    description: 'Publish changelog',
    status: 'todo',
    priority: 'high'
  });

  assert.deepEqual(errors, []);
});

test('validateTaskInput returns required field errors for missing fields', () => {
  const errors = validateTaskInput({});

  assert.deepEqual(errors, [
    'title is required and must not be blank',
    'status must be one of: todo, in-progress, done',
    'priority must be one of: low, medium, high'
  ]);
});

test('validateTaskInput partial mode validates only provided fields', () => {
  const errors = validateTaskInput({ status: 'done' }, { partial: true });

  assert.deepEqual(errors, []);
});

test('validateTaskInput throws TypeError for non-object input', () => {
  assert.throws(
    () => validateTaskInput(null),
    {
      name: 'TypeError',
      message: 'input must be a plain object'
    }
  );
});

test('validateTaskInput throws TypeError for invalid partial option type', () => {
  assert.throws(
    () => validateTaskInput({}, { partial: 'yes' }),
    {
      name: 'TypeError',
      message: 'options.partial must be a boolean'
    }
  );
});

test('validateTaskId returns null for a non-empty id string', () => {
  const result = validateTaskId('abc-123');
  assert.equal(result, null);
});

test('validateTaskId returns error string for blank id', () => {
  const result = validateTaskId('   ');
  assert.equal(result, 'id must be a non-empty string');
});

test('validateTaskId throws TypeError when id is not a string', () => {
  assert.throws(
    () => validateTaskId(42),
    {
      name: 'TypeError',
      message: 'id must be a string'
    }
  );
});

test('validateSortBy accepts createdAt and priority values', () => {
  assert.equal(validateSortBy('createdAt'), null);
  assert.equal(validateSortBy('priority'), null);
});

test('validateSortBy returns error for unsupported sort key', () => {
  const result = validateSortBy('title');
  assert.equal(result, 'sort must be one of: createdAt, priority');
});

test('validateSortBy throws TypeError when sortBy is not a string', () => {
  assert.throws(
    () => validateSortBy(false),
    {
      name: 'TypeError',
      message: 'sortBy must be a string'
    }
  );
});

test('comparePriority sorts high before medium before low', () => {
  assert.equal(comparePriority('high', 'medium') < 0, true);
  assert.equal(comparePriority('medium', 'low') < 0, true);
  assert.equal(comparePriority('high', 'high'), 0);
});

test('comparePriority throws TypeError for unsupported priority values', () => {
  assert.throws(
    () => comparePriority('urgent', 'low'),
    {
      name: 'TypeError',
      message: 'left and right must be one of: low, medium, high'
    }
  );
});

test('priority status and sort constants expose expected values', () => {
  assert.deepEqual(STATUS_VALUES, ['todo', 'in-progress', 'done']);
  assert.deepEqual(PRIORITY_VALUES, ['low', 'medium', 'high']);
  assert.deepEqual(SORT_VALUES, ['createdAt', 'priority']);
});
