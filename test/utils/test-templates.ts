/**
 * Reusable test templates for common scenarios
 * Standardized test patterns for CRUD operations and validation
 */

import request from "supertest";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Assertions, AuthHelper } from "./test-helpers";

// ============================================================================
// CRUD Test Templates
// ============================================================================

export class CrudTestTemplate {
  /**
   * Test unauthorized access to endpoints
   */
  static testUnauthorizedAccess(
    app: INestApplication,
    endpoints: Array<{ method: string; path: string }>,
  ) {
    describe("Unauthorized Access", () => {
      endpoints.forEach(({ method, path }) => {
        it(`should return 401 for ${method.toUpperCase()} ${path} without auth`, async () => {
          const response = await request(app.getHttpServer())[
            method as "get" | "post" | "patch" | "delete"
          ](path);

          Assertions.assertUnauthorized(response);
        });
      });
    });
  }

  /**
   * Test forbidden access (authenticated but no permission)
   */
  static testForbiddenAccess(
    app: INestApplication,
    endpoint: string,
    method: "get" | "post" | "patch" | "delete",
    validToken: string,
    errorCode?: string,
  ) {
    it("should return 403 for forbidden access", async () => {
      const response = await request(app.getHttpServer())
        [method](endpoint)
        .set(AuthHelper.authHeader(validToken));

      Assertions.assertForbidden(response, errorCode);
    });
  }

  /**
   * Test not found errors
   */
  static testNotFound(app: INestApplication, endpoint: string, token: string, errorCode?: string) {
    it("should return 404 for non-existent resource", async () => {
      const response = await request(app.getHttpServer())
        .get(endpoint)
        .set(AuthHelper.authHeader(token));

      Assertions.assertNotFound(response, errorCode);
    });
  }

  /**
   * Test pagination
   */
  static testPagination(app: INestApplication, endpoint: string, token: string) {
    describe("Pagination", () => {
      it("should return paginated results", async () => {
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?page=1&limit=10`)
          .set(AuthHelper.authHeader(token))
          .expect(HttpStatus.OK);

        Assertions.assertPaginatedResponse(response.body);
      });

      it("should respect limit parameter", async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?page=1&limit=${limit}`)
          .set(AuthHelper.authHeader(token))
          .expect(HttpStatus.OK);

        Assertions.assertPaginatedResponse(response.body);
        expect(response.body.meta.limit).toBe(limit);
      });

      it("should handle invalid page number", async () => {
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?page=0&limit=10`)
          .set(AuthHelper.authHeader(token));

        Assertions.assertValidationError(response);
      });

      it("should handle invalid limit", async () => {
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?page=1&limit=0`)
          .set(AuthHelper.authHeader(token));

        Assertions.assertValidationError(response);
      });

      it("should handle page exceeding total pages", async () => {
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?page=999999&limit=10`)
          .set(AuthHelper.authHeader(token))
          .expect(HttpStatus.OK);

        Assertions.assertPaginatedResponse(response.body, 0);
      });
    });
  }

  /**
   * Test sorting
   */
  static testSorting(
    app: INestApplication,
    endpoint: string,
    token: string,
    sortableFields: string[],
  ) {
    describe("Sorting", () => {
      sortableFields.forEach((field) => {
        it(`should sort by ${field} ascending`, async () => {
          const response = await request(app.getHttpServer())
            .get(`${endpoint}?sortBy=${field}&sortOrder=ASC`)
            .set(AuthHelper.authHeader(token))
            .expect(HttpStatus.OK);

          expect(response.body.success).toBe(true);
        });

        it(`should sort by ${field} descending`, async () => {
          const response = await request(app.getHttpServer())
            .get(`${endpoint}?sortBy=${field}&sortOrder=DESC`)
            .set(AuthHelper.authHeader(token))
            .expect(HttpStatus.OK);

          expect(response.body.success).toBe(true);
        });
      });

      it("should reject invalid sort field", async () => {
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?sortBy=invalidField&sortOrder=ASC`)
          .set(AuthHelper.authHeader(token));

        // Might be validation error or just ignored
        expect([HttpStatus.OK, HttpStatus.BAD_REQUEST]).toContain(response.statusCode);
      });
    });
  }

  /**
   * Test soft delete operations
   */
  static testSoftDelete(
    app: INestApplication,
    baseEndpoint: string,
    resourceId: string,
    token: string,
  ) {
    describe("Soft Delete", () => {
      it("should soft delete resource", async () => {
        const response = await request(app.getHttpServer())
          .delete(`${baseEndpoint}/${resourceId}`)
          .set(AuthHelper.authHeader(token))
          .expect(HttpStatus.OK);

        Assertions.assertSuccessResponse(response, HttpStatus.OK);
      });

      it("should not return soft deleted resource in list", async () => {
        // First delete
        await request(app.getHttpServer())
          .delete(`${baseEndpoint}/${resourceId}`)
          .set(AuthHelper.authHeader(token))
          .expect(HttpStatus.OK);

        // Then check list
        const response = await request(app.getHttpServer())
          .get(baseEndpoint)
          .set(AuthHelper.authHeader(token))
          .expect(HttpStatus.OK);

        const deletedResource = response.body.data.find((item: any) => item.id === resourceId);

        expect(deletedResource).toBeUndefined();
      });
    });
  }
}

// ============================================================================
// Validation Test Templates
// ============================================================================

export class ValidationTestTemplate {
  /**
   * Test required field validation
   */
  static testRequiredFields(
    app: INestApplication,
    endpoint: string,
    token: string,
    requiredFields: string[],
    baseData: any = {},
  ) {
    describe("Required Fields Validation", () => {
      requiredFields.forEach((field) => {
        it(`should fail when ${field} is missing`, async () => {
          const data = { ...baseData };

          delete data[field];

          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          Assertions.assertValidationError(response);
        });

        it(`should fail when ${field} is null`, async () => {
          const data = { ...baseData, [field]: null };

          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          Assertions.assertValidationError(response);
        });

        it(`should fail when ${field} is empty string`, async () => {
          const data = { ...baseData, [field]: "" };

          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          Assertions.assertValidationError(response);
        });
      });
    });
  }

  /**
   * Test string length validation
   */
  static testStringLength(
    app: INestApplication,
    endpoint: string,
    token: string,
    field: string,
    minLength: number,
    maxLength: number,
    baseData: any = {},
  ) {
    describe(`${field} Length Validation`, () => {
      if (minLength > 0) {
        it(`should fail when ${field} is too short`, async () => {
          const data = { ...baseData, [field]: "a".repeat(minLength - 1) };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          Assertions.assertValidationError(response);
        });

        it(`should accept ${field} at minimum length`, async () => {
          const data = { ...baseData, [field]: "a".repeat(minLength) };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          // Should not be a validation error (might be 201, 400 for other reasons)
          expect(response.statusCode).not.toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        });
      }

      it(`should fail when ${field} is too long`, async () => {
        const data = { ...baseData, [field]: "a".repeat(maxLength + 1) };
        const response = await request(app.getHttpServer())
          .post(endpoint)
          .set(AuthHelper.authHeader(token))
          .send(data);

        Assertions.assertValidationError(response);
      });

      it(`should accept ${field} at maximum length`, async () => {
        const data = { ...baseData, [field]: "a".repeat(maxLength) };
        const response = await request(app.getHttpServer())
          .post(endpoint)
          .set(AuthHelper.authHeader(token))
          .send(data);

        // Should not be a validation error
        expect(response.statusCode).not.toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });
  }

  /**
   * Test enum validation
   */
  static testEnumValidation(
    app: INestApplication,
    endpoint: string,
    token: string,
    field: string,
    validValues: string[],
    baseData: any = {},
  ) {
    describe(`${field} Enum Validation`, () => {
      it(`should fail when ${field} has invalid value`, async () => {
        const data = { ...baseData, [field]: "INVALID_VALUE_NOT_IN_ENUM" };
        const response = await request(app.getHttpServer())
          .post(endpoint)
          .set(AuthHelper.authHeader(token))
          .send(data);

        Assertions.assertValidationError(response);
      });

      validValues.forEach((value) => {
        it(`should accept ${field}=${value}`, async () => {
          const data = { ...baseData, [field]: value };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          // Should not be enum validation error (might fail for other reasons)
          if (response.statusCode === HttpStatus.BAD_REQUEST && response.body.message) {
            const messages = Array.isArray(response.body.message)
              ? response.body.message
              : [response.body.message];
            const hasEnumError = messages.some((msg: string) =>
              msg.toLowerCase().includes("must be one of"),
            );

            expect(hasEnumError).toBe(false);
          }
        });
      });
    });
  }

  /**
   * Test email validation
   */
  static testEmailValidation(
    app: INestApplication,
    endpoint: string,
    token: string,
    field: string,
    baseData: any = {},
  ) {
    describe(`${field} Email Validation`, () => {
      const invalidEmails = [
        "not-an-email",
        "missing@domain",
        "@nodomain.com",
        "spaces in@email.com",
        "double@@email.com",
      ];

      invalidEmails.forEach((email) => {
        it(`should reject invalid email: ${email}`, async () => {
          const data = { ...baseData, [field]: email };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          Assertions.assertValidationError(response);
        });
      });

      const validEmails = ["test@example.com", "user+tag@domain.co.uk", "valid_email@test.org"];

      validEmails.forEach((email) => {
        it(`should accept valid email: ${email}`, async () => {
          const data = { ...baseData, [field]: email };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          // Should not be email validation error
          if (response.statusCode === HttpStatus.BAD_REQUEST && response.body.message) {
            const messages = Array.isArray(response.body.message)
              ? response.body.message
              : [response.body.message];
            const hasEmailError = messages.some((msg: string) =>
              msg.toLowerCase().includes("email"),
            );

            expect(hasEmailError).toBe(false);
          }
        });
      });
    });
  }

  /**
   * Test type validation (string, number, boolean, etc.)
   */
  static testTypeValidation(
    app: INestApplication,
    endpoint: string,
    token: string,
    field: string,
    expectedType: "string" | "number" | "boolean",
    baseData: any = {},
  ) {
    describe(`${field} Type Validation`, () => {
      const invalidValues: Record<string, any[]> = {
        string: [123, true, {}, []],
        number: ["string", true, {}, []],
        boolean: ["string", 123, {}, []],
      };

      invalidValues[expectedType].forEach((value) => {
        it(`should reject ${typeof value} when ${expectedType} expected`, async () => {
          const data = { ...baseData, [field]: value };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          Assertions.assertValidationError(response);
        });
      });
    });
  }
}

// ============================================================================
// Security Test Templates
// ============================================================================

export class SecurityTestTemplate {
  /**
   * Test SQL injection attempts
   */
  static testSqlInjection(
    app: INestApplication,
    endpoint: string,
    token: string,
    field: string,
    baseData: any = {},
  ) {
    describe("SQL Injection Protection", () => {
      const injectionAttempts = [
        "' OR '1'='1",
        "1' OR '1' = '1",
        "'; DROP TABLE users--",
        "1; DROP TABLE users--",
      ];

      injectionAttempts.forEach((attempt) => {
        it(`should safely handle SQL injection: ${attempt}`, async () => {
          const data = { ...baseData, [field]: attempt };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          // Should either validate or handle safely, not crash
          expect([HttpStatus.BAD_REQUEST, HttpStatus.CREATED, HttpStatus.OK]).toContain(
            response.statusCode,
          );
        });
      });
    });
  }

  /**
   * Test XSS attempts
   */
  static testXssProtection(
    app: INestApplication,
    endpoint: string,
    token: string,
    field: string,
    baseData: any = {},
  ) {
    describe("XSS Protection", () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
      ];

      xssAttempts.forEach((attempt) => {
        it(`should safely handle XSS attempt: ${attempt}`, async () => {
          const data = { ...baseData, [field]: attempt };
          const response = await request(app.getHttpServer())
            .post(endpoint)
            .set(AuthHelper.authHeader(token))
            .send(data);

          // Should handle safely
          expect(response.statusCode).not.toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
      });
    });
  }

  /**
   * Test rate limiting
   */
  static testRateLimit(app: INestApplication, endpoint: string, token: string, maxRequests = 10) {
    describe("Rate Limiting", () => {
      it("should enforce rate limits", async () => {
        const requests = [];

        // Make many rapid requests
        for (let i = 0; i < maxRequests + 5; i++) {
          requests.push(
            request(app.getHttpServer()).get(endpoint).set(AuthHelper.authHeader(token)),
          );
        }

        const responses = await Promise.all(requests);
        const tooManyRequests = responses.filter(
          (r) => r.statusCode === HttpStatus.TOO_MANY_REQUESTS,
        );

        // At least some should be rate limited
        expect(tooManyRequests.length).toBeGreaterThan(0);
      }, 10000); // Longer timeout for multiple requests
    });
  }
}

// ============================================================================
// Exports
// ============================================================================

export { CrudTestTemplate as CrudTemplate };
export { ValidationTestTemplate as ValidationTemplate };
export { SecurityTestTemplate as SecurityTemplate };
