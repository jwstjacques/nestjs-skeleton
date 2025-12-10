module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/**/*.mock.ts",
    "!src/**/index.ts",
    "!src/database/prisma.service.ts",
  ],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  roots: ["<rootDir>/test/"],
  testMatch: ["<rootDir>/test/unit/**/*.spec.ts"],
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
