import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isUnicode', async: false })
export class IS_UNICODE implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) {
      return false;
    }

    return text.startsWith('U+') && text.length === 7;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return '?(Unicode)';
  }
}
