import {
  createTask,
  deleteTask,
  filterTasks,
  getAllTasks,
  getTaskById,
  sortTasks,
  updateTask
} from './services/taskService.js';

/**
 * Demonstrates Task Manager features end-to-end.
 */
function main() {
  try {
    console.log('Task Manager demo starting...');

    const first = createTask({
      title: 'Write project brief',
      description: 'Capture goals and milestones',
      status: 'todo',
      priority: 'high'
    });
    console.log('Created task 1:', first);

    const second = createTask({
      title: 'Implement core service',
      description: 'Add CRUD operations',
      status: 'in-progress',
      priority: 'medium'
    });
    console.log('Created task 2:', second);

    console.log('All tasks:', getAllTasks());
    console.log('Read one task by id:', getTaskById(first.id));

    const updated = updateTask(second.id, {
      status: 'done',
      priority: 'high'
    });
    console.log('Updated task 2:', updated);

    console.log('Filter by status=done:', filterTasks({ status: 'done' }));
    console.log('Filter by priority=high:', filterTasks({ priority: 'high' }));

    console.log('Sorted by createdAt:', sortTasks('createdAt'));
    console.log('Sorted by priority:', sortTasks('priority'));

    const removed = deleteTask(first.id);
    console.log('Deleted task 1:', removed);
    console.log('Remaining tasks:', getAllTasks());

    try {
      getTaskById(first.id);
    } catch (error) {
      console.error('Expected error after delete:', error.message);
    }

    console.log('Task Manager demo completed successfully.');
  } catch (error) {
    console.error('Task Manager demo failed:', error.message);
    process.exitCode = 1;
  }
}

main();
