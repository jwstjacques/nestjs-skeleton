// @ts-nocheck
module.exports = {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    // Run type check (optional, can be slow)
    // () => 'tsc --noEmit',
  ],
  "*.spec.ts": [
    // ESLint will catch .only, console.log, etc. in test files
    "eslint --fix",
    "prettier --write",
    // Optional: Run related tests (uncomment if you want tests to run on commit)
    // "jest --findRelatedTests --passWithNoTests",
  ],
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.prisma": ["prisma-lint"],
};
