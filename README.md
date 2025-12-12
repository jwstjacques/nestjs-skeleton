# NestJS Task Management API

A production-ready RESTful API built with NestJS, featuring comprehensive CRUD operations, authentication, caching, and extensive testing.

## 🚀 Features

- ✅ **NestJS Framework** - Scalable Node.js framework
- ✅ **TypeScript** - Type-safe development
- ✅ **Prisma ORM** - Modern database toolkit
- ✅ **PostgreSQL** - Robust relational database
- ✅ **Redis** - High-performance caching
- ✅ **Docker** - Containerized development and deployment
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Swagger/OpenAPI** - Auto-generated API documentation
- ✅ **Jest Testing** - Comprehensive unit and e2e tests
- ✅ **Code Coverage** - >80% coverage target
- ✅ **Input Validation** - Class-validator integration
- ✅ **Rate Limiting** - API protection
- ✅ **Logging** - Winston logger integration
- ✅ **ESLint & Prettier** - Code quality and formatting
- ✅ **Husky** - Git hooks for quality checks
- ✅ **GitHub Actions** - CI/CD pipeline

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (for Phase 1+)
- PostgreSQL 15.x (via Docker)
- Redis 7.x (via Docker)

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/nestjs-skeleton.git
cd nestjs-skeleton

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## 📖 Description

This is a production-ready [NestJS](https://github.com/nestjs/nest) Task Management API built following industry best practices. The project is being developed in phases, with each phase adding new functionality and features.

## 🏃 Quick Start

```bash
# Start development server
npm run start:dev
```

**Available endpoints:**

- `GET /api/v1` - Welcome message
- `GET /api/v1/health` - Health check

## 🧪 Verify Installation

```bash
# In a new terminal
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "uptime": 15.123,
  "environment": "development"
}
```

## Project setup

```bash
$ npm install

# Start Docker services
docker-compose up -d

# Run database migrations
npm run prisma:migrate:dev

# Seed database
npm run prisma:seed
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**Development**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

**Production**: [https://api.yourdomain.com/api/docs](https://api.yourdomain.com/api/docs)

### OpenAPI Specification

The OpenAPI (Swagger) specification is available at:

- JSON: `/api/docs-json`
- YAML: `/api/docs-yaml`

You can also export the specification:
\`\`\`bash
npm run openapi:export
\`\`\`

This generates `docs/openapi.json` which can be imported into:

- Postman
- Insomnia
- API client generators

### API Examples

See [docs/API_EXAMPLES.md](./docs/API_EXAMPLES.md) for curl examples and sample responses.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
