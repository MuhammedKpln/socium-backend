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

    for (let index = 0; index < array.length; index++) {
      const element = array[index].toString();
      if (value === element) {
        return true;
      }
    }
  }

  defaultMessage() {
    return 'Hoppsan? Belirtilen numaralari gir.';
  }
}
