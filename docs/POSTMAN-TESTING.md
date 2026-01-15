# Postman Testing Overview

This API includes a complete Postman collection for testing all endpoints.

## Quick Start

1. Import `postman/api-collection.json` into Postman
2. Start the application: `npm run start:dev`
3. Run **Login** request to get tokens (auto-saved)
4. Test any endpoint

## Collection Contents

| Folder                 | Endpoints | Description                                   |
| ---------------------- | --------- | --------------------------------------------- |
| Authentication         | 3         | Register, Login, Refresh Token                |
| Tasks (Example Module) | 6         | Full CRUD with pagination, filtering, sorting |
| Tasks v2 (Enhanced)    | 2         | Permission-checked read operations            |
| Health & Info          | 1         | Application health check                      |

## Variables

The collection includes pre-configured variables:

- `baseUrl`: `http://localhost:3000/api/v1`
- `baseUrlV2`: `http://localhost:3000/api/v2`
- `accessToken`: Auto-saved after login
- `refreshToken`: Auto-saved after login

## Authentication

All task endpoints require authentication. The collection automatically:

1. Saves tokens after Login/Register
2. Includes Bearer token on protected requests
3. Updates tokens after Refresh

## Seeded Test Users

After running `npm run prisma:seed`:

| Username  | Email                  | Password     |
| --------- | ---------------------- | ------------ |
| johndoe   | john.doe@example.com   | Password123! |
| janesmith | jane.smith@example.com | Password123! |
| admin     | admin@example.com      | Password123! |

## Comprehensive Guide

For detailed instructions including:

- Step-by-step workflow testing
- All query parameters
- Error handling scenarios
- Test scripts and automation
- Troubleshooting

See [postman/POSTMAN-TESTING-GUIDE.md](../postman/POSTMAN-TESTING-GUIDE.md)
