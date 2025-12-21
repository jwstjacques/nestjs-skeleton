import { IsFutureDateConstraint } from "../../../../src/common/validators/is-future-date.validator";

describe("IsFutureDateConstraint", () => {
  let validator: IsFutureDateConstraint;

  beforeEach(() => {
    validator = new IsFutureDateConstraint();
  });

  describe("validate", () => {
    it("should return true for empty string (let @IsOptional handle it)", () => {
      expect(validator.validate("")).toBe(true);
    });

    it("should return true for null (let @IsOptional handle it)", () => {
      expect(validator.validate(null as any)).toBe(true);
    });

    it("should return true for undefined (let @IsOptional handle it)", () => {
      expect(validator.validate(undefined as any)).toBe(true);
    });

    it("should return false for invalid date string", () => {
      expect(validator.validate("invalid-date")).toBe(false);
    });

    it("should return false for malformed date", () => {
      expect(validator.validate("2025-13-45")).toBe(false);
    });

    it("should return false for past date", () => {
      const pastDate = new Date();

      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      expect(validator.validate(pastDate.toISOString())).toBe(false);
    });

    it("should return true for today's date", () => {
      const today = new Date();

      expect(validator.validate(today.toISOString())).toBe(true);
    });

    it("should return true for future date", () => {
      const futureDate = new Date();

      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      expect(validator.validate(futureDate.toISOString())).toBe(true);
    });

    it("should return true for date far in the future", () => {
      const futureDate = new Date();

      futureDate.setFullYear(futureDate.getFullYear() + 1); // Next year
      expect(validator.validate(futureDate.toISOString())).toBe(true);
    });

    it("should handle different time zones correctly", () => {
      const date = new Date();

      date.setDate(date.getDate() + 1); // Tomorrow
      const isoString = date.toISOString();

      expect(validator.validate(isoString)).toBe(true);
    });

    it("should allow dates at end of today", () => {
      const endOfToday = new Date();

      endOfToday.setHours(23, 59, 59, 999);
      expect(validator.validate(endOfToday.toISOString())).toBe(true);
    });

    it("should allow dates at start of today", () => {
      const startOfToday = new Date();

      startOfToday.setHours(0, 0, 0, 0);
      expect(validator.validate(startOfToday.toISOString())).toBe(true);
    });
  });

  describe("defaultMessage", () => {
    it("should return appropriate error message", () => {
      const message = validator.defaultMessage();

      expect(message).toBe("Due date must be today or in the future");
    });
  });
});
