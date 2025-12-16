# Customization Guide

This guide helps you customize the NestJS API Skeleton for your specific needs.

## Table of Contents

1. [Keeping the Tasks Module](#keeping-the-tasks-module)
2. [Removing the Tasks Module](#removing-the-tasks-module)
3. [Creating Your Own Modules](#creating-your-own-modules)
4. [Key Patterns to Follow](#key-patterns-to-follow)
5. [Database Customization](#database-customization)
6. [Configuration](#configuration)

---

## Keeping the Tasks Module

If you're building a task management system, you can keep the Tasks module as-is:

1. It's fully functional out of the box
2. Includes all CRUD operations with pagination, filtering, and sorting
3. Has comprehensive tests (>95% coverage)
4. Ready for production use

**Just rename it** if "tasks" doesn't fit your domain (e.g., "items", "records", "documents").

---

## Removing the Tasks Module

To completely remove the example Tasks module:

### Step 1: Delete Module Files

```bash
# Remove module source code
rm -rf src/modules/tasks

# Remove unit tests
rm -rf test/unit/tasks

# Remove E2E tests
rm -rf test/e2e/tasks
```

### Step 2: Remove from App Module

Edit `src/app.module.ts`:

```typescript
// REMOVE this import:
import { TasksModule } from "./modules/tasks/tasks.module";

// REMOVE TasksModule from imports array:
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        cacheConfig,
        securityConfig,
        observabilityConfig,
        throttleConfig,
        paginationConfig,
        swaggerConfig,
      ],
    }),
    AppConfigModule,
    PrismaModule,
    CacheConfigModule,
    AuthModule,
    UsersModule,
    TasksModule,  // ← DELETE this line
    HealthModule,
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [throttleConfig.KEY],
      useFactory: createThrottlerOptions,
    }),
  ],
})
```

### Step 3: Update Database Schema

Edit `prisma/schema.prisma`:

```prisma
// REMOVE the Task model:
model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([userId])
  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@map("tasks")
}

// REMOVE TaskStatus enum:
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  CANCELLED
}

// REMOVE TaskPriority enum:
enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

Also update the User model to remove the tasks relation:

```prisma
model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  username           String    @unique
  password           String
  role               UserRole  @default(USER)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  refreshTokens      RefreshToken[]
  tasks              Task[]  // ← DELETE this line

  @@index([email])
  @@index([username])
  @@map("users")
}
```

### Step 4: Run Database Migration

```bash
# Create migration to remove Task table
npm run prisma:migrate:dev -- --name remove-tasks-module

# OR reset database entirely (development only!)
npm run prisma:reset
```

### Step 5: Update Postman Collection

Edit `postman/api-collection.json` or delete task-related requests from the Postman UI.

Alternatively, you can keep the collection as an example of how to structure Postman tests.

### Step 6: Update Documentation

Remove or archive task-specific documentation:

```bash
# Optional: Move to examples folder (already created)
# Task examples are already in docs/examples/
```

### Step 7: Update Tests (Optional)

If you removed all domain modules and only have auth/users left, you may need to adjust test coverage thresholds:

Edit `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 95,  // Adjust from 99% if needed
    branches: 90,
    functions: 95,
    lines: 95,
  },
},
```

### Step 8: Verify

```bash
# Lint should pass
npm run lint

# Build should succeed
npm run build

# Tests should pass (may have fewer tests now)
npm test

# App should start
npm run start:dev
```

---

## Creating Your Own Modules

Use the Tasks module structure as a template for your own modules.

### Method 1: Generate New Module

```bash
# Generate module with NestJS CLI
nest g resource products --no-spec

# This creates:
# src/modules/products/
#   ├── products.module.ts
#   ├── products.controller.ts
#   ├── products.service.ts
#   └── dto/
```

### Method 2: Copy Tasks Module Structure

```bash
# Copy the tasks module as a starting point
cp -r src/modules/tasks src/modules/products

# Then:
# 1. Rename files and classes
# 2. Update imports
# 3. Modify to fit your domain
```

### Recommended Module Structure

```
src/modules/your-module/
├── constants/
│   └── your-module.constants.ts      # Module-specific constants
├── decorators/
│   └── your-decorator.ts             # Module-specific decorators
├── dto/
│   ├── create-your-entity.dto.ts
│   ├── update-your-entity.dto.ts
│   └── query-your-entity.dto.ts
├── entities/
│   └── your-entity.entity.ts         # Prisma model wrapper
├── exceptions/
│   └── your-module.exceptions.ts     # Custom exceptions
├── your-module.controller.ts
├── your-module.service.ts
├── your-module.dal.ts                # Data Access Layer
└── your-module.module.ts
```

### Implementation Checklist

When creating a new module, follow these steps:

- [ ] Create Prisma model in `schema.prisma`
- [ ] Generate Prisma client: `npm run prisma:generate`
- [ ] Create migration: `npm run prisma:migrate:dev`
- [ ] Create DTOs with validation decorators
- [ ] Implement DAL layer for database operations
- [ ] Implement service with business logic
- [ ] Implement controller with route handlers
- [ ] Add Swagger decorators for documentation
- [ ] Write unit tests (aim for >95% coverage)
- [ ] Write E2E tests for critical paths
- [ ] Update module imports in `app.module.ts`
- [ ] Add to Postman collection for testing

---

## Key Patterns to Follow

### 1. Module-Specific Constants

**DON'T** scatter magic numbers/strings in code:

```typescript
// ❌ Bad: Magic numbers
if (tasks.length > 100) { ... }
if (title.length > 50) { ... }
```

**DO** use constants files:

```typescript
// ✅ Good: constants/your-module.constants.ts
export const YOUR_MODULE_CONSTANTS = {
  MAX_ITEMS: 100,
  MAX_TITLE_LENGTH: 50,
  DEFAULT_PAGE_SIZE: 10,
  CACHE_TTL: 3600,
} as const;

// Usage in your module:
import { YOUR_MODULE_CONSTANTS } from './constants/your-module.constants';

if (tasks.length > YOUR_MODULE_CONSTANTS.MAX_ITEMS) { ... }
```

### 2. Custom Exceptions

**DON'T** throw generic errors:

```typescript
// ❌ Bad: Generic errors with no context
throw new Error("Item not found");
throw new HttpException("Invalid data", HttpStatus.BAD_REQUEST);
```

**DO** create module-specific exceptions:

```typescript
// ✅ Good: exceptions/your-module.exceptions.ts
import { ApplicationException } from "@app/common/exceptions/application.exception";
import { HttpStatus } from "@nestjs/common";

export class YourEntityNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(`Your entity with ID ${id} not found`, HttpStatus.NOT_FOUND, "YOUR_ENTITY_NOT_FOUND");
  }
}

export class YourEntityValidationException extends ApplicationException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, "YOUR_ENTITY_VALIDATION_ERROR");
  }
}

// Usage:
throw new YourEntityNotFoundException(id);
```

### 3. Data Access Layer (DAL)

**DON'T** put Prisma calls directly in services:

```typescript
// ❌ Bad: Database logic in service
@Injectable()
export class YourModuleService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.item.findUnique({ where: { id } });
  }
}
```

**DO** use a separate DAL layer:

```typescript
// ✅ Good: your-module.dal.ts
@Injectable()
export class YourModuleDal {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.yourEntity.findUnique({ where: { id } });
  }

  async findAll(options: FindOptions) {
    return this.prisma.yourEntity.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy,
    });
  }

  async create(data: CreateData) {
    return this.prisma.yourEntity.create({ data });
  }
}

// ✅ Service uses DAL
@Injectable()
export class YourModuleService {
  constructor(private dal: YourModuleDal) {}

  async findOne(id: string) {
    const entity = await this.dal.findById(id);
    if (!entity) throw new YourEntityNotFoundException(id);
    return entity;
  }
}
```

**Benefits**:

- Separation of concerns
- Easier to test (mock DAL instead of Prisma)
- Centralized database queries
- Easier to optimize queries

### 4. DTO Validation

**Always** use class-validator decorators:

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Length,
  IsDateString,
  IsInt,
  Min,
  Max,
} from "class-validator";

export class CreateYourEntityDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsEnum(YourEnum)
  @IsOptional()
  status?: YourEnum;

  @IsDateString()
  @IsOptional()
  @IsFutureDate({ message: "Date must be in the future" })
  scheduledDate?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  priority?: number;
}
```

### 5. Swagger Documentation

**Add decorators** to all endpoints:

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("your-module")
@ApiBearerAuth()
@Controller("your-module")
export class YourModuleController {
  constructor(private readonly service: YourModuleService) {}

  @Post()
  @ApiOperation({ summary: "Create new entity" })
  @ApiResponse({
    status: 201,
    description: "Entity created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Validation failed",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async create(@Body() dto: CreateYourEntityDto) {
    return this.service.create(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get entity by ID" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiResponse({
    status: 200,
    description: "Entity found",
  })
  @ApiResponse({
    status: 404,
    description: "Entity not found",
  })
  async findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
}
```

### 6. Comprehensive Testing

#### Unit Tests (>95% coverage)

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { YourModuleService } from "./your-module.service";
import { YourModuleDal } from "./your-module.dal";
import { createMock } from "@golevelup/ts-jest";

describe("YourModuleService", () => {
  let service: YourModuleService;
  let dal: YourModuleDal;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourModuleService,
        {
          provide: YourModuleDal,
          useValue: createMock<YourModuleDal>(),
        },
      ],
    }).compile();

    service = module.get<YourModuleService>(YourModuleService);
    dal = module.get<YourModuleDal>(YourModuleDal);
  });

  describe("findOne", () => {
    it("should return entity when found", async () => {
      const entity = { id: "1", name: "Test" };
      jest.spyOn(dal, "findById").mockResolvedValue(entity);

      const result = await service.findOne("1");

      expect(result).toEqual(entity);
      expect(dal.findById).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException when entity not found", async () => {
      jest.spyOn(dal, "findById").mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(YourEntityNotFoundException);
    });
  });

  describe("create", () => {
    it("should create entity successfully", async () => {
      const dto = { title: "Test" };
      const created = { id: "1", ...dto };
      jest.spyOn(dal, "create").mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(dal.create).toHaveBeenCalledWith(dto);
    });
  });
});
```

#### E2E Tests for Critical Paths

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/database/prisma.service";

describe("YourModule (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password" });

    accessToken = loginResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /your-module", () => {
    it("should create entity", () => {
      return request(app.getHttpServer())
        .post("/your-module")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Test Entity" })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty("id");
          expect(res.body.data.title).toBe("Test Entity");
        });
    });

    it("should fail with invalid data", () => {
      return request(app.getHttpServer())
        .post("/your-module")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "" }) // Invalid: empty title
        .expect(400);
    });
  });

  describe("GET /your-module/:id", () => {
    it("should return entity by id", async () => {
      // Create entity first
      const created = await request(app.getHttpServer())
        .post("/your-module")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Test" });

      const id = created.body.data.id;

      return request(app.getHttpServer())
        .get(`/your-module/${id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(id);
          expect(res.body.data.title).toBe("Test");
        });
    });

    it("should return 404 for non-existent entity", () => {
      return request(app.getHttpServer())
        .get("/your-module/non-existent-id")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
```

---

## Database Customization

### Adding New Tables

1. **Update Prisma Schema** in `prisma/schema.prisma`:

```prisma
model YourEntity {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([isActive])
  @@map("your_entities")
}
```

2. **Update User Model** if there's a relationship:

```prisma
model User {
  // ... existing fields
  yourEntities  YourEntity[]
}
```

3. **Create Migration**:

```bash
npm run prisma:migrate:dev -- --name add-your-entity
```

4. **Generate Client**:

```bash
npm run prisma:generate
```

### Modifying Existing Tables

```bash
# 1. Edit schema.prisma
# 2. Create migration
npm run prisma:migrate:dev -- --name update-your-entity

# 3. Update affected services and tests
```

### Seeding Data

Edit `prisma/seed.ts` to add your seed data:

```typescript
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Created user:", user.email);

  // Seed your entities
  await prisma.yourEntity.createMany({
    data: [
      {
        name: "Entity 1",
        description: "First entity",
        userId: user.id,
      },
      {
        name: "Entity 2",
        description: "Second entity",
        userId: user.id,
      },
    ],
  });

  console.log("✓ Created sample entities");
  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seeding:

```bash
npm run prisma:seed
```

---

## Configuration

### Adding New Environment Variables

When you need module-specific configuration:

1. **Add to `.env.example`**:

```env
# Your Module Configuration
YOUR_MODULE_ENABLED=true
YOUR_MODULE_MAX_SIZE=1000
YOUR_MODULE_CACHE_TTL=3600
```

2. **Create Config Schema** in `src/config/schemas/`:

```typescript
// src/config/schemas/your-module.schema.ts
import { z } from "zod";

export const yourModuleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  maxSize: z.number().int().positive().default(1000),
  cacheTtl: z.number().int().positive().default(3600),
});

export type YourModuleConfig = z.infer<typeof yourModuleConfigSchema>;
```

3. **Create Config Provider** in `src/config/providers/`:

```typescript
// src/config/providers/your-module.config.ts
import { registerAs } from "@nestjs/config";
import { yourModuleConfigSchema } from "../schemas/your-module.schema";

export default registerAs("yourModule", () => {
  return yourModuleConfigSchema.parse({
    enabled: process.env.YOUR_MODULE_ENABLED === "true",
    maxSize: parseInt(process.env.YOUR_MODULE_MAX_SIZE || "1000", 10),
    cacheTtl: parseInt(process.env.YOUR_MODULE_CACHE_TTL || "3600", 10),
  });
});
```

4. **Register in AppConfigModule**:

```typescript
// src/config/app-config.module.ts
import yourModuleConfig from "./providers/your-module.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig,
        databaseConfig,
        cacheConfig,
        securityConfig,
        observabilityConfig,
        throttleConfig,
        paginationConfig,
        swaggerConfig,
        yourModuleConfig, // ← Add here
      ],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
```

5. **Use in Your Module**:

```typescript
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import yourModuleConfig from "@app/config/providers/your-module.config";

@Injectable()
export class YourModuleService {
  constructor(
    @Inject(yourModuleConfig.KEY)
    private config: ConfigType<typeof yourModuleConfig>,
  ) {}

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getMaxSize(): number {
    return this.config.maxSize;
  }

  getCacheTtl(): number {
    return this.config.cacheTtl;
  }
}
```

---

## Next Steps

After customizing the skeleton:

1. **Update Documentation**
   - Update README with your project name
   - Document your custom modules in `docs/`
   - Update API examples with your endpoints

2. **Configure CI/CD**
   - Update GitHub Actions workflows if needed
   - Configure deployment pipelines
   - Set up environment variables in CI

3. **Deploy**
   - Set up production database
   - Configure Redis instance
   - Deploy to your hosting platform
   - Set up SSL/TLS certificates

4. **Monitor**
   - Set up error tracking (Sentry, etc.)
   - Configure logging aggregation
   - Set up health check monitoring
   - Configure alerts

---

## Getting Help

- Review the Tasks module for reference implementation
- Check the comprehensive test suite for examples
- See other documentation files in `/docs` folder
- Open an issue on GitHub for questions

---

**Happy Building! 🚀**
