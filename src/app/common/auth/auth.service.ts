import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ILogin } from './interfaces/login.interface';
import { ConfigService } from '../config/config.service';
import { ErrorResult } from '../error-manager/errors';
import { User } from '../../modules/user/user.entity';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class AuthService {

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    signIn(email: string, password: string, origin?: string) {
        return new Promise((resolve: (result: ILogin) => void, reject: (reason: ErrorResult) => void): void => {
            this.userService.signIn(email, password, origin).then((loggedUser: User) => {
                const response: ILogin = {
                    user: loggedUser,
                    token: this.createToken(loggedUser),
                    expiresIn: +this.configService.get('JWT_EXPIRES_IN'),
                };
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    forgotPassword(email: string, replyUrl: string) {
        return new Promise((resolve: (result: string) => void, reject: (reason: ErrorResult) => void): void => {
            this.userService.forgotPassword(email, replyUrl).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    resetPassword(token: string, password: string) {
        return new Promise((resolve: (result: string) => void, reject: (reason: ErrorResult) => void): void => {
            this.userService.resetPassword(token, password).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    createToken(user: User) {
        const token: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(token);
    }

    validate(payload: JwtPayload): Promise<User> {
        return new Promise((resolve: (result: any) => void, reject: (reason: ErrorResult) => void): void => {
            this.userService.getUserByEmail(payload.email).then((user: User) => {
                resolve(user);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
