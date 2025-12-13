import { LogLevel, LogLevelUtil } from "../../../../src/common/enums/log-level.enum";

describe("LogLevelUtil", () => {
  describe("isValidLevel", () => {
    it("should return true for valid log levels", () => {
      expect(LogLevelUtil.isValidLevel("error")).toBe(true);
      expect(LogLevelUtil.isValidLevel("warn")).toBe(true);
      expect(LogLevelUtil.isValidLevel("info")).toBe(true);
      expect(LogLevelUtil.isValidLevel("debug")).toBe(true);
    });

    it("should return true for valid log levels regardless of case", () => {
      expect(LogLevelUtil.isValidLevel("ERROR")).toBe(true);
      expect(LogLevelUtil.isValidLevel("WaRn")).toBe(true);
      expect(LogLevelUtil.isValidLevel("INFO")).toBe(true);
    });

    it("should return false for invalid log levels", () => {
      expect(LogLevelUtil.isValidLevel("invalid")).toBe(false);
      expect(LogLevelUtil.isValidLevel("")).toBe(false);
      expect(LogLevelUtil.isValidLevel("trace")).toBe(false);
      expect(LogLevelUtil.isValidLevel("fatal")).toBe(false);
    });
  });

  describe("fromEnv", () => {
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
      console.warn = jest.fn();
    });

    afterEach(() => {
      console.warn = originalConsoleWarn;
    });

    it("should return the provided valid log level", () => {
      expect(LogLevelUtil.fromEnv("error")).toBe(LogLevel.ERROR);
      expect(LogLevelUtil.fromEnv("warn")).toBe(LogLevel.WARN);
      expect(LogLevelUtil.fromEnv("info")).toBe(LogLevel.INFO);
      expect(LogLevelUtil.fromEnv("debug")).toBe(LogLevel.DEBUG);
    });

    it("should handle case-insensitive input", () => {
      expect(LogLevelUtil.fromEnv("ERROR")).toBe(LogLevel.ERROR);
      expect(LogLevelUtil.fromEnv("WaRn")).toBe(LogLevel.WARN);
    });

    it("should return default level when env value is undefined", () => {
      expect(LogLevelUtil.fromEnv(undefined)).toBe(LogLevel.INFO);
      expect(LogLevelUtil.fromEnv(undefined, LogLevel.DEBUG)).toBe(LogLevel.DEBUG);
    });

    it("should return default and warn for invalid log level", () => {
      const result = LogLevelUtil.fromEnv("invalid");

      expect(result).toBe(LogLevel.INFO);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid log level "invalid"'),
      );
    });

    it("should use custom default when invalid level provided", () => {
      const result = LogLevelUtil.fromEnv("invalid", LogLevel.DEBUG);

      expect(result).toBe(LogLevel.DEBUG);
    });

    it("should not warn when valid level provided", () => {
      LogLevelUtil.fromEnv("error");

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
