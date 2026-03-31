# Task Manager CLI — Project Plan

## Project Overview

Task Manager CLI is a Node.js command-line application that allows users to create, read, update, and delete tasks entirely in memory. It supports filtering tasks by status or priority and sorting by creation date or priority level. Built with Node.js 20+ and no external dependencies, it demonstrates core JavaScript patterns suitable for a workshop exercise.

---

## User Stories

1. **Create a task**
   - As a user, I can add a new task by providing a title, optional description, status, and priority.
   - **Acceptance criteria:**
     - Task is assigned a UUID via `crypto.randomUUID()`.
     - `createdAt` and `updatedAt` are set to the current ISO 8601 timestamp.
     - Default `status` is `todo`; default `priority` is `medium`.
     - An error is shown if `title` is missing or empty.

2. **List all tasks**
   - As a user, I can view all tasks in a formatted table.
   - **Acceptance criteria:**
     - Output includes `id`, `title`, `status`, `priority`, and `createdAt`.
     - When no tasks exist, a friendly "No tasks found." message is shown.

3. **Filter tasks**
   - As a user, I can filter the task list by `status` or `priority`.
   - **Acceptance criteria:**
     - `--status <value>` filters to tasks matching `todo`, `in-progress`, or `done`.
     - `--priority <value>` filters to tasks matching `low`, `medium`, or `high`.
     - Invalid filter values produce an error message.

4. **Sort tasks**
   - As a user, I can sort the task list by creation date or priority.
   - **Acceptance criteria:**
     - `--sort createdAt` sorts ascending by creation date.
     - `--sort priority` sorts by priority (`high` > `medium` > `low`).

5. **Update a task**
   - As a user, I can update the title, description, status, or priority of an existing task by ID.
   - **Acceptance criteria:**
     - `updatedAt` is refreshed to the current timestamp on every update.
     - An error is shown if the task ID does not exist.
     - At least one field must be provided to update.

6. **Delete a task**
   - As a user, I can remove a task by its ID.
   - **Acceptance criteria:**
     - A confirmation message is shown after successful deletion.
     - An error is shown if the task ID does not exist.

---

## Data Model

### Task

| Property      | Type     | Required | Details                                      |
|---------------|----------|----------|----------------------------------------------|
| `id`          | `string` | Yes      | Generated with `crypto.randomUUID()`         |
| `title`       | `string` | Yes      | Non-empty string                             |
| `description` | `string` | No       | Defaults to `""`                             |
| `status`      | `string` | Yes      | One of `todo`, `in-progress`, `done`         |
| `priority`    | `string` | Yes      | One of `low`, `medium`, `high`               |
| `createdAt`   | `string` | Yes      | ISO 8601 timestamp set at creation           |
| `updatedAt`   | `string` | Yes      | ISO 8601 timestamp updated on every change   |

---

## File Structure

```
src/
  index.js        # Entry point: parses process.argv and dispatches commands
  tasks.js        # In-memory store and CRUD operations (create, read, update, delete)
  filter.js       # Filter and sort utilities
  display.js      # Formats task output as a table or list
  validate.js     # Input validation helpers (status values, priority values, etc.)
docs/
  project-plan.md # This file
```

---

## Implementation Phases

### Phase 1 — Data model and store (`src/tasks.js`)
- Define the in-memory tasks array.
- Implement `createTask`, `getTask`, `getAllTasks`, `updateTask`, `deleteTask`.
- Use `crypto.randomUUID()` for IDs and `new Date().toISOString()` for timestamps.

### Phase 2 — Input validation (`src/validate.js`)
- Validate `status` and `priority` values against allowed enums.
- Validate required fields (`title` must be a non-empty string).

### Phase 3 — Filter and sort (`src/filter.js`)
- Implement `filterByStatus(tasks, status)`.
- Implement `filterByPriority(tasks, priority)`.
- Implement `sortTasks(tasks, field)` supporting `createdAt` and `priority`.

### Phase 4 — Display (`src/display.js`)
- Format task list as a plain-text table using fixed-width columns.
- Print single task detail view.
- Print error and success messages consistently.

### Phase 5 — CLI entry point (`src/index.js`)
- Parse `process.argv` for commands: `add`, `list`, `update`, `delete`.
- Accept flags: `--status`, `--priority`, `--sort`, `--title`, `--description`, `--id`.
- Wire commands to store functions and pass output through display helpers.

---

## Error Handling Conventions

- **User errors** (invalid input, missing required fields, unknown IDs) are printed to `stderr` with a human-readable message prefixed by `Error:`. The process exits with code `1`.
- **Unexpected errors** (programming errors, assertion failures) are allowed to propagate and produce a stack trace. Do not catch them silently.
- No `try/catch` around in-memory operations — these cannot throw unless there is a bug.
- All error messages use consistent formatting: `Error: <reason>. Use --help for usage.`
- Success messages are printed to `stdout` and the process exits with code `0`.

### Exit codes

| Code | Meaning |
|------|---------|
| `0`  | Success |
| `1`  | User or validation error |
| `2`  | Unrecoverable internal error (reserved) |

---

## Input Validation Rules

All validation lives in `src/validate.js` and is called before any store operation.

| Field | Rule |
|-------|------|
| `title` | Required. Must be a non-empty string after trimming whitespace. |
| `description` | Optional. If provided, must be a string. |
| `status` | Must be one of `todo`, `in-progress`, `done`. Case-sensitive. |
| `priority` | Must be one of `low`, `medium`, `high`. Case-sensitive. |
| `id` | Required for update/delete. Must be a non-empty string. A not-found ID is a user error, not a validation error. |
| `--sort` flag | Must be one of `createdAt`, `priority`. Any other value is a user error. |

### Validation helper contract

```js
// Returns null on success, or an error message string on failure.
function validate(field, value) { ... }
```

Callers check the return value and call `printError` + `process.exit(1)` if it is non-null. Validators never throw.
