# Debugging Guide

This guide covers how to use VS Code's debugger with breakpoints to debug the NestJS application and tests.

## Prerequisites

- VS Code with the project open
- Docker containers running (for database access): `./scripts/docker-start.sh`
- The Docker app container stopped (to free port 3000): `docker stop nestjs-task-app`

## Available Debug Configurations

The project includes pre-configured debug configurations in `.vscode/launch.json`:

| Configuration           | Description                             |
| ----------------------- | --------------------------------------- |
| Debug NestJS            | Debug the running application           |
| Debug Jest Tests        | Debug all unit tests                    |
| Debug Current Test File | Debug the currently open unit test file |
| Debug E2E Tests         | Debug all E2E tests                     |
| Debug Current E2E File  | Debug the currently open E2E test file  |

---

## Debugging the Application

Use this when you want to set breakpoints in your service, controller, or other source files and trigger them via HTTP requests.

### Steps

1. **Set a breakpoint** in your source file (e.g., `src/modules/tasks/tasks.service.ts`)
   - Click in the gutter (left margin) next to a line number
   - A red dot appears indicating the breakpoint

2. **Start the debugger**
   - Press `F5` or open Run and Debug sidebar (`Cmd+Shift+D`)
   - Select **"Debug NestJS"** from the dropdown
   - Click the green play button

3. **Trigger your breakpoint**
   - Make an HTTP request to the endpoint (via Postman, curl, or browser)
   - Example: `GET http://localhost:3000/api/v1/tasks`
   - The debugger will pause at your breakpoint

4. **Inspect and navigate**
   - Hover over variables to see their values
   - Use the Variables panel to explore objects
   - Use debug controls to step through code

### Debug Controls

| Action    | Shortcut        | Description            |
| --------- | --------------- | ---------------------- |
| Continue  | `F5`            | Run to next breakpoint |
| Step Over | `F10`           | Execute current line   |
| Step Into | `F11`           | Enter function call    |
| Step Out  | `Shift+F11`     | Exit current function  |
| Restart   | `Ctrl+Shift+F5` | Restart debug session  |
| Stop      | `Shift+F5`      | Stop debugging         |

---

## Debugging Unit Tests

Use this to debug tests and the code they exercise.

### Debug All Unit Tests

1. Press `F5` and select **"Debug Jest Tests"**
2. Tests run with debugger attached
3. Execution pauses at any breakpoints in tests or source files

### Debug a Single Test File

1. **Open** the test file you want to debug (e.g., `test/unit/tasks/tasks.service.spec.ts`)
2. **Set breakpoints** in the test file or the source file being tested
3. Press `F5` and select **"Debug Current Test File"**
4. Only that file's tests run

### Debug a Specific Test

To debug only one `it()` block:

1. Change `it()` to `it.only()` in the test file
2. Run the debugger as above
3. Only that test executes
4. Remember to remove `.only` when done

---

## Debugging E2E Tests

E2E tests require the database to be running.

### Setup

```bash
# Start Postgres and Redis containers
./scripts/docker-start.sh

# Stop the app container (frees port 3000)
docker stop nestjs-task-app
```

### Debug All E2E Tests

1. Press `F5` and select **"Debug E2E Tests"**
2. All E2E tests run with debugger attached

### Debug a Single E2E Test File

1. **Open** the E2E test file (e.g., `test/e2e/tasks/tasks.e2e-spec.ts`)
2. **Set breakpoints** in the test or source files
3. Press `F5` and select **"Debug Current E2E File"**

---

## Troubleshooting

### Port 3000 already in use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process is using port 3000.

**Solutions:**

1. Stop the Docker app container:

   ```bash
   docker stop nestjs-task-app
   ```

2. Or kill the process using the port:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

---

### Port 5432 already in use

**Error:**

```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Cause:** PostgreSQL or another container is using port 5432.

**Solutions:**

1. Stop any existing PostgreSQL process:

   ```bash
   lsof -ti:5432 | xargs kill -9
   ```

2. Or restart Docker containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

### Debugger doesn't stop at breakpoints

**Possible causes and fixes:**

1. **Source maps not enabled**
   - Ensure `tsconfig.json` has `"sourceMap": true`
   - Rebuild the project: `npm run build`

2. **Breakpoint in compiled code path**
   - Ensure you're setting breakpoints in `.ts` files, not `.js` files

3. **Tests running in parallel**
   - The debug configurations use `--runInBand` to run tests sequentially
   - If you're running tests differently, add this flag

4. **Code hasn't been reached**
   - Verify the code path is actually being executed
   - Add a `console.log` to confirm

---

### Database connection errors during debugging

**Error:**

```
Can't reach database server at localhost:5432
```

**Solution:**

Ensure Docker containers are running:

```bash
docker-compose ps

# If not running:
./scripts/docker-start.sh
```

---

### init-db.sh mount error

**Error:**

```
Error: mount src=./scripts/init-db.sh: not a directory
```

**Cause:** The `init-db.sh` file doesn't exist or is a directory.

**Solution:**

The file should exist at `scripts/init-db.sh`. If missing, create it:

```bash
cat > scripts/init-db.sh << 'EOF'
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'Database ready' as status;
EOSQL

echo "Database initialization complete"
EOF

chmod +x scripts/init-db.sh
```

---

### Debugger disconnects immediately

**Possible causes:**

1. **Application crashed on startup**
   - Check the terminal output for errors
   - Common: missing environment variables, database connection issues

2. **Build errors**
   - Run `npm run build` and fix any TypeScript errors

---

### Variables show as "undefined" in debugger

**Cause:** Variable hasn't been assigned yet at the current execution point.

**Solution:**

- Step forward (`F10`) to let the assignment execute
- Check that you're paused after the variable is assigned

---

## Tips for Effective Debugging

### Conditional Breakpoints

Right-click on a breakpoint and select "Edit Breakpoint" to add a condition:

- Only pause when `userId === 'specific-id'`
- Only pause when `items.length > 10`

### Logpoints

Instead of adding `console.log` to code:

1. Right-click in the gutter
2. Select "Add Logpoint"
3. Enter a message with expressions: `User: {user.email}`
4. The message prints to debug console without pausing

### Watch Expressions

Add expressions to the Watch panel to monitor values:

- `user.email`
- `tasks.length`
- `query.status === 'TODO'`

### Debug Console

While paused, use the Debug Console to:

- Evaluate expressions
- Call functions
- Inspect complex objects

---

## See Also

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup
- [TESTING.md](./TESTING.md) - Testing guide
- [DOCKER.md](./DOCKER.md) - Docker configuration
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General troubleshooting
