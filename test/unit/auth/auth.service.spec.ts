import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserRole, Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { AuthService } from "../../../src/auth/auth.service";
import { PrismaService } from "../../../src/database/prisma.service";
import { CorrelationService } from "../../../src/common/correlation";
import {
  RegistrationConflictException,
  AuthenticationFailedException,
  InvalidCredentialsException,
} from "../../../src/common/exceptions";

// --- Mocks ---

jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock PrismaClientKnownRequestError so instanceof checks work in the service.
// The class must be defined inside the jest.mock factory because jest hoists
// mock calls above all other statements, so a class defined at module scope
// would not yet exist when the factory runs.
jest.mock("@prisma/client", () => {
  class _PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    constructor(message: string, code: string, meta?: Record<string, unknown>) {
      super(message);
      this.name = "PrismaClientKnownRequestError";
      this.code = code;
      this.meta = meta;
    }
  }

  const actual = jest.requireActual("@prisma/client");

  return {
    ...actual,
    Prisma: {
      ...actual.Prisma,
      PrismaClientKnownRequestError: _PrismaClientKnownRequestError,
    },
  };
});

// Mock class-transformer, preserving all original exports (Expose, Exclude, etc.)
// and only overriding plainToInstance to verify excludeExtraneousValues behavior
jest.mock("class-transformer", () => {
  const actual = jest.requireActual("class-transformer");

  return {
    ...actual,

    plainToInstance: jest.fn((_cls: unknown, obj: Record<string, unknown>) => {
      // Simulate excludeExtraneousValues by stripping password and deletedAt
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, deletedAt, ...safe } = obj;

      return safe;
    }),
  };
});
import { plainToInstance } from "class-transformer";

// --- Test fixtures ---

const mockUser = {
  id: "user-id",
  email: "test@test.com",
  username: "testuser",
  password: "$2b$12$hashedpassword",
  firstName: "Test",
  lastName: "User",
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
};

const mockRegisterDto = {
  email: "test@test.com",
  username: "testuser",
  password: "SecureP@ss1",
  firstName: "Test",
  lastName: "User",
};

const mockLoginDto = {
  username: "testuser",
  password: "SecureP@ss1",
};

// --- Mock providers ---

const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
};

const mockCorrelationService = {
  getLogContext: jest.fn(),
  setUserId: jest.fn(),
};

// --- Helpers ---

function setupConfigDefaults(): void {
  mockCorrelationService.getLogContext.mockReturnValue("");
  mockConfigService.get.mockImplementation((key: string, defaultValue?: unknown) => {
    const config: Record<string, unknown> = {
      "security.bcryptRounds": 12,
    };

    return config[key] ?? defaultValue;
  });
  mockConfigService.getOrThrow.mockImplementation((key: string) => {
    const config: Record<string, string> = {
      "security.jwt.secret": "test-jwt-secret",
      "security.jwt.expiresIn": "15m",
      "security.jwt.refreshSecret": "test-refresh-secret",
      "security.jwt.refreshExpiresIn": "7d",
    };

    return config[key];
  });
}

function setupJwtDefaults(): void {
  mockJwtService.signAsync
    .mockResolvedValueOnce("mock-access-token")
    .mockResolvedValueOnce("mock-refresh-token");
}

// --- Test suite ---

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    setupConfigDefaults();
    setupJwtDefaults();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CorrelationService, useValue: mockCorrelationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------
  // register()
  // ---------------------------------------------------------------

  describe("register", () => {
    describe("Success", () => {
      beforeEach(() => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
        mockPrismaService.user.create.mockResolvedValue(mockUser);
      });

      it("should register a new user and return tokens with a safe user object", async () => {
        const result = await service.register(mockRegisterDto);

        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
        expect(result.user).toBeDefined();
        expect(mockPrismaService.user.create).toHaveBeenCalled();
      });

      it("should call plainToInstance with excludeExtraneousValues: true", async () => {
        await service.register(mockRegisterDto);

        expect(plainToInstance).toHaveBeenCalledWith(
          expect.anything(),
          mockUser,
          expect.objectContaining({ excludeExtraneousValues: true }),
        );
      });

      it("should NOT include password or deletedAt in the returned user object", async () => {
        const result = await service.register(mockRegisterDto);

        expect(result.user).not.toHaveProperty("password");
        expect(result.user).not.toHaveProperty("deletedAt");
      });

      it("should hash the password using bcryptRounds from config", async () => {
        await service.register(mockRegisterDto);

        expect(mockConfigService.get).toHaveBeenCalledWith("security.bcryptRounds", 12);
        expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 12);
      });

      it("should set userId in correlation context after registration", async () => {
        await service.register(mockRegisterDto);

        expect(mockCorrelationService.setUserId).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe("Failure", () => {
      it("should throw RegistrationConflictException when user already exists", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

        await expect(service.register(mockRegisterDto)).rejects.toThrow(
          RegistrationConflictException,
        );
      });

      it("should throw RegistrationConflictException on P2002 unique constraint violation", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

        const p2002Error = new (Prisma.PrismaClientKnownRequestError as any)(
          "Unique constraint",
          "P2002",
          { target: ["email"] },
        );

        mockPrismaService.user.create.mockRejectedValue(p2002Error);

        await expect(service.register(mockRegisterDto)).rejects.toThrow(
          RegistrationConflictException,
        );
      });

      it("should rethrow non-P2002 errors from prisma.user.create", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

        const genericError = new Error("Database connection failed");

        mockPrismaService.user.create.mockRejectedValue(genericError);

        await expect(service.register(mockRegisterDto)).rejects.toThrow(
          "Database connection failed",
        );
        await expect(service.register(mockRegisterDto)).rejects.not.toBeInstanceOf(
          RegistrationConflictException,
        );
      });

      it("should rethrow PrismaClientKnownRequestError with non-P2002 code", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

        const otherPrismaError = new (Prisma.PrismaClientKnownRequestError as any)(
          "Foreign key constraint",
          "P2003",
        );

        mockPrismaService.user.create.mockRejectedValue(otherPrismaError);

        await expect(service.register(mockRegisterDto)).rejects.toThrow(
          Prisma.PrismaClientKnownRequestError as any,
        );
        await expect(service.register(mockRegisterDto)).rejects.not.toBeInstanceOf(
          RegistrationConflictException,
        );
      });
    });
  });

  // ---------------------------------------------------------------
  // login()
  // ---------------------------------------------------------------

  describe("login", () => {
    describe("Success", () => {
      beforeEach(() => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      });

      it("should return tokens and a safe user object on successful login", async () => {
        const result = await service.login(mockLoginDto);

        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
        expect(result.user).toBeDefined();
      });

      it("should call plainToInstance with excludeExtraneousValues: true", async () => {
        await service.login(mockLoginDto);

        expect(plainToInstance).toHaveBeenCalledWith(
          expect.anything(),
          mockUser,
          expect.objectContaining({ excludeExtraneousValues: true }),
        );
      });

      it("should NOT include password or deletedAt in the returned user object", async () => {
        const result = await service.login(mockLoginDto);

        expect(result.user).not.toHaveProperty("password");
        expect(result.user).not.toHaveProperty("deletedAt");
      });

      it("should set userId in correlation context after login", async () => {
        await service.login(mockLoginDto);

        expect(mockCorrelationService.setUserId).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe("Failure", () => {
      it("should throw InvalidCredentialsException when validateUser returns null", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(mockLoginDto)).rejects.toThrow(InvalidCredentialsException);
      });
    });
  });

  // ---------------------------------------------------------------
  // validateUser()
  // ---------------------------------------------------------------

  describe("validateUser", () => {
    describe("Success", () => {
      it("should return user when credentials are valid", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await service.validateUser("testuser", "SecureP@ss1");

        expect(result).toEqual(mockUser);
      });

      it("should compare against user.password when user exists and is active", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

        await service.validateUser("testuser", "SecureP@ss1");

        expect(mockedBcrypt.compare).toHaveBeenCalledWith("SecureP@ss1", mockUser.password);
      });

      it("should query by both username and email", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

        await service.validateUser("test@test.com", "password");

        expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
          where: {
            OR: [{ username: "test@test.com" }, { email: "test@test.com" }],
            deletedAt: null,
          },
        });
      });
    });

    describe("Failure", () => {
      it("should return null when password is invalid", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await service.validateUser("testuser", "wrongpassword");

        expect(result).toBeNull();
      });

      it("should call bcrypt.compare with dummy hash when user is not found (timing oracle prevention)", async () => {
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await service.validateUser("nonexistent", "anypassword");

        expect(result).toBeNull();
        expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(
          "anypassword",
          expect.stringMatching(/^\$2b\$12\$/),
        );
      });

      it("should call bcrypt.compare with dummy hash when user is inactive (timing oracle prevention)", async () => {
        const inactiveUser = { ...mockUser, isActive: false };

        mockPrismaService.user.findFirst.mockResolvedValue(inactiveUser);
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await service.validateUser("testuser", "anypassword");

        expect(result).toBeNull();
        expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(
          "anypassword",
          expect.stringMatching(/^\$2b\$12\$/),
        );
      });

      it("should return null for inactive user even if password would match", async () => {
        const inactiveUser = { ...mockUser, isActive: false };

        mockPrismaService.user.findFirst.mockResolvedValue(inactiveUser);
        // The service compares against dummy hash for inactive users, not user.password
        (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await service.validateUser("testuser", "SecureP@ss1");

        expect(result).toBeNull();
        // Verify it used the dummy hash, not the user's actual password
        expect(mockedBcrypt.compare).not.toHaveBeenCalledWith("SecureP@ss1", mockUser.password);
      });
    });
  });

  // ---------------------------------------------------------------
  // refreshTokens()
  // ---------------------------------------------------------------

  describe("refreshTokens", () => {
    describe("Success", () => {
      it("should return new tokens for an active user", async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.refreshTokens("user-id");

        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
      });

      it("should query by id and exclude soft-deleted users", async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await service.refreshTokens("user-id");

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: "user-id", deletedAt: null },
        });
      });

      it("should set userId in correlation context after refreshing tokens", async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await service.refreshTokens("user-id");

        expect(mockCorrelationService.setUserId).toHaveBeenCalledWith(mockUser.id);
      });
    });

    describe("Failure", () => {
      it("should throw AuthenticationFailedException when user is not found", async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.refreshTokens("nonexistent-id")).rejects.toThrow(
          AuthenticationFailedException,
        );
      });

      it("should throw AuthenticationFailedException when user is inactive", async () => {
        const inactiveUser = { ...mockUser, isActive: false };

        mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

        await expect(service.refreshTokens("user-id")).rejects.toThrow(
          AuthenticationFailedException,
        );
      });
    });
  });

  // ---------------------------------------------------------------
  // generateTokens (tested indirectly via register/login/refreshTokens)
  // ---------------------------------------------------------------

  describe("generateTokens (via register)", () => {
    beforeEach(() => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      mockPrismaService.user.create.mockResolvedValue(mockUser);
    });

    it("should call signAsync with security.jwt.secret for access token", async () => {
      await service.register(mockRegisterDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expect.objectContaining({
          secret: "test-jwt-secret",
          expiresIn: "15m",
        }),
      );
    });

    it("should call signAsync with security.jwt.refreshSecret for refresh token", async () => {
      await service.register(mockRegisterDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          username: mockUser.username,
        }),
        expect.objectContaining({
          secret: "test-refresh-secret",
          expiresIn: "7d",
        }),
      );
    });

    it("should call configService.getOrThrow for JWT secrets, not raw env vars", async () => {
      await service.register(mockRegisterDto);

      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith("security.jwt.secret");
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith("security.jwt.refreshSecret");
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith("security.jwt.expiresIn");
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith("security.jwt.refreshExpiresIn");
    });

    it("should generate both access and refresh tokens via Promise.all", async () => {
      await service.register(mockRegisterDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });
});
