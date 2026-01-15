# Documentation

This folder contains comprehensive documentation for the NestJS API Skeleton project.

## Quick Start

| Document                                 | Description                             |
| ---------------------------------------- | --------------------------------------- |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Step-by-step tutorial for new users     |
| [DEVELOPMENT.md](DEVELOPMENT.md)         | Getting started with local development  |
| [CONFIGURATION.md](CONFIGURATION.md)     | Environment variables and configuration |
| [DOCKER.md](DOCKER.md)                   | Docker setup and containerization       |

## Core Guides

| Document                               | Description                                                          |
| -------------------------------------- | -------------------------------------------------------------------- |
| [AUTHENTICATION.md](AUTHENTICATION.md) | JWT authentication, login, registration, and token refresh           |
| [DATABASE.md](DATABASE.md)             | PostgreSQL setup, Prisma ORM, migrations, and seeding                |
| [PAGINATION.md](PAGINATION.md)         | Pagination patterns, sorting, filtering, and PaginatedQueryDto usage |
| [ENDPOINTS.md](ENDPOINTS.md)           | Complete API endpoint reference                                      |
| [API_VERSIONING.md](API_VERSIONING.md) | API v1/v2 versioning patterns                                        |

## Performance & Optimization

| Document                             | Description                                               |
| ------------------------------------ | --------------------------------------------------------- |
| [CACHING.md](CACHING.md)             | Redis caching patterns, TTL configuration, and cache keys |
| [RATE_LIMITING.md](RATE_LIMITING.md) | Throttler configuration, tiers, and usage                 |

## Testing & Quality

| Document                                 | Description                                                           |
| ---------------------------------------- | --------------------------------------------------------------------- |
| [TESTING.md](TESTING.md)                 | Test structure, utilities, unit tests, and E2E tests                  |
| [DEBUGGING.md](DEBUGGING.md)             | VS Code debugging with breakpoints for app and tests                  |
| [COVERAGE.md](COVERAGE.md)               | Code coverage thresholds and branch coverage explanation              |
| [POSTMAN-TESTING.md](POSTMAN-TESTING.md) | Postman testing overview (see [postman/](../postman/) for full guide) |

## Development Standards

| Document                                                           | Description                                              |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| [CODE_STYLE.md](CODE_STYLE.md)                                     | Code formatting, naming conventions, and ESLint rules    |
| [PRE_COMMIT_HOOKS.md](PRE_COMMIT_HOOKS.md)                         | Pre-commit hooks, commit message format, and lint-staged |
| [ESLINT_PLUGIN_IMPLEMENTATION.md](ESLINT_PLUGIN_IMPLEMENTATION.md) | Custom ESLint plugin for project-specific rules          |
| [LOGGING.md](LOGGING.md)                                           | Winston logging, correlation IDs, and log management     |

## Error Handling

| Document                                             | Description                                  |
| ---------------------------------------------------- | -------------------------------------------- |
| [ERROR_CODES.md](ERROR_CODES.md)                     | Standard error codes used across the API     |
| [ERROR_RESPONSE_FORMAT.md](ERROR_RESPONSE_FORMAT.md) | Error response structure and correlation IDs |

## Deployment & Operations

| Document                                                         | Description                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| [PRODUCTION.md](PRODUCTION.md)                                   | Production deployment, health checks, monitoring, and security |
| [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)             | Complete list of all environment variables                     |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md)                         | Common issues and solutions                                    |
| [SCRIPTS.md](SCRIPTS.md)                                         | Shell scripts reference (docker, db, module generator)         |
| [scripts/REMOVE_TASKS_MODULE.md](scripts/REMOVE_TASKS_MODULE.md) | Remove Tasks example module script documentation               |

## Module Development

| Document                                                     | Description                                               |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| [MODULE-CREATION-CHECKLIST.md](MODULE-CREATION-CHECKLIST.md) | Step-by-step checklist for creating new modules           |
| [CUSTOMIZATION.md](CUSTOMIZATION.md)                         | Guide for customizing and extending the skeleton          |
| [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)                 | Soft delete, caching, rate limiting, and other features   |
| [LOCATION-HEADER.md](LOCATION-HEADER.md)                     | HTTP Location header implementation for created resources |

## Architecture

| Document                                                                             | Description                                                         |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [architecture/PATTERNS.md](architecture/PATTERNS.md)                                 | Architectural patterns: layered architecture, DAL, DTOs, exceptions |
| [architecture/ADR-001-module-structure.md](architecture/ADR-001-module-structure.md) | Architecture Decision Record for module structure                   |

## Examples

| Document                                                         | Description                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| [examples/TASKS_MODULE_GUIDE.md](examples/TASKS_MODULE_GUIDE.md) | Complete usage guide for the Tasks module reference implementation |

---

## Document Categories

### For New Developers

1. [GETTING_STARTED.md](GETTING_STARTED.md) - Start here
2. [DEVELOPMENT.md](DEVELOPMENT.md) - Local development setup
3. [AUTHENTICATION.md](AUTHENTICATION.md) - How auth works
4. [examples/TASKS_MODULE_GUIDE.md](examples/TASKS_MODULE_GUIDE.md) - API usage examples

### For Adding Features

1. [MODULE-CREATION-CHECKLIST.md](MODULE-CREATION-CHECKLIST.md) - New module checklist
2. [architecture/PATTERNS.md](architecture/PATTERNS.md) - Follow these patterns
3. [PAGINATION.md](PAGINATION.md) - Implement list endpoints
4. [CACHING.md](CACHING.md) - Add caching to endpoints
5. [API_VERSIONING.md](API_VERSIONING.md) - Add v2 endpoints
6. [TESTING.md](TESTING.md) - Write tests

### For Deployment

1. [PRODUCTION.md](PRODUCTION.md) - Production setup
2. [DOCKER.md](DOCKER.md) - Container deployment
3. [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - Configure all variables
4. [SCRIPTS.md](SCRIPTS.md) - Utility scripts

### For Troubleshooting

1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
2. [DEBUGGING.md](DEBUGGING.md) - VS Code breakpoint debugging
3. [ERROR_CODES.md](ERROR_CODES.md) - Understand errors
4. [LOGGING.md](LOGGING.md) - Debug with logs
5. [COVERAGE.md](COVERAGE.md) - Coverage questions
