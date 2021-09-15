import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class OneOf implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const array = args.constraints;

    return array.includes(value);
  }

  defaultMessage() {
    return 'Hoppsan? Belirtilen numaralari gir.';
  }
}
