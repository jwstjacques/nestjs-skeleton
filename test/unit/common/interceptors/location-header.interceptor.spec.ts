import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of } from "rxjs";
import { LocationHeaderInterceptor } from "../../../../src/common/interceptors/location-header.interceptor";

describe("LocationHeaderInterceptor", () => {
  let interceptor: LocationHeaderInterceptor;

  beforeEach(() => {
    interceptor = new LocationHeaderInterceptor();
  });

  describe("intercept", () => {
    it("should add Location header for POST request with direct id", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks",
        url: "/api/v1/tasks",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: "cm4abc123xyz456def789ghi" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            "Location",
            "http://localhost:3000/api/v1/tasks/cm4abc123xyz456def789ghi",
          );
          done();
        },
        error: done,
      });
    });

    it("should add Location header for POST request with wrapped data", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "https",
        get: jest.fn().mockReturnValue("api.example.com"),
        path: "/api/v1/users",
        url: "/api/v1/users",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ data: { id: "cm4xyz789abc123def456ghi" } }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            "Location",
            "https://api.example.com/api/v1/users/cm4xyz789abc123def456ghi",
          );
          done();
        },
        error: done,
      });
    });

    it("should add Location header for PUT request using existing path", (done) => {
      const mockResponse = {
        statusCode: 200,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "PUT",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks/cm4abc123xyz456def789ghi",
        url: "/api/v1/tasks/cm4abc123xyz456def789ghi",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: "cm4abc123xyz456def789ghi" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            "Location",
            "http://localhost:3000/api/v1/tasks/cm4abc123xyz456def789ghi",
          );
          done();
        },
        error: done,
      });
    });

    it("should add Location header for PATCH request", (done) => {
      const mockResponse = {
        statusCode: 200,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "PATCH",
        protocol: "https",
        get: jest.fn().mockReturnValue("api.example.com"),
        path: "/api/v1/tasks/cm4xyz789abc123def456",
        url: "/api/v1/tasks/cm4xyz789abc123def456",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ data: { id: "cm4xyz789abc123def456" } }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            "Location",
            "https://api.example.com/api/v1/tasks/cm4xyz789abc123def456",
          );
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for GET request", (done) => {
      const mockResponse = {
        statusCode: 200,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "GET",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks",
        url: "/api/v1/tasks",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of([{ id: "cm4abc123xyz456def789ghi" }]),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for DELETE request", (done) => {
      const mockResponse = {
        statusCode: 200,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "DELETE",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks/cm4abc123xyz456def789ghi",
        url: "/api/v1/tasks/cm4abc123xyz456def789ghi",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ message: "Deleted successfully" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header when response has no id", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/auth/login",
        url: "/api/v1/auth/login",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ accessToken: "token", refreshToken: "refresh" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for error responses (4xx)", (done) => {
      const mockResponse = {
        statusCode: 400,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks",
        url: "/api/v1/tasks",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: "cm4abc123xyz456def789ghi" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for error responses (5xx)", (done) => {
      const mockResponse = {
        statusCode: 500,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks",
        url: "/api/v1/tasks",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: "cm4abc123xyz456def789ghi" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should handle POST request with trailing slash in path", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks/",
        url: "/api/v1/tasks/",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: "cm4abc123xyz456def789ghi" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            "Location",
            "http://localhost:3000/api/v1/tasks/cm4abc123xyz456def789ghi",
          );
          done();
        },
        error: done,
      });
    });

    it("should not add Location header when response is null", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks",
        url: "/api/v1/tasks",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of(null),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header when response is a primitive", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/tasks",
        url: "/api/v1/tasks",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of("success"),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for POST /auth/login (excluded path)", (done) => {
      const mockResponse = {
        statusCode: 200,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/auth/login",
        url: "/api/v1/auth/login",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ user: { id: "cm4user123" }, accessToken: "token" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for POST /auth/refresh (excluded path)", (done) => {
      const mockResponse = {
        statusCode: 200,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/auth/refresh",
        url: "/api/v1/auth/refresh",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ accessToken: "token", refreshToken: "refresh" }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it("should not add Location header for POST /auth/register (excluded path)", (done) => {
      const mockResponse = {
        statusCode: 201,
        setHeader: jest.fn(),
      };

      const mockRequest = {
        method: "POST",
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
        path: "/api/v1/auth/register",
        url: "/api/v1/auth/register",
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () =>
          of({
            data: {
              user: { id: "cm4user123xyz456def789" },
              accessToken: "token",
              refreshToken: "refresh",
            },
          }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });
  });
});
