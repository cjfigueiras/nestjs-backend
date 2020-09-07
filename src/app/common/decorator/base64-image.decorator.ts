import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate, Validator } from 'class-validator';

@ValidatorConstraint({ name: 'base64Image', async: false })
export class Base64Image implements ValidatorConstraintInterface {

    validate(text: string, args: ValidationArguments) {
        const validator = new Validator();
        const matches = text.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || !validator.isArray(matches) || matches.length !== 3) {
            return false;
        }
        return validator.isBase64(matches[2]);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Invalid $property format, should be base64 encode!';
    }

}
