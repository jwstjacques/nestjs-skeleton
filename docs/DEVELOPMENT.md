# Development Guide

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (for database)
- Git

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run start:dev
```

## API Documentation

### Swagger UI

Interactive API documentation is available at:

- **URL**: <http://localhost:3000/api/v1/docs>
- **Features**:
  - Try-it-out functionality for all endpoints
  - Request/response schemas
  - Authentication testing
  - Alpha-sorted tags and operations

### Exporting OpenAPI Specification

Generate the OpenAPI JSON specification:

```bash
npm run openapi:export
```

This creates `docs/openapi.json` which can be:

- Imported into Postman or Insomnia
- Used for client code generation
- Shared with frontend developers
- Versioned in Git for API contract tracking

### API Client Generation

You can generate typed API clients from the exported specification:

```bash
# TypeScript/JavaScript
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.json \
  -g typescript-axios \
  -o ./generated/api-client

# Python
openapi-generator generate \
  -i docs/openapi.json \
  -g python \
  -o ./generated/python-client
```
