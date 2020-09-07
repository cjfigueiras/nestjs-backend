import { Controller, Post, Body, UsePipes, Param, UseInterceptors } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ILogin } from './interfaces/login.interface';
import { LoginDto } from './dto/login.dto';
import { ValidationPipe } from '../pipes/validation.pipe';
import { ErrorResult } from '../error-manager/errors';
import { ErrorManager } from '../error-manager/error-manager';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { classToPlain } from 'class-transformer';
import { SentryInterceptor } from '../interceptor/sentry-interceptor';

@Controller('auth')
@UseInterceptors(SentryInterceptor)
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @UsePipes(new ValidationPipe())
    signIn(@Body() loginDto: LoginDto) {
        const email: string = loginDto.email;
        const password: string = loginDto.password;
        return this.authService.signIn(email, password, loginDto.origin)
            .then((result: ILogin) => {
                return classToPlain(result);
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Post('forgot_password')
    @UsePipes(new ValidationPipe())
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const email: string = forgotPasswordDto.email;
        const replyUrl: string = forgotPasswordDto.replyUrl;
        return this.authService.forgotPassword(email, replyUrl)
            .then((result: string) => {
                return { message: result };
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Post('reset_password/:token')
    @UsePipes(new ValidationPipe())
    resetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        const password: string = resetPasswordDto.password;
        return this.authService.resetPassword(token, password)
            .then((result: string) => {
                return { message: result };
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }
}
