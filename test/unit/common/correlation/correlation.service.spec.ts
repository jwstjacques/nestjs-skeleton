import { Test, TestingModule } from "@nestjs/testing";
import { CorrelationService } from "../../../../src/common/correlation/correlation.service";

describe("CorrelationService", () => {
  let service: CorrelationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationService],
    }).compile();

    service = module.get<CorrelationService>(CorrelationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("constructor", () => {
    it("should expose AsyncLocalStorage globally", () => {
      expect((global as Record<string, unknown>).correlationStorage).toBeDefined();
    });
  });

  describe("run", () => {
    it("should execute callback with correlation context", () => {
      const context = { correlationId: "test-id-123" };
      const callback = jest.fn(() => "result");

      const result = service.run(context, callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBe("result");
    });

    it("should make context available during callback execution", () => {
      const context = { correlationId: "test-id-456" };
      let capturedId: string | undefined;

      service.run(context, () => {
        capturedId = service.getCorrelationId();
      });

      expect(capturedId).toBe("test-id-456");
    });

    it("should handle context with userId", () => {
      const context = { correlationId: "test-id-789", userId: 42 };
      let capturedUserId: number | undefined;

      service.run(context, () => {
        capturedUserId = service.getUserId();
      });

      expect(capturedUserId).toBe(42);
    });
  });

  describe("getCorrelationId", () => {
    it("should return correlationId when context exists", () => {
      const context = { correlationId: "abc-123" };

      service.run(context, () => {
        expect(service.getCorrelationId()).toBe("abc-123");
      });
    });

    it("should return undefined when no context exists", () => {
      expect(service.getCorrelationId()).toBeUndefined();
    });
  });

  describe("getUserId", () => {
    it("should return userId when context exists with userId", () => {
      const context = { correlationId: "test-id", userId: 100 };

      service.run(context, () => {
        expect(service.getUserId()).toBe(100);
      });
    });

    it("should return undefined when context exists without userId", () => {
      const context = { correlationId: "test-id" };

      service.run(context, () => {
        expect(service.getUserId()).toBeUndefined();
      });
    });

    it("should return undefined when no context exists", () => {
      expect(service.getUserId()).toBeUndefined();
    });
  });

  describe("setUserId", () => {
    it("should set userId in existing context", () => {
      const context = { correlationId: "test-id" };

      service.run(context, () => {
        expect(service.getUserId()).toBeUndefined();

        service.setUserId(999);

        expect(service.getUserId()).toBe(999);
      });
    });

    it("should not throw when no context exists", () => {
      expect(() => service.setUserId(123)).not.toThrow();
    });

    it("should not set userId when no context exists", () => {
      service.setUserId(456);
      expect(service.getUserId()).toBeUndefined();
    });

    it("should update existing userId", () => {
      const context = { correlationId: "test-id", userId: 100 };

      service.run(context, () => {
        expect(service.getUserId()).toBe(100);

        service.setUserId(200);

        expect(service.getUserId()).toBe(200);
      });
    });
  });

  describe("getContext", () => {
    it("should return full context when it exists", () => {
      const context = { correlationId: "test-123", userId: 42 };

      service.run(context, () => {
        const retrievedContext = service.getContext();

        expect(retrievedContext).toEqual(context);
        expect(retrievedContext?.correlationId).toBe("test-123");
        expect(retrievedContext?.userId).toBe(42);
      });
    });

    it("should return context without userId when userId is not set", () => {
      const context = { correlationId: "test-456" };

      service.run(context, () => {
        const retrievedContext = service.getContext();

        expect(retrievedContext?.correlationId).toBe("test-456");
        expect(retrievedContext?.userId).toBeUndefined();
      });
    });

    it("should return undefined when no context exists", () => {
      expect(service.getContext()).toBeUndefined();
    });
  });

  describe("getLogContext", () => {
    it("should return empty string when no context exists", () => {
      expect(service.getLogContext()).toBe("");
    });

    it("should return formatted correlation ID only", () => {
      const context = { correlationId: "abc-123" };

      service.run(context, () => {
        expect(service.getLogContext()).toBe("[abc-123]");
      });
    });

    it("should return formatted correlation ID and userId", () => {
      const context = { correlationId: "xyz-789", userId: 42 };

      service.run(context, () => {
        expect(service.getLogContext()).toBe("[xyz-789] [user-42]");
      });
    });

    it("should handle long correlation IDs", () => {
      const context = {
        correlationId: "a1b2c3d4-e5f6-4789-90ab-cdef12345678",
        userId: 999,
      };

      service.run(context, () => {
        expect(service.getLogContext()).toBe("[a1b2c3d4-e5f6-4789-90ab-cdef12345678] [user-999]");
      });
    });

    it("should handle userId of 0", () => {
      const context = { correlationId: "test-id", userId: 0 };

      service.run(context, () => {
        const logContext = service.getLogContext();

        // userId 0 is falsy, so it won't be included
        expect(logContext).toBe("[test-id]");
      });
    });

    it("should format multiple parts with space separator", () => {
      const context = { correlationId: "req-123", userId: 100 };

      service.run(context, () => {
        const logContext = service.getLogContext();

        expect(logContext).toContain("[req-123]");
        expect(logContext).toContain("[user-100]");
        expect(logContext.split(" ").length).toBe(2);
      });
    });
  });

  describe("nested contexts", () => {
    it("should handle nested run calls", () => {
      const outerContext = { correlationId: "outer-123" };
      const innerContext = { correlationId: "inner-456", userId: 42 };

      service.run(outerContext, () => {
        expect(service.getCorrelationId()).toBe("outer-123");
        expect(service.getUserId()).toBeUndefined();

        service.run(innerContext, () => {
          expect(service.getCorrelationId()).toBe("inner-456");
          expect(service.getUserId()).toBe(42);
        });

        // Should restore outer context
        expect(service.getCorrelationId()).toBe("outer-123");
        expect(service.getUserId()).toBeUndefined();
      });
    });
  });

  describe("async operations", () => {
    it("should maintain context across async operations", async () => {
      const context = { correlationId: "async-123", userId: 99 };

      await service.run(context, async () => {
        expect(service.getCorrelationId()).toBe("async-123");

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(service.getCorrelationId()).toBe("async-123");
        expect(service.getUserId()).toBe(99);
      });
    });

    it("should handle Promise.all with same context", async () => {
      const context = { correlationId: "parallel-123" };

      await service.run(context, async () => {
        const results = await Promise.all([
          Promise.resolve(service.getCorrelationId()),
          Promise.resolve(service.getCorrelationId()),
          Promise.resolve(service.getCorrelationId()),
        ]);

        expect(results).toEqual(["parallel-123", "parallel-123", "parallel-123"]);
      });
    });
  });
});
