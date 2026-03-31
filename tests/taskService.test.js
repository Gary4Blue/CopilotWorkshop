import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createTask,
  deleteTask,
  filterTasks,
  getAllTasks,
  getTaskById,
  sortTasks,
  updateTask
} from '../src/services/taskService.js';

function resetTaskStore() {
  const existing = getAllTasks();
  for (const task of existing) {
    deleteTask(task.id);
  }
}

test.beforeEach(() => {
  resetTaskStore();
});

test('createTask stores and returns a task with defaults', () => {
  const created = createTask({ title: 'Create release notes' });

  assert.equal(typeof created.id, 'string');
  assert.equal(created.title, 'Create release notes');
  assert.equal(created.description, '');
  assert.equal(created.status, 'todo');
  assert.equal(created.priority, 'medium');

  const all = getAllTasks();
  assert.equal(all.length, 1);
  assert.equal(all[0].id, created.id);
});

test('createTask throws Error for invalid input payload', () => {
  assert.throws(
    () => createTask({ title: '' }),
    {
      name: 'Error',
      message: /Invalid input: title is required and must not be blank/
    }
  );
});

test('getAllTasks returns copies, not internal references', () => {
  const created = createTask({ title: 'Immutable check' });
  const snapshot = getAllTasks();

  snapshot[0].title = 'Mutated title';

  const fetched = getTaskById(created.id);
  assert.equal(fetched.title, 'Immutable check');
});

test('getTaskById returns matching task and throws when missing', () => {
  const created = createTask({ title: 'Find me' });

  const found = getTaskById(created.id);
  assert.equal(found.id, created.id);

  assert.throws(
    () => getTaskById('missing-id'),
    {
      name: 'Error',
      message: 'Task not found for id: missing-id'
    }
  );
});

test('getTaskById throws TypeError when id is not a string', () => {
  assert.throws(
    () => getTaskById(42),
    {
      name: 'TypeError',
      message: 'id must be a string'
    }
  );
});

test('updateTask updates allowed fields and returns updated task', () => {
  const created = createTask({
    title: 'Implement parser',
    description: 'v1 parser',
    status: 'todo',
    priority: 'low'
  });

  const updated = updateTask(created.id, {
    status: 'in-progress',
    priority: 'high',
    description: 'v2 parser'
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.status, 'in-progress');
  assert.equal(updated.priority, 'high');
  assert.equal(updated.description, 'v2 parser');
});

test('updateTask ignores unknown fields in changes payload', () => {
  const created = createTask({ title: 'Known fields only' });

  const updated = updateTask(created.id, {
    owner: 'team-a',
    status: 'done'
  });

  assert.equal(updated.status, 'done');
  assert.equal(Object.prototype.hasOwnProperty.call(updated, 'owner'), false);
});

test('updateTask throws Error for invalid changes payload type', () => {
  const created = createTask({ title: 'Reject arrays' });

  assert.throws(
    () => updateTask(created.id, []),
    {
      name: 'Error',
      message: 'Invalid input: changes must be a plain object'
    }
  );
});

test('updateTask throws Error for invalid field values', () => {
  const created = createTask({ title: 'Validation test' });

  assert.throws(
    () => updateTask(created.id, { priority: 'urgent' }),
    {
      name: 'Error',
      message: /Invalid input: priority must be one of: low, medium, high/
    }
  );
});

test('updateTask throws Error when id is not found', () => {
  assert.throws(
    () => updateTask('missing-id', { status: 'done' }),
    {
      name: 'Error',
      message: 'Task not found for id: missing-id'
    }
  );
});

test('deleteTask removes task and returns deleted object', () => {
  const created = createTask({ title: 'Delete me' });

  const removed = deleteTask(created.id);
  assert.equal(removed.id, created.id);
  assert.equal(getAllTasks().length, 0);

  assert.throws(
    () => deleteTask(created.id),
    {
      name: 'Error',
      message: `Task not found for id: ${created.id}`
    }
  );
});

test('filterTasks can filter by status and priority', () => {
  createTask({ title: 'Task A', status: 'todo', priority: 'high' });
  createTask({ title: 'Task B', status: 'done', priority: 'low' });
  createTask({ title: 'Task C', status: 'done', priority: 'high' });

  const done = filterTasks({ status: 'done' });
  assert.equal(done.length, 2);

  const high = filterTasks({ priority: 'high' });
  assert.equal(high.length, 2);

  const doneAndHigh = filterTasks({ status: 'done', priority: 'high' });
  assert.equal(doneAndHigh.length, 1);
  assert.equal(doneAndHigh[0].title, 'Task C');
});

test('filterTasks throws Error for invalid criteria type', () => {
  assert.throws(
    () => filterTasks('done'),
    {
      name: 'Error',
      message: 'Invalid input: criteria must be a plain object'
    }
  );
});

test('filterTasks throws Error for invalid enum criteria', () => {
  assert.throws(
    () => filterTasks({ status: 'blocked' }),
    {
      name: 'Error',
      message: /Invalid input: status must be one of: todo, in-progress, done/
    }
  );
});

test('sortTasks by createdAt returns ascending chronological order', async () => {
  const first = createTask({ title: 'First created', priority: 'low' });
  await new Promise((resolve) => setTimeout(resolve, 2));
  const second = createTask({ title: 'Second created', priority: 'high' });

  const sorted = sortTasks('createdAt');

  assert.equal(sorted.length, 2);
  assert.equal(sorted[0].id, first.id);
  assert.equal(sorted[1].id, second.id);
});

test('sortTasks by priority returns high before medium before low', () => {
  const low = createTask({ title: 'Low prio', priority: 'low' });
  const high = createTask({ title: 'High prio', priority: 'high' });
  const medium = createTask({ title: 'Medium prio', priority: 'medium' });

  const sorted = sortTasks('priority');
  const ids = sorted.map((task) => task.id);

  assert.deepEqual(ids, [high.id, medium.id, low.id]);
});

test('sortTasks throws Error for unsupported sort key', () => {
  assert.throws(
    () => sortTasks('title'),
    {
      name: 'Error',
      message: 'Invalid input: sort must be one of: createdAt, priority'
    }
  );
});
