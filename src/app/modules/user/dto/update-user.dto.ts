import { IsString, IsIn, IsByteLength, MinLength, ValidateIf, IsUUID, IsOptional } from 'class-validator';
import { IsValidEmail } from '../../../common/validation/email-validator';

export class UpdateUserDto {
    @IsString()
    @IsByteLength(1, 100, {
        message: 'Invalid First Name length',
    })
    readonly firstName: string;

    @IsString()
    @IsByteLength(1, 100, {
        message: 'Invalid Last Name length',
    })
    readonly lastName?: string;

    @IsString()
    @IsValidEmail()
    readonly email: string;

    @IsString()
    @MinLength(5, {
        message: 'Invalid password length',
    })
    readonly password?: string;

    @IsString()
    @IsOptional()
    readonly phone?: string;

    @IsIn(['root', 'adviser', 'admin_unit', 'admin_branch', 'admin_group', 'admin_cosme', 'licence_manager', 'admin_company'], {
        message: 'Invalid role value, should be root, adviser, admin_unit, admin_branch, admin_group, admin_cosme, licence_manager or admin_company',
    })
    readonly role?: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'adviser' || user.role === 'admin_unit')
    unitId?: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'admin_branch')
    branchId?: string;

    @IsUUID()
    @ValidateIf(user => user.role === 'admin_group')
    groupId?: string;
}
