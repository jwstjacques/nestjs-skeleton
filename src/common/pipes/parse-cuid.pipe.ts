import { PipeTransform, Injectable } from "@nestjs/common";
import { InvalidCuidException } from "../exceptions";

/**
 * Validates that a string parameter is a valid CUID format
 *
 * CUID Format:
 * - Starts with 'c' (version identifier)
 * - 25 characters total
 * - Lowercase alphanumeric (a-z, 0-9)
 * - Example: clh9k7x2a0000qmxbzv0q0001
 *
 * @see https://github.com/paralleldrive/cuid
 */
@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // CUID regex: starts with 'c', followed by 24 lowercase alphanumeric characters
    const cuidRegex = /^c[a-z0-9]{24}$/;

    if (!cuidRegex.test(value)) {
      throw new InvalidCuidException(value);
    }

    return value;
  }
}
