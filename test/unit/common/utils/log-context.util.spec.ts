import { LogContextUtil } from "../../../../src/common/utils/log-context.util";

describe("LogContextUtil", () => {
  describe("buildContext", () => {
    describe("Success", () => {
      it("should return empty string when no parameters provided", () => {
        const result = LogContextUtil.buildContext();

        expect(result).toBe("");
      });

      it("should return empty string when both parameters are undefined", () => {
        const result = LogContextUtil.buildContext(undefined, undefined);

        expect(result).toBe("");
      });

      it("should format correlation ID only", () => {
        const result = LogContextUtil.buildContext("abc-123-def");

        expect(result).toBe("[abc-123-def]");
      });

      it("should format user ID (number) only", () => {
        const result = LogContextUtil.buildContext(undefined, 456);

        expect(result).toBe("[user-456]");
      });

      it("should format user ID (string) only", () => {
        const result = LogContextUtil.buildContext(undefined, "user-xyz");

        expect(result).toBe("[user-user-xyz]");
      });

      it("should format both correlation ID and user ID (number)", () => {
        const result = LogContextUtil.buildContext("abc-123-def", 456);

        expect(result).toBe("[abc-123-def] [user-456]");
      });

      it("should format both correlation ID and user ID (string)", () => {
        const result = LogContextUtil.buildContext("abc-123-def", "xyz-789");

        expect(result).toBe("[abc-123-def] [user-xyz-789]");
      });

      it("should handle empty string correlation ID as falsy", () => {
        const result = LogContextUtil.buildContext("", 123);

        expect(result).toBe("[user-123]");
      });

      it("should handle zero as valid user ID", () => {
        const result = LogContextUtil.buildContext("correlation-id", 0);

        expect(result).toBe("[correlation-id] [user-0]");
      });

      it("should handle UUID as correlation ID", () => {
        const uuid = "550e8400-e29b-41d4-a716-446655440000";
        const result = LogContextUtil.buildContext(uuid, 789);

        expect(result).toBe(`[${uuid}] [user-789]`);
      });

      it("should handle CUID as correlation ID", () => {
        const cuid = "clhqxg3zx0000l308abcd1234";
        const result = LogContextUtil.buildContext(cuid);

        expect(result).toBe(`[${cuid}]`);
      });

      it("should handle special characters in IDs", () => {
        const result = LogContextUtil.buildContext("req-2024-01-15-xyz", "admin@example.com");

        expect(result).toBe("[req-2024-01-15-xyz] [user-admin@example.com]");
      });
    });
  });
});
