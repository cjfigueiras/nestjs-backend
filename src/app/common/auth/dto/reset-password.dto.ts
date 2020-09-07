import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {

    @IsString()
    @MinLength(5, {
        message: 'Invalid password length',
    })
    readonly password: string;

}
