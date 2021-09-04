import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class OneOfConstraint implements ValidatorConstraintInterface {
  private array: number[];
  constructor(array: number[]) {
    this.array = array;
  }

  validate(value: string) {
    for (let index = 0; index < this.array.length; index++) {
      const element = this.array[index].toString();
      if (value === element) {
        return true;
      }
    }
  }

  defaultMessage() {
    return 'Hoppsan? Belirtilen numaralari gir.';
  }
}

export function OneOfNumber(
  array: number[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: new OneOfConstraint(array),
    });
  };
}
