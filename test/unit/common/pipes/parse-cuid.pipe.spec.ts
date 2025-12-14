import { InvalidCuidException } from "../../../../src/common/exceptions";
import { ParseCuidPipe } from "../../../../src/common/pipes/parse-cuid.pipe";

describe("ParseCuidPipe", () => {
  let pipe: ParseCuidPipe;

  beforeEach(() => {
    pipe = new ParseCuidPipe();
  });

  describe("transform", () => {
    describe("valid CUIDs", () => {
      it("should pass a valid CUID starting with 'c' and 24 lowercase alphanumeric characters", () => {
        const validCuid = "clh9k7x2a0000qmxbzv0q0001";

        expect(pipe.transform(validCuid)).toBe(validCuid);
      });

      it("should pass a CUID with all lowercase letters", () => {
        const validCuid = "cabcdefghijklmnopqrstuvwx";

        expect(pipe.transform(validCuid)).toBe(validCuid);
      });

      it("should pass a CUID with all numbers", () => {
        const validCuid = "c123456789012345678901234";

        expect(pipe.transform(validCuid)).toBe(validCuid);
      });

      it("should pass a CUID with mixed alphanumeric characters", () => {
        const validCuid = "c1a2b3c4d5e6f7g8h9i0j1k2l";

        expect(pipe.transform(validCuid)).toBe(validCuid);
      });
    });

    describe("invalid CUIDs", () => {
      it("should throw InvalidCuidException for CUID not starting with 'c'", () => {
        const invalidCuid = "dlh9k7x2a0000qmxbzv0q0001";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for CUID with uppercase letters", () => {
        const invalidCuid = "clh9K7x2a0000qmxbzv0q0001";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for CUID that is too short", () => {
        const invalidCuid = "clh9k7x2a0000qmxbzv0q000";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for CUID that is too long", () => {
        const invalidCuid = "clh9k7x2a0000qmxbzv0q00011";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for empty string", () => {
        const invalidCuid = "";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for string with special characters", () => {
        const invalidCuid = "clh9k7x2a0000qmxbzv0q000!";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for string with spaces", () => {
        const invalidCuid = "clh9k7x2a0000qmxbzv0q 001";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for string with hyphens", () => {
        const invalidCuid = "clh9k7x2a-000qmxbzv0q0001";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for null value", () => {
        const invalidCuid = null as unknown as string;

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
      });

      it("should throw InvalidCuidException for undefined value", () => {
        const invalidCuid = undefined as unknown as string;

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
      });

      it("should throw InvalidCuidException for CUID starting with uppercase C", () => {
        const invalidCuid = "Clh9k7x2a0000qmxbzv0q0001";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });

      it("should throw InvalidCuidException for numeric-only string without 'c' prefix", () => {
        const invalidCuid = "1234567890123456789012345";

        expect(() => pipe.transform(invalidCuid)).toThrow(InvalidCuidException);
        expect(() => pipe.transform(invalidCuid)).toThrow(`Invalid CUID format: ${invalidCuid}`);
      });
    });
  });
});
