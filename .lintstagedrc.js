// @ts-nocheck
module.exports = {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    // Run type check (optional, can be slow)
    // () => 'tsc --noEmit',
  ],
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.prisma": ["prisma-lint"],
};
