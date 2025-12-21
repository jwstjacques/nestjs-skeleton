# Pre-Commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks, [lint-staged](https://github.com/okonet/lint-staged) to run checks on staged files, and [eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest) for test quality enforcement.

## What Gets Checked

When you run `git commit`, the following checks are automatically executed:

### For All TypeScript Files (`*.ts`, `*.tsx`)

- **ESLint** - Automatically fixes code issues
- **Prettier** - Formats code according to style rules

### For Test Files (`*.spec.ts`, `*.e2e-spec.ts`)

We use **eslint-plugin-jest** to enforce test quality standards. This provides both **real-time IDE feedback** and **pre-commit validation**.

#### ❌ Errors (Will Block Commit)

1. **Console Statements** (`no-console`)
   - `console.log()`
   - `console.debug()`
   - `console.info()`
   - `console.warn()`
   - `console.error()`
   - **Exception:** Use `// eslint-disable-next-line no-console -- reason` for legitimate mocking

2. **Focused Tests** (`jest/no-focused-tests`)
   - `describe.only()`
   - `it.only()`
   - `test.only()`
   - `fdescribe()`
   - `fit()`

3. **Duplicate Test Names** (`jest/no-identical-title`)
   - Prevents tests with the same name in a describe block

4. **Invalid Expect Usage** (`jest/valid-expect`)
   - Ensures `expect()` is used correctly

#### ⚠️ Warnings (Will Show Warning)

1. **Skipped Tests** (`jest/no-disabled-tests`)
   - `describe.skip()`, `it.skip()`, `test.skip()`
   - `xdescribe()`, `xit()`

2. **Commented Out Tests** (`jest/no-commented-out-tests`)

3. **Missing Assertions** (`jest/expect-expect`)
   - Warns if a test has no `expect()` statements

### For JavaScript Files (`*.js`, `*.jsx`)

- **ESLint** - Automatically fixes code issues
- **Prettier** - Formats code

### For JSON, Markdown, YAML Files

- **Prettier** - Formats files

### For Prisma Schema Files (`*.prisma`)

- **Prisma Lint** - Validates schema syntax

## Why These Checks?

### Console Statements

Console statements are useful during development for debugging, but should not be committed because:

- They clutter the production logs
- They expose internal application details
- They're temporary debugging tools, not production code
- They make the codebase look unprofessional

**During Development:**

```typescript
// ✅ OK - Use this while debugging locally
console.log("User data:", user);
```

**Before Committing:**

```typescript
// ✅ Use proper logging instead
logger.debug("User data:", user);

// ✅ Or remove the debug statement entirely
```

### Focused Tests (`.only`)

Focused tests (`.only`, `fdescribe`, `fit`) are useful when working on specific tests, but should not be committed because:

- They skip all other tests in CI/CD
- They can hide failing tests
- They break the test suite for other developers
- CI pipelines might not catch issues

**During Development:**

```typescript
// ✅ OK - Use this while working on a specific test
it.only("should create a user", async () => {
  // ... your test
});
```

**Before Committing:**

```typescript
// ✅ Remove .only before committing
it("should create a user", async () => {
  // ... your test
});
```

## Manual Check

## Manual Testing

You can manually run ESLint on test files:

```bash
# Check all test files
npx eslint "test/**/*.spec.ts"

# Check and auto-fix
npx eslint "test/**/*.spec.ts" --fix

# Run all linters
npm run lint
```

## Bypassing the Hook (Not Recommended)

If you absolutely need to bypass the pre-commit hook (emergency situations only):

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** Only use `--no-verify` in emergencies. These checks exist to maintain code quality.

## What Happens on Failure

If the hook detects violations, you'll see output like this:

```
🔍 Checking test files for violations...
Checking files:
  - test/e2e/tasks/tasks.e2e-spec.ts

Checking for console.log statements...
✗ Found console statements in test/e2e/tasks/tasks.e2e-spec.ts:
    76:      console.log("======================================");
    77:      console.log(response.headers);

Checking for .only in tests...
✗ Found .only in test/e2e/tasks/tasks.e2e-spec.ts:
    70:    it.only("should fail validation with invalid priority", async () => {

❌ Pre-commit check failed!

Found violations in test files:
  • Remove console.log/debug/info/warn/error statements
  • Remove .only from describe/it/test
  • Remove fdescribe and fit (focused tests)

These should only be used during development, not committed to the repository.
```

**To fix:**

1. Open the file(s) mentioned in the error
2. Remove or comment out the console statements
3. Remove `.only` from tests
4. Stage the changes: `git add <file>`
5. Try committing again: `git commit`

## Troubleshooting

### Hook doesn't run

If the pre-commit hook isn't running:

1. **Reinstall Husky:**

   ```bash
   npm run prepare
   ```

2. **Check hook permissions:**

   ```bash
   chmod +x .husky/pre-commit
   ```

3. **Verify Husky is installed:**

   ```bash
   ls -la .husky/
   ```

4. **Verify ESLint plugin is installed:**

   ```bash
   npm list eslint-plugin-jest
   ```

### False positives

If you have a legitimate use case for console statements in tests (e.g., mocking console for testing), add an ESLint disable comment:

```typescript
// eslint-disable-next-line no-console -- Mocking console for testing
console.warn = jest.fn();
```

For legitimate focused tests during development, remove `.only` before committing or add a comment explaining why it's needed.

## CI/CD Integration

These same ESLint checks run in the CI/CD pipeline, so even if you bypass the hook locally, the CI will catch violations.

## Related Files

- `.husky/pre-commit` - Pre-commit hook configuration
- `.lintstagedrc.js` - Lint-staged configuration (uses ESLint)
- `eslint.config.mjs` - ESLint configuration with Jest plugin rules
- `package.json` - Contains all the scripts

## See Also

- [Development Guide](./DEVELOPMENT.md)
- [Testing Guide](./TESTING-GUIDE.md)
- [Code Style Guide](./CODE_STYLE.md)
