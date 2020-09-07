import { IsString, IsIn, IsByteLength, MinLength, ValidateIf, IsUUID } from 'class-validator';
import { IsValidEmail } from '../../../common/validation/email-validator';

export class CreateUserDto {
    @IsString()
    @IsByteLength(1, 100, {
        message: 'Invalid First Name length',
    })
    readonly firstName: string;

    @IsString()
    @IsByteLength(1, 100, {
        message: 'Invalid Last Name length',
    })
    readonly lastName: string;

    @IsString()
    @IsValidEmail()
    readonly email: string;

    @IsString()
    @MinLength(5, {
        message: 'Invalid password length',
    })
    password?: string;

    @IsString()
    readonly phone?: string;

    @IsIn(['root', 'adviser', 'admin_unit', 'admin_branch', 'admin_group', 'admin_cosme'], {
        message: 'Invalid role value, should be root, adviser, admin_unit, admin_branch, admin_group or admin_cosme',
    })
    readonly role: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'adviser' || user.role === 'admin_unit')
    unitId?: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'admin_branch')
    branchId?: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'admin_group')
    groupId?: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'admin_cosme')
    cosmeId?: string;

    @IsString()
    @ValidateIf(user => !user.password)
    readonly replyUrl?: string;
}
