// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import jestPlugin from "eslint-plugin-jest";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "eslint.config.mjs",
      "commitlint.config.js",
      ".lintstagedrc.js",
      "jest.config.js",
      "prisma.config.ts",
      "dist",
      "node_modules",
      "coverage",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",

      // Code style rules
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: "directive", next: "*" },
        { blankLine: "any", prev: "directive", next: "directive" },
        { blankLine: "always", prev: ["case", "default"], next: "*" },
      ],

      // Prettier integration
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
          trailingComma: "all",
          semi: true,
          tabWidth: 2,
          printWidth: 100,
          arrowParens: "always",
          endOfLine: "auto",
        },
      ],
    },
  },
  // Jest-specific rules for test files
  {
    files: ["**/*.spec.ts", "**/*.e2e-spec.ts", "test/**/*.ts"],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // Prevent focused tests from being committed
      "jest/no-focused-tests": "error", // Prevents .only, fdescribe, fit

      // Warn about disabled tests (can be useful to track)
      "jest/no-disabled-tests": "warn", // Warns about .skip, xdescribe, xit

      // Warn about commented out tests
      "jest/no-commented-out-tests": "warn",

      // Prevent console statements in test files (but allow in setup/utilities)
      "no-console": "error",

      // Best practices for tests
      "jest/expect-expect": [
        "warn",
        {
          // Recognize custom assertion helpers
          assertFunctionNames: [
            "expect",
            // TestAssertions helpers
            "TestAssertions.assert*",
            "Assertions.assert*",
            // Imported assertion aliases
            "assert*",
            // Template helpers that contain assertions
            "*.testCreate",
            "*.testRead",
            "*.testUpdate",
            "*.testDelete",
            "*.testList",
            "*.testPagination",
            "*.testValidation*",
            "*.testAuth*",
          ],
        },
      ],
      "jest/no-identical-title": "error", // Prevent duplicate test names
      "jest/valid-expect": "error", // Ensure expect is used correctly

      // Allow any types in tests (less strict than production code)
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
    },
  },
  // Allow console.log in test utilities and setup files
  {
    files: ["test/global-setup.ts", "test/setup.ts", "test/**/e2e-app.helper.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
