import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class OneOf implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const array = args.constraints;

    return array.includes(value);
  }

  defaultMessage() {
    return 'Hoppsan? Belirtilen numaralari gir.';
  }
}
