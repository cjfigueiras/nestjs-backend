import { IsString, IsOptional } from 'class-validator';
import { IsValidEmail } from '../../validation/email-validator';

export class LoginDto {

    @IsString()
    @IsValidEmail()
    readonly email: string;

    @IsString()
    readonly password: string;

    @IsOptional()
    @IsString()
    readonly origin?: string;

}
