# Code Style Guide

## Overview

This project uses ESLint and Prettier to enforce consistent code style.

## Rules

### TypeScript

- **No `any` type**: Always use proper types
- **Double quotes**: Use double quotes for strings
- **Semicolons**: Always use semicolons
- **Trailing commas**: Use trailing commas in multi-line structures
- **Arrow functions**: Use arrow functions for callbacks

### Formatting

- **Line length**: Maximum 100 characters
- **Indentation**: 2 spaces
- **Line endings**: LF (Unix-style)
- **Final newline**: Always end files with a newline

### Spacing

- **Whitespace before return**: Always add blank line before return
- **Whitespace between blocks**: Always add blank line between code blocks
- **No trailing spaces**: Remove trailing whitespace

### Naming Conventions

- **Classes**: PascalCase (e.g., `UserService`)
- **Interfaces**: PascalCase with "I" prefix (e.g., `IUser`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Files**: kebab-case (e.g., `user-service.ts`)

## Examples

### Good ✅

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }
}
```

### Bad ❌

```typescript
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../database/prisma.service"
@Injectable()
export class UserService {
constructor(private readonly prisma: PrismaService) {}
async findById(id: string): Promise`<any>` {
const user = await this.prisma.user.findUnique({ where: { id } })
return user
}
}
```

## Git Hooks

### Pre-commit

- Runs lint-staged
- Formats staged files
- Fixes ESLint issues

### Commit-msg

- Validates commit message format
- Enforces conventional commits

### Pre-push

- Runs all tests
- Ensures code quality before push

## Commit Messages

Follow conventional commits format:

```
`<type>`(`<scope>`): `<subject>`

<body>

<footer>
```

### Types

- \`feat\`: New feature
- \`fix\`: Bug fix
- \`docs\`: Documentation changes
- \`style\`: Code style changes
- \`refactor\`: Code refactoring
- \`perf\`: Performance improvements
- \`test\`: Test changes
- \`build\`: Build system changes
- \`ci\`: CI/CD changes
- \`chore\`: Other changes

### Examples

```bash
feat(auth): add JWT authentication
fix(tasks): resolve date parsing issue
docs(readme): update installation steps
test(users): add unit tests for user service
```

## IDE Setup

### VS Code

1. Install extensions:
   - ESLint
   - Prettier
   - Prisma

2. Settings are configured in \`.vscode/settings.json\`
3. Format on save is enabled

### Other IDEs

Configure your IDE to:

- Use EditorConfig settings
- Format with Prettier
- Lint with ESLint
