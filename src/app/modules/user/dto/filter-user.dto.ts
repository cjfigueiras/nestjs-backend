import { IsString } from 'class-validator';
import { IsValidEmail } from '../../../common/validation/email-validator';

export class FilterUserDto {

    @IsString()
    readonly name: string;

    @IsString()
    @IsValidEmail()
    readonly email: string;
}
