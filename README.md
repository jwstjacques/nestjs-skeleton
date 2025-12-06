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
- Docker and Docker Compose
- PostgreSQL 15.x (or via Docker)
- Redis 7.x (or via Docker)
- npm or yarn

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/nestjs-skeleton.git
cd nestjs-skeleton

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start Docker services
docker-compose up -d

# Run database migrations
npm run prisma:migrate:dev

# Seed database
npm run prisma:seed

# Start development server
npm run start:dev