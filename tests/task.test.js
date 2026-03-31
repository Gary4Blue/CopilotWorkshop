import test from 'node:test';
import assert from 'node:assert/strict';

import { Task } from '../src/models/task.js';

test('Task constructor builds task with defaults and trimmed title', () => {
  const task = new Task({ title: '  Write docs  ' });

  assert.equal(typeof task.id, 'string');
  assert.equal(task.title, 'Write docs');
  assert.equal(task.description, '');
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'medium');
  assert.equal(typeof task.createdAt, 'string');
  assert.equal(typeof task.updatedAt, 'string');
});

test('Task constructor keeps provided id and timestamps', () => {
  const task = new Task({
    id: 'task-1',
    title: 'Plan sprint',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  });

  assert.equal(task.id, 'task-1');
  assert.equal(task.createdAt, '2026-01-01T00:00:00.000Z');
  assert.equal(task.updatedAt, '2026-01-01T00:00:00.000Z');
});

test('Task constructor throws TypeError for non-object input', () => {
  assert.throws(
    () => new Task(null),
    {
      name: 'TypeError',
      message: 'Task constructor input must be a plain object'
    }
  );
});

test('Task constructor throws TypeError for invalid field values', () => {
  assert.throws(
    () => new Task({ title: '   ' }),
    {
      name: 'TypeError',
      message: /Invalid task input: title is required and must not be blank/
    }
  );
});

test('Task constructor throws TypeError for invalid id value', () => {
  assert.throws(
    () => new Task({ id: '   ', title: 'Setup CI' }),
    {
      name: 'TypeError',
      message: 'id must be a non-empty string'
    }
  );
});

test('Task update applies partial changes and refreshes updatedAt', async () => {
  const task = new Task({ title: 'Initial', priority: 'low' });
  const originalUpdatedAt = task.updatedAt;

  await new Promise((resolve) => setTimeout(resolve, 2));

  task.update({ status: 'done', priority: 'high' });

  assert.equal(task.status, 'done');
  assert.equal(task.priority, 'high');
  assert.equal(task.updatedAt > originalUpdatedAt, true);
});

test('Task update throws TypeError when changes is not a plain object', () => {
  const task = new Task({ title: 'Valid title' });

  assert.throws(
    () => task.update([]),
    {
      name: 'TypeError',
      message: 'changes must be a plain object'
    }
  );
});

test('Task update throws TypeError for invalid updated values', () => {
  const task = new Task({ title: 'Valid title' });

  assert.throws(
    () => task.update({ status: 'blocked' }),
    {
      name: 'TypeError',
      message: /Invalid task update: status must be one of: todo, in-progress, done/
    }
  );
});

test('Task toJSON returns plain object that does not mutate task when edited', () => {
  const task = new Task({ title: 'Snapshot task' });
  const snapshot = task.toJSON();

  snapshot.title = 'Changed in snapshot';

  assert.equal(task.title, 'Snapshot task');
  assert.equal(snapshot.title, 'Changed in snapshot');
});
