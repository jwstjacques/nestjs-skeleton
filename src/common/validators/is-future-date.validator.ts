import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "isFutureDate", async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string): boolean {
    if (!dateString) {
      return true; // Let @IsOptional handle this
    }

    try {
      const date = new Date(dateString);
      const now = new Date();

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return false;
      }

      // Check if the date is in the future (or today)
      // We reset hours/minutes/seconds to allow dates on the current day
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return dateOnly >= nowOnly;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return "Due date must be today or in the future";
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
