import { ExecutionContext } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { CurrentUser } from "../../../../src/auth/decorators/current-user.decorator";

describe("CurrentUser Decorator", () => {
  let mockExecutionContext: ExecutionContext;

  const mockUser = {
    id: "clh9k7x2a0000qmxbzv0q0001",
    username: "testuser",
    email: "test@example.com",
    role: "USER",
  };

  // Helper function to execute the decorator factory

  function getParamDecoratorFactory(decorator: ParameterDecorator): any {
    class TestDecorator {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public test(@decorator data?: string) {
        // This method is just to apply the decorator
      }
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestDecorator, "test");

    return args[Object.keys(args)[0]].factory;
  }

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  describe("when user is present in request", () => {
    beforeEach(() => {
      const mockRequest = { user: mockUser };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
    });

    it("should return the entire user object when no data parameter is provided", () => {
      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory(undefined, mockExecutionContext);

      expect(result).toEqual(mockUser);
    });

    it("should return specific user property when data parameter is provided", () => {
      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory("id", mockExecutionContext)).toBe(mockUser.id);
      expect(factory("username", mockExecutionContext)).toBe(mockUser.username);
      expect(factory("email", mockExecutionContext)).toBe(mockUser.email);
      expect(factory("role", mockExecutionContext)).toBe(mockUser.role);
    });

    it("should return undefined for non-existent user property", () => {
      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory("nonExistentProperty", mockExecutionContext);

      expect(result).toBeUndefined();
    });

    it("should handle nested property access", () => {
      const userWithNested = {
        ...mockUser,
        profile: {
          firstName: "John",
          lastName: "Doe",
        },
      };

      const mockRequest = { user: userWithNested };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory("profile", mockExecutionContext);

      expect(result).toEqual({
        firstName: "John",
        lastName: "Doe",
      });
    });
  });

  describe("when user is not present in request", () => {
    beforeEach(() => {
      const mockRequest = {};

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
    });

    it("should return undefined when no user is attached to request", () => {
      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory(undefined, mockExecutionContext);

      expect(result).toBeUndefined();
    });

    it("should return undefined when requesting specific property with no user", () => {
      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory("id", mockExecutionContext);

      expect(result).toBeUndefined();
    });
  });

  describe("when user is null", () => {
    beforeEach(() => {
      const mockRequest = { user: null };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
    });

    it("should return null when user is explicitly null", () => {
      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory(undefined, mockExecutionContext);

      expect(result).toBeNull();
    });

    it("should return undefined when accessing property on null user", () => {
      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory("id", mockExecutionContext);

      expect(result).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty user object", () => {
      const mockRequest = { user: {} };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory(undefined, mockExecutionContext)).toEqual({});
      expect(factory("id", mockExecutionContext)).toBeUndefined();
    });

    it("should handle user with only some properties", () => {
      const partialUser = {
        id: "clh9k7x2a0000qmxbzv0q0001",
      };
      const mockRequest = { user: partialUser };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory(undefined, mockExecutionContext)).toEqual(partialUser);
      expect(factory("id", mockExecutionContext)).toBe(partialUser.id);
      expect(factory("username", mockExecutionContext)).toBeUndefined();
    });

    it("should handle numeric property values", () => {
      const userWithNumbers = {
        id: "clh9k7x2a0000qmxbzv0q0001",
        loginCount: 42,
        age: 30,
      };
      const mockRequest = { user: userWithNumbers };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory("loginCount", mockExecutionContext)).toBe(42);
      expect(factory("age", mockExecutionContext)).toBe(30);
    });

    it("should handle boolean property values", () => {
      const userWithBooleans = {
        id: "clh9k7x2a0000qmxbzv0q0001",
        isActive: true,
        isEmailVerified: false,
      };
      const mockRequest = { user: userWithBooleans };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory("isActive", mockExecutionContext)).toBe(true);
      expect(factory("isEmailVerified", mockExecutionContext)).toBe(false);
    });

    it("should handle array property values", () => {
      const userWithArray = {
        id: "clh9k7x2a0000qmxbzv0q0001",
        roles: ["USER", "ADMIN"],
        permissions: [],
      };
      const mockRequest = { user: userWithArray };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory("roles", mockExecutionContext)).toEqual(["USER", "ADMIN"]);
      expect(factory("permissions", mockExecutionContext)).toEqual([]);
    });

    it("should handle null property values", () => {
      const userWithNull = {
        id: "clh9k7x2a0000qmxbzv0q0001",
        middleName: null,
      };
      const mockRequest = { user: userWithNull };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory("middleName", mockExecutionContext)).toBeNull();
    });

    it("should work with string data parameter type", () => {
      const mockRequest = { user: mockUser };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());
      const propertyName: string = "email";
      const result = factory(propertyName, mockExecutionContext);

      expect(result).toBe(mockUser.email);
    });

    it("should work with undefined data parameter", () => {
      const mockRequest = { user: mockUser };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());
      const result = factory(undefined, mockExecutionContext);

      expect(result).toEqual(mockUser);
    });
  });

  describe("execution context", () => {
    it("should call switchToHttp on execution context", () => {
      const mockRequest = { user: mockUser };
      const getRequestMock = jest.fn().mockReturnValue(mockRequest);
      const switchToHttpMock = jest.fn().mockReturnValue({
        getRequest: getRequestMock,
      });

      mockExecutionContext = {
        switchToHttp: switchToHttpMock,
      } as unknown as ExecutionContext;

      const factory = getParamDecoratorFactory(CurrentUser());

      factory(undefined, mockExecutionContext);

      expect(switchToHttpMock).toHaveBeenCalledTimes(1);
      expect(getRequestMock).toHaveBeenCalledTimes(1);
    });

    it("should get request from HTTP context", () => {
      const mockRequest = { user: mockUser };
      const getRequestMock = jest.fn().mockReturnValue(mockRequest);

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: getRequestMock,
        }),
      } as unknown as ExecutionContext;

      const factory = getParamDecoratorFactory(CurrentUser());

      factory(undefined, mockExecutionContext);

      expect(getRequestMock).toHaveBeenCalled();
    });
  });

  describe("real-world scenarios", () => {
    it("should extract user from JWT payload structure", () => {
      const jwtUser = {
        id: "clh9k7x2a0000qmxbzv0q0001",
        username: "johndoe",
        email: "john@example.com",
        role: "ADMIN",
        iat: 1701234567,
        exp: 1701238167,
      };

      const mockRequest = { user: jwtUser };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory(undefined, mockExecutionContext)).toEqual(jwtUser);
      expect(factory("id", mockExecutionContext)).toBe(jwtUser.id);
      expect(factory("role", mockExecutionContext)).toBe(jwtUser.role);
    });

    it("should handle user with timestamps", () => {
      const userWithTimestamps = {
        id: "clh9k7x2a0000qmxbzv0q0001",
        username: "testuser",
        email: "test@example.com",
        role: "USER",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-12-13T00:00:00.000Z"),
      };

      const mockRequest = { user: userWithTimestamps };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const factory = getParamDecoratorFactory(CurrentUser());

      expect(factory("createdAt", mockExecutionContext)).toEqual(
        new Date("2025-01-01T00:00:00.000Z"),
      );
      expect(factory("updatedAt", mockExecutionContext)).toEqual(
        new Date("2025-12-13T00:00:00.000Z"),
      );
    });
  });
});
